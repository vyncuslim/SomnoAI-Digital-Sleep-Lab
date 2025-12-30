
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
        this.tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES.join(" "),
          callback: (response: any) => {
            if (response.error) {
              this.authPromise?.reject(new Error(response.error_description || response.error));
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
          }
        });
      } catch (err) {
        console.error("SomnoAI Auth Init Failed", err);
        this.initPromise = null;
        throw err;
      }
    })();
    return this.initPromise;
  }

  async authorize(forcePrompt = false): Promise<string> {
    if (this.accessToken && !forcePrompt) return this.accessToken;
    await this.ensureClientInitialized();
    return new Promise((resolve, reject) => {
      this.authPromise = { resolve, reject };
      this.tokenClient.requestAccessToken({ prompt: forcePrompt ? 'select_account consent' : '' });
    });
  }

  private async fetchWithAuth(url: string, headers: any) {
    const res = await fetch(url, { headers });
    if (res.status === 401) throw new Error("AUTH_EXPIRED");
    if (res.status === 403) throw new Error("PERMISSION_DENIED");
    return res;
  }

  async fetchSleepData(): Promise<Partial<SleepRecord>> {
    if (!this.accessToken) throw new Error("AUTH_EXPIRED");

    console.group("SomnoAI Lab: 信号深度检索模式");
    const now = new Date();
    const startTimeMillis = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    const endTimeMillis = now.getTime();
    const headers = { Authorization: `Bearer ${this.accessToken}` };

    try {
      // 1. 扫描所有可用数据源以定位睡眠信号
      const dsRes = await this.fetchWithAuth("https://www.googleapis.com/fitness/v1/users/me/dataSources", headers);
      const dsData = await dsRes.json();
      
      // 这里的改进：同时支持 segment 和 session 数据类型，有些 App 记录方式不同
      const sleepSources = dsData.dataSource?.filter((d: any) => 
        d.dataType.name === "com.google.sleep.segment" || 
        d.dataType.name === "com.google.sleep.session"
      ) || [];
      
      console.log(`SomnoAI Lab: 检索到 ${sleepSources.length} 个潜在睡眠信号隧道`);
      
      let allPoints: any[] = [];
      const startNanos = BigInt(startTimeMillis) * 1000000n;
      const endNanos = BigInt(endTimeMillis) * 1000000n;

      for (const source of sleepSources) {
        const sid = source.dataStreamId;
        const res = await this.fetchWithAuth(`https://www.googleapis.com/fitness/v1/users/me/datasetSources/${sid}/datasets/${startNanos}-${endNanos}`, headers);
        if (res.ok) {
          const data = await res.json();
          if (data.point?.length > 0) {
            console.log(`SomnoAI Lab: 成功从隧道 [${sid.split(':').pop()}] 提取 ${data.point.length} 组特征`);
            allPoints = [...allPoints, ...data.point];
          }
        }
      }

      // 如果 dataSource 中没找到，尝试直接请求“合并后的睡眠段”派生数据 (这通常是 Fit 的最终结果)
      if (allPoints.length === 0) {
        console.log("SomnoAI Lab: 尝试直接访问派生睡眠信号池...");
        const mergedSid = "derived:com.google.sleep.segment:com.google.android.gms:merged";
        try {
           const res = await this.fetchWithAuth(`https://www.googleapis.com/fitness/v1/users/me/datasetSources/${mergedSid}/datasets/${startNanos}-${endNanos}`, headers);
           if (res.ok) {
             const data = await res.json();
             if (data.point?.length > 0) {
               console.log(`SomnoAI Lab: 从派生池捕获到 ${data.point.length} 组特征`);
               allPoints = data.point;
             }
           }
        } catch (e) {
          console.warn("SomnoAI Lab: 派生池访问受限");
        }
      }

      if (allPoints.length === 0) {
        console.groupEnd();
        throw new Error("DATA_NOT_FOUND");
      }

      // 2. 信号聚类分析：寻找最近的睡眠窗口
      allPoints.sort((a, b) => Number(BigInt(a.startTimeNanos) - BigInt(b.startTimeNanos)));
      const latest = allPoints[allPoints.length - 1];
      let session = [latest];
      let currentStartNanos = BigInt(latest.startTimeNanos);
      
      for (let i = allPoints.length - 2; i >= 0; i--) {
        const p = allPoints[i];
        const gap = currentStartNanos - BigInt(p.endTimeNanos);
        if (gap > 4n * 3600n * 1000000000n) break; // 超过4小时则视为不同会话
        session.unshift(p);
        currentStartNanos = BigInt(p.startTimeNanos);
      }

      const sessionStartMs = Number(currentStartNanos / 1000000n);
      const sessionEndMs = Number(BigInt(latest.endTimeNanos) / 1000000n);
      const durationMins = Math.round((sessionEndMs - sessionStartMs) / 60000);

      // 3. 解析睡眠架构阶段
      let deep = 0, rem = 0, awake = 0;
      const stages: SleepStage[] = session.map((p: any) => {
        const type = p.value[0].intVal;
        const s = Number(BigInt(p.startTimeNanos) / 1000000n);
        const e = Number(BigInt(p.endTimeNanos) / 1000000n);
        const d = Math.round((e - s) / 60000);
        
        let name: SleepStage['name'] = '浅睡';
        if (type === 5) { name = '深睡'; deep += d; }
        else if (type === 6) { name = 'REM'; rem += d; }
        else if (type === 1 || type === 3) { name = '清醒'; awake += d; }
        
        return { name, duration: d, startTime: new Date(s).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      });

      // 4. 生理体征同步 (心率/卡路里)
      let heartRate: HeartRateData = { resting: 60, average: 65, min: 55, max: 90, history: [] };
      try {
        const hrSid = "derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm";
        const hrRes = await this.fetchWithAuth(`https://www.googleapis.com/fitness/v1/users/me/datasetSources/${hrSid}/datasets/${currentStartNanos}-${BigInt(latest.endTimeNanos)}`, headers);
        if (hrRes.ok) {
          const hrJson = await hrRes.json();
          const vals = hrJson.point?.map((p: any) => p.value[0].fpVal || p.value[0].intVal) || [];
          if (vals.length > 0) {
            heartRate = {
              average: Math.round(vals.reduce((a: number, b: number) => a + b, 0) / vals.length),
              resting: Math.min(...vals), min: Math.min(...vals), max: Math.max(...vals),
              history: hrJson.point.slice(-20).map((p: any) => ({
                time: new Date(Number(BigInt(p.startTimeNanos) / 1000000n)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                bpm: Math.round(p.value[0].fpVal || p.value[0].intVal)
              }))
            };
          }
        }
      } catch (e) { console.warn("SomnoAI Lab: 心率同步跳过"); }

      let calories = 0;
      try {
        const calSid = "derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended";
        const calRes = await this.fetchWithAuth(`https://www.googleapis.com/fitness/v1/users/me/datasetSources/${calSid}/datasets/${currentStartNanos}-${BigInt(latest.endTimeNanos)}`, headers);
        if (calRes.ok) {
          const calJson = await calRes.json();
          calories = Math.round(calJson.point?.reduce((sum: number, p: any) => sum + (p.value[0].fpVal || 0), 0) || 0);
        }
      } catch (e) { console.warn("SomnoAI Lab: 代谢同步跳过"); }

      // 5. 质量评分计算
      const score = Math.min(100, Math.round(
        (Math.min(480, durationMins) / 480) * 40 + 
        (Math.min(25, (deep / Math.max(1, durationMins)) * 100) / 25) * 35 + 
        (Math.min(20, (rem / Math.max(1, durationMins)) * 100) / 20) * 25
      ));

      console.groupEnd();
      return {
        totalDuration: durationMins,
        deepRatio: Math.round((deep / Math.max(1, durationMins)) * 100),
        remRatio: Math.round((rem / Math.max(1, durationMins)) * 100),
        efficiency: Math.round(((durationMins - awake) / Math.max(1, durationMins)) * 100),
        date: new Date(sessionStartMs).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }),
        stages, heartRate, calories, score
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
