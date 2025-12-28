
import { SleepRecord, SleepStage, HeartRateData } from "../types.ts";

const CLIENT_ID = "312904526470-84ra3lld33sci0kvhset8523b0hdul1c.apps.googleusercontent.com";
const SCOPES = [
  "https://www.googleapis.com/auth/fitness.sleep.read",
  "https://www.googleapis.com/auth/fitness.heart_rate.read",
  "https://www.googleapis.com/auth/fitness.activity.read",
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
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    throw new Error("Google Identity Service SDK 加载失败，请检查网络并刷新。");
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
              return;
            }
            this.accessToken = response.access_token;
            if (this.accessToken) {
              sessionStorage.setItem('google_fit_token', this.accessToken);
              this.authPromise?.resolve(this.accessToken);
            } else {
              this.authPromise?.reject(new Error("未能获取 Access Token"));
            }
          }
        });
      } catch (err) {
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

  async fetchSleepData(): Promise<Partial<SleepRecord>> {
    if (!this.accessToken) throw new Error("授权失效，请重新连接。");

    const now = new Date();
    // 搜索最近 10 天的数据以防同步延迟
    const startTimeMillis = now.getTime() - 10 * 24 * 60 * 60 * 1000;
    const endTimeMillis = now.getTime();
    const headers = { Authorization: `Bearer ${this.accessToken}` };

    try {
      console.log("SomnoAI Labs: 正在探测生理特征流信号...");

      // 1. 获取所有可用的睡眠分期数据源
      const dsRes = await fetch("https://www.googleapis.com/fitness/v1/users/me/dataSources", { headers });
      const dsData = await dsRes.json();
      const sleepSources = dsData.dataSource?.filter((d: any) => d.dataType.name === "com.google.sleep.segment") || [];
      
      let sleepPoints: any[] = [];
      
      // 2. 穿透模式：从所有活跃源中抓取原始数据
      for (const source of sleepSources) {
        const sid = source.dataStreamId;
        const datasetId = `${BigInt(startTimeMillis) * BigInt(1000000)}-${BigInt(endTimeMillis) * BigInt(1000000)}`;
        const res = await fetch(`https://www.googleapis.com/fitness/v1/users/me/datasetSources/${sid}/datasets/${datasetId}`, { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.point && data.point.length > 0) {
            console.log(`已捕获源信号 [${sid}]: ${data.point.length} 个数据点`);
            // 选择最完整的数据集
            if (data.point.length > sleepPoints.length) {
              sleepPoints = data.point;
            }
          }
        }
      }

      if (sleepPoints.length === 0) {
        throw new Error("实验室未检测到最近 10 天的睡眠信号。请确保：1. 授权时勾选了所有复选框；2. 手机端 Google Fit 日记页显示有睡眠图表。");
      }

      // 3. 确定“最近一次睡眠”的时间窗口 (找最后一段连续的信号流)
      const lastPoint = sleepPoints[sleepPoints.length - 1];
      const endNanos = BigInt(lastPoint.endTimeNanos);
      let startNanos = BigInt(lastPoint.startTimeNanos);
      
      // 往前追溯，如果间隔超过 4 小时则认为是上一晚的睡眠，断开
      for (let i = sleepPoints.length - 1; i >= 0; i--) {
        const p = sleepPoints[i];
        const gap = startNanos - BigInt(p.endTimeNanos);
        if (gap > BigInt(4 * 3600 * 1000000000)) break; 
        startNanos = BigInt(p.startTimeNanos);
      }

      const startMs = Number(startNanos / BigInt(1000000));
      const endMs = Number(endNanos / BigInt(1000000));
      const totalDuration = Math.round((endMs - startMs) / 60000);

      // 4. 解析睡眠分期与架构
      let deepMins = 0;
      let remMins = 0;
      let awakeMins = 0;
      const currentSessionPoints = sleepPoints.filter(p => 
        BigInt(p.startTimeNanos) >= startNanos && BigInt(p.endTimeNanos) <= endNanos
      );

      const stages: SleepStage[] = currentSessionPoints.map((p: any) => {
        const type = p.value[0].intVal;
        const duration = Number((BigInt(p.endTimeNanos) - BigInt(p.startTimeNanos)) / BigInt(60000000000));
        const startTime = new Date(Number(BigInt(p.startTimeNanos) / BigInt(1000000))).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Google Fit Sleep Types: 1=Awake, 4=Light, 5=Deep, 6=REM
        if (type === 5) deepMins += duration;
        else if (type === 6) remMins += duration;
        else if (type === 1) awakeMins += duration;
        
        let stageName: SleepStage['name'] = '浅睡';
        if (type === 5) stageName = '深睡';
        else if (type === 6) stageName = 'REM';
        else if (type === 1) stageName = '清醒';
        
        return { name: stageName, duration, startTime };
      });

      // 5. 抓取代谢消耗 (24小时卡路里)
      const calDs = "derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended";
      const calDatasetId = `${BigInt(now.getTime() - 86400000) * BigInt(1000000)}-${BigInt(now.getTime()) * BigInt(1000000)}`;
      const calRes = await fetch(`https://www.googleapis.com/fitness/v1/users/me/datasetSources/${calDs}/datasets/${calDatasetId}`, { headers });
      let calories = 0;
      if (calRes.ok) {
        const calData = await calRes.json();
        calories = Math.round(calData.point?.reduce((acc: number, p: any) => acc + (p.value[0].fpVal || 0), 0) || 0);
      }

      // 6. 抓取生理脉搏 (心率)
      const hrDsId = "derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm";
      const hrRes = await fetch(`https://www.googleapis.com/fitness/v1/users/me/datasetSources/${hrDsId}/datasets/${startNanos}-${endNanos}`, { headers });
      
      let hrMetrics: HeartRateData = { resting: 60, average: 65, min: 55, max: 85, history: [] };
      if (hrRes.ok) {
        const hrJson = await hrRes.json();
        const pts = hrJson.point || [];
        const vals = pts.map((p: any) => p.value[0].fpVal).filter((v: number) => v > 30);
        if (vals.length > 0) {
          const avg = Math.round(vals.reduce((a: number, b: number) => a + b, 0) / vals.length);
          const min = Math.round(Math.min(...vals));
          hrMetrics = {
            average: avg,
            min: min,
            max: Math.round(Math.max(...vals)),
            resting: min, // 睡眠中的最低值通常作为静息参考
            history: pts.slice(-40).map((p: any) => ({
              time: new Date(Number(BigInt(p.startTimeNanos) / BigInt(1000000))).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              bpm: Math.round(p.value[0].fpVal)
            }))
          };
        }
      }

      // 7. 计算综合质量得分
      // 逻辑：时长权重 60%，效率权重 20%，架构(深睡/REM)权重 20%
      const durationScore = Math.min(100, (totalDuration / 480) * 100);
      const efficiency = totalDuration > 0 ? Math.round(((totalDuration - awakeMins) / totalDuration) * 100) : 0;
      const architectureScore = Math.min(100, (deepMins / Math.max(1, totalDuration) * 400) + (remMins / Math.max(1, totalDuration) * 400));
      const finalScore = Math.round((durationScore * 0.6) + (efficiency * 0.2) + (architectureScore * 0.2));

      return {
        totalDuration,
        score: finalScore,
        deepRatio: Math.round((deepMins / Math.max(1, totalDuration)) * 100),
        remRatio: Math.round((remMins / Math.max(1, totalDuration)) * 100),
        efficiency,
        date: new Date(startMs).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }),
        stages,
        heartRate: hrMetrics,
        calories,
        aiInsights: ["实验室：生理信号特征流同步成功。"]
      };

    } catch (err: any) {
      console.error("SomnoAI Labs - 遥测数据抓取失败:", err);
      throw err;
    }
  }

  public logout() {
    this.accessToken = null;
    sessionStorage.removeItem('google_fit_token');
  }
}

export const googleFit = new GoogleFitService();
