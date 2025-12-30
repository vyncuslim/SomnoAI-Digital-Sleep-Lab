
import { SleepRecord, SleepStage, HeartRateData } from "../types.ts";

// Google Fit OAuth Client ID
const CLIENT_ID = "1083641396596-7vqbum157qd03asbmare5gmrmlr020go.apps.googleusercontent.com";
const SCOPES = [
  "https://www.googleapis.com/auth/fitness.sleep.read",
  "https://www.googleapis.com/auth/fitness.heart_rate.read",
  "https://www.googleapis.com/auth/fitness.activity.read",
  "https://www.googleapis.com/auth/fitness.body.read",
  "openid",
  "profile",
  "email"
];

declare var google: any;

export class GoogleFitService {
  private accessToken: string | null = null;
  private tokenClient: any = null;
  private initPromise: Promise<void> | null = null;
  private authPromise: { resolve: (t: string) => void; reject: (e: Error) => void } | null = null;

  constructor() {
    this.accessToken = sessionStorage.getItem('google_fit_token');
  }

  public hasToken(): boolean {
    return !!this.accessToken;
  }

  private async waitForGoogleReady(): Promise<void> {
    const maxAttempts = 100;
    for (let i = 0; i < maxAttempts; i++) {
      if (typeof google !== 'undefined' && google.accounts && google.accounts.oauth2) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error("Google Identity Services SDK 加载超时。请确认已在 index.html 中正确引入脚本。");
  }

  public async ensureClientInitialized(): Promise<void> {
    if (this.tokenClient) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        await this.waitForGoogleReady();
        
        console.log("SomnoAI Auth: 正在初始化令牌客户端，ID:", CLIENT_ID);
        this.tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES.join(" "),
          callback: (response: any) => {
            console.group("SomnoAI Auth: 授权响应");
            console.log(response);
            console.groupEnd();
            
            if (response.error) {
              const errorDesc = response.error_description || response.error;
              this.authPromise?.reject(new Error(errorDesc));
              this.authPromise = null;
              return;
            }
            
            this.accessToken = response.access_token;
            if (this.accessToken) {
              sessionStorage.setItem('google_fit_token', this.accessToken);
              this.authPromise?.resolve(this.accessToken);
            } else {
              this.authPromise?.reject(new Error("授权响应中缺失 access_token"));
            }
            this.authPromise = null;
          },
          error_callback: (err: any) => {
            console.error("GSI Client Internal Error:", err);
            this.authPromise?.reject(new Error("Google 服务内部错误"));
            this.authPromise = null;
          }
        });
      } catch (err) {
        console.error("SomnoAI Auth: 初始化链路失败", err);
        this.initPromise = null;
        throw err;
      }
    })();
    return this.initPromise;
  }

  async authorize(forcePrompt = false): Promise<string> {
    if (this.accessToken && !forcePrompt) {
      return this.accessToken;
    }
    
    await this.ensureClientInitialized();
    
    return new Promise((resolve, reject) => {
      if (this.authPromise) {
        this.authPromise.reject(new Error("请求被新授权序列中断"));
      }
      
      this.authPromise = { resolve, reject };
      
      try {
        const requestConfig = {
          prompt: forcePrompt ? 'select_account consent' : '',
        };
        this.tokenClient.requestAccessToken(requestConfig);
      } catch (e) {
        reject(new Error("授权窗口调用失败，请检查浏览器弹出拦截设置。"));
        this.authPromise = null;
      }
    });
  }

  private async fetchWithAuth(url: string, headers: any) {
    const res = await fetch(url, { headers });
    if (res.status === 401) {
      throw new Error("AUTH_EXPIRED: 令牌已过期");
    }
    if (res.status === 403) {
      throw new Error("PERMISSION_DENIED: 权限不足。请在登录时勾选所有健康数据权限。");
    }
    return res;
  }

  async fetchSleepData(): Promise<Partial<SleepRecord>> {
    if (!this.accessToken) throw new Error("AUTH_EXPIRED: 未检测到有效令牌");

    console.group("SomnoAI Lab: 数据特征流提取开始");
    
    const now = new Date();
    const startTimeMillis = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    const endTimeMillis = now.getTime();
    const headers = { Authorization: `Bearer ${this.accessToken}` };

    try {
      // 1. 获取数据源
      const dsRes = await this.fetchWithAuth("https://www.googleapis.com/fitness/v1/users/me/dataSources", headers);
      const dsData = await dsRes.json();
      const sleepSources = dsData.dataSource?.filter((d: any) => d.dataType.name === "com.google.sleep.segment") || [];
      console.log(`SomnoAI Lab: 发现 ${sleepSources.length} 个睡眠数据源`);
      
      let allSleepPoints: any[] = [];
      const startTimeNanos = BigInt(startTimeMillis) * 1000000n;
      const endTimeNanos = BigInt(endTimeMillis) * 1000000n;

      // 2. 遍历数据源抓取点位
      for (const source of sleepSources) {
        const sid = source.dataStreamId;
        console.log(`SomnoAI Lab: 正在从 ${sid} 检索点位...`);
        const res = await this.fetchWithAuth(`https://www.googleapis.com/fitness/v1/users/me/datasetSources/${sid}/datasets/${startTimeNanos}-${endTimeNanos}`, headers);
        if (res.ok) {
          const data = await res.json();
          if (data.point?.length > 0) {
            console.log(`SomnoAI Lab: 从 ${sid} 捕获到 ${data.point.length} 个点位`);
            allSleepPoints = [...allSleepPoints, ...data.point];
          }
        }
      }

      if (allSleepPoints.length === 0) {
        console.warn("SomnoAI Lab: 最终信号池为空");
        console.groupEnd();
        throw new Error("DATA_NOT_FOUND: 未检测到睡眠信号。请确认 Google Fit 账户已有最近的睡眠记录。");
      }

      // 3. 时间序列分析：锁定最近的一次连贯会话
      allSleepPoints.sort((a, b) => Number(BigInt(a.startTimeNanos) - BigInt(b.startTimeNanos)));
      const latestPoint = allSleepPoints[allSleepPoints.length - 1];
      let sessionPoints = [latestPoint];
      let clusterStartTimeNanos = BigInt(latestPoint.startTimeNanos);
      
      for (let i = allSleepPoints.length - 2; i >= 0; i--) {
        const p = allSleepPoints[i];
        const gap = clusterStartTimeNanos - BigInt(p.endTimeNanos);
        if (gap > 4n * 3600n * 1000000000n) break; // 超过4小时断开
        sessionPoints.unshift(p);
        clusterStartTimeNanos = BigInt(p.startTimeNanos);
      }

      const sessionStartMs = Number(clusterStartTimeNanos / 1000000n);
      const sessionEndMs = Number(BigInt(latestPoint.endTimeNanos) / 1000000n);
      const totalDurationMins = Math.round((sessionEndMs - sessionStartMs) / 60000);
      console.log(`SomnoAI Lab: 锁定会话架构，总时长 ${totalDurationMins} 分钟`);

      // 4. 解析睡眠阶段
      let deepMins = 0, remMins = 0, awakeMins = 0;
      const stages: SleepStage[] = sessionPoints.map((p: any) => {
        const type = p.value[0].intVal;
        const start = Number(BigInt(p.startTimeNanos) / 1000000n);
        const end = Number(BigInt(p.endTimeNanos) / 1000000n);
        const dur = Math.round((end - start) / 60000);
        
        let name: SleepStage['name'] = '浅睡';
        if (type === 5) { name = '深睡'; deepMins += dur; }
        else if (type === 6) { name = 'REM'; remMins += dur; }
        else if (type === 1 || type === 3) { name = '清醒'; awakeMins += dur; }
        
        return { name, duration: dur, startTime: new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      });

      // 5. 获取心率数据
      let hrMetrics: HeartRateData = { resting: 60, average: 65, min: 55, max: 90, history: [] };
      try {
        console.log("SomnoAI Lab: 正在拉取心率特征流...");
        const hrDsId = "derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm";
        const hrRes = await this.fetchWithAuth(`https://www.googleapis.com/fitness/v1/users/me/datasetSources/${hrDsId}/datasets/${clusterStartTimeNanos}-${BigInt(latestPoint.endTimeNanos)}`, headers);
        if (hrRes.ok) {
          const hrJson = await hrRes.json();
          const vals = hrJson.point?.map((p: any) => p.value[0].fpVal || p.value[0].intVal) || [];
          if (vals.length > 0) {
            hrMetrics = {
              average: Math.round(vals.reduce((a: number, b: number) => a + b, 0) / vals.length),
              resting: Math.min(...vals), 
              min: Math.min(...vals), 
              max: Math.max(...vals),
              history: hrJson.point.slice(-30).map((p: any) => ({
                time: new Date(Number(BigInt(p.startTimeNanos) / 1000000n)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                bpm: Math.round(p.value[0].fpVal || p.value[0].intVal)
              }))
            };
            console.log(`SomnoAI Lab: 心率特征解析完成，均值 ${hrMetrics.average} BPM`);
          }
        }
      } catch (hrErr) { 
        console.warn("SomnoAI Lab: 心率特征流读取受限", hrErr); 
      }

      // 6. 获取今日卡路里消耗 (代谢指标)
      let dailyCalories = 0;
      try {
        console.log("SomnoAI Lab: 正在检索代谢能耗...");
        const calDsId = "derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended";
        const dayStart = new Date(sessionStartMs);
        dayStart.setHours(0,0,0,0);
        const dayEnd = new Date(sessionStartMs);
        dayEnd.setHours(23,59,59,999);
        const calDatasetId = `${BigInt(dayStart.getTime()) * 1000000n}-${BigInt(dayEnd.getTime()) * 1000000n}`;
        const calRes = await this.fetchWithAuth(`https://www.googleapis.com/fitness/v1/users/me/datasetSources/${calDsId}/datasets/${calDatasetId}`, headers);
        if (calRes.ok) {
          const calJson = await calRes.json();
          dailyCalories = Math.round(calJson.point?.reduce((sum: number, p: any) => sum + (p.value[0].fpVal || 0), 0) || 0);
          console.log(`SomnoAI Lab: 代谢能耗锁定为 ${dailyCalories} KCAL`);
        }
      } catch (calErr) { 
        console.warn("SomnoAI Lab: 代谢流读取受限", calErr); 
      }

      // 7. 计算综合评分
      const score = Math.min(100, Math.round(
        (Math.min(480, totalDurationMins) / 480) * 45 + 
        (Math.min(25, (deepMins / Math.max(1, totalDurationMins)) * 100) / 25) * 30 + 
        (Math.min(20, (remMins / Math.max(1, totalDurationMins)) * 100) / 20) * 25
      ));

      console.groupEnd();
      return {
        totalDuration: totalDurationMins,
        deepRatio: Math.round((deepMins / Math.max(1, totalDurationMins)) * 100),
        remRatio: Math.round((remMins / Math.max(1, totalDurationMins)) * 100),
        efficiency: Math.round(((totalDurationMins - awakeMins) / Math.max(1, totalDurationMins)) * 100),
        date: new Date(sessionStartMs).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }),
        stages, 
        heartRate: hrMetrics, 
        calories: dailyCalories,
        score
      };
    } catch (err: any) {
      console.groupEnd();
      throw err;
    }
  }

  public logout() {
    this.accessToken = null;
    sessionStorage.removeItem('google_fit_token');
  }
}

export const googleFit = new GoogleFitService();
