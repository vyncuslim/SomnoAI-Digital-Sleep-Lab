
import { SleepRecord, SleepStage, HeartRateData } from "../types.ts";

const CLIENT_ID = "312904526470-84ra3lld33sci0kvhset8523b0hdul1c.apps.googleusercontent.com";
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
    throw new Error("Google Identity Services SDK (GSI) 加载超时。请检查网络或是否启用了广告拦截插件。");
  }

  public async ensureClientInitialized(): Promise<void> {
    if (this.tokenClient) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        await this.waitForGoogleReady();
        
        console.log("SomnoAI Auth: 正在初始化 Google OAuth2 令牌客户端...");
        this.tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES.join(" "),
          callback: (response: any) => {
            console.log("SomnoAI Auth: 收到身份验证响应", response);
            
            if (response.error) {
              const errorDesc = response.error_description || response.error;
              console.error("SomnoAI Auth 授权异常:", errorDesc);
              this.authPromise?.reject(new Error(errorDesc));
              this.authPromise = null;
              return;
            }
            
            this.accessToken = response.access_token;
            if (this.accessToken) {
              console.log("SomnoAI Auth: 授权令牌提取成功。");
              sessionStorage.setItem('google_fit_token', this.accessToken);
              this.authPromise?.resolve(this.accessToken);
            } else {
              this.authPromise?.reject(new Error("授权响应中未找到有效的访问令牌。"));
            }
            this.authPromise = null;
          }
        });
        console.log("SomnoAI Auth: 客户端初始化就绪。");
      } catch (err) {
        console.error("SomnoAI Auth: 初始化关键错误", err);
        this.initPromise = null;
        throw err;
      }
    })();
    return this.initPromise;
  }

  async authorize(forcePrompt = false): Promise<string> {
    console.log(`SomnoAI Auth: 执行授权逻辑 (强制弹窗: ${forcePrompt})`);
    
    if (this.accessToken && !forcePrompt) {
      return this.accessToken;
    }
    
    await this.ensureClientInitialized();
    
    return new Promise((resolve, reject) => {
      if (this.authPromise) {
        this.authPromise.reject(new Error("授权请求已被后续请求覆盖。"));
      }
      
      this.authPromise = { resolve, reject };
      
      const config = { 
        prompt: forcePrompt ? 'select_account consent' : '',
        ux_mode: 'popup'
      };
      
      try {
        console.log("SomnoAI Auth: 正在请求访问令牌...");
        this.tokenClient.requestAccessToken(config);
      } catch (e) {
        console.error("SomnoAI Auth: 调起弹窗失败", e);
        reject(new Error("无法打开授权弹窗，请检查浏览器是否拦截了弹出窗口。"));
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
      throw new Error("PERMISSION_DENIED: 权限不足。请在授权时务必勾选所有复选框。");
    }
    return res;
  }

  async fetchSleepData(): Promise<Partial<SleepRecord>> {
    if (!this.accessToken) throw new Error("AUTH_EXPIRED: 令牌已过期");

    const now = new Date();
    // Look back 7 days to find the most recent session
    const startTimeMillis = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    const endTimeMillis = now.getTime();
    const headers = { Authorization: `Bearer ${this.accessToken}` };

    try {
      console.log("SomnoAI Lab: 探测生理特征流...");
      const dsRes = await this.fetchWithAuth("https://www.googleapis.com/fitness/v1/users/me/dataSources", headers);
      const dsData = await dsRes.json();
      const sleepSources = dsData.dataSource?.filter((d: any) => d.dataType.name === "com.google.sleep.segment") || [];
      
      let allSleepPoints: any[] = [];
      for (const source of sleepSources) {
        const sid = source.dataStreamId;
        const datasetId = `${BigInt(startTimeMillis) * 1000000n}-${BigInt(endTimeMillis) * 1000000n}`;
        const res = await this.fetchWithAuth(`https://www.googleapis.com/fitness/v1/users/me/datasetSources/${sid}/datasets/${datasetId}`, headers);
        if (res.ok) {
          const data = await res.json();
          if (data.point && data.point.length > 0) {
            allSleepPoints = [...allSleepPoints, ...data.point];
          }
        }
      }

      if (allSleepPoints.length === 0) {
        throw new Error("DATA_NOT_FOUND: 未检测到睡眠信号。请确认 Google Fit 账户已有最近的睡眠记录。");
      }

      // Sort points by start time to reconstruct session
      allSleepPoints.sort((a, b) => Number(BigInt(a.startTimeNanos) - BigInt(b.startTimeNanos)));

      // Reconstruct the most recent session (points closer than 4 hours apart)
      let lastPoint = allSleepPoints[allSleepPoints.length - 1];
      let sessionPoints: any[] = [lastPoint];
      let sessionStartNanos = BigInt(lastPoint.startTimeNanos);
      const sessionEndNanos = BigInt(lastPoint.endTimeNanos);

      for (let i = allSleepPoints.length - 2; i >= 0; i--) {
        const p = allSleepPoints[i];
        const gap = sessionStartNanos - BigInt(p.endTimeNanos);
        if (gap > 4n * 3600n * 1000000000n) break; 
        sessionPoints.unshift(p);
        sessionStartNanos = BigInt(p.startTimeNanos);
      }

      const startMs = Number(sessionStartNanos / 1000000n);
      const endMs = Number(sessionEndNanos / 1000000n);
      const totalDuration = Math.round((endMs - startMs) / 60000);

      let deepMins = 0;
      let remMins = 0;
      let awakeMins = 0;
      
      const stages: SleepStage[] = sessionPoints.map((p: any) => {
        const type = p.value[0].intVal;
        const pStart = Number(BigInt(p.startTimeNanos) / 1000000n);
        const pEnd = Number(BigInt(p.endTimeNanos) / 1000000n);
        const duration = Math.round((pEnd - pStart) / 60000);
        
        let stageName: SleepStage['name'] = '浅睡';
        if (type === 5) { stageName = '深睡'; deepMins += duration; }
        else if (type === 6) { stageName = 'REM'; remMins += duration; }
        else if (type === 1 || type === 3) { stageName = '清醒'; awakeMins += duration; }

        return { 
          name: stageName, 
          duration, 
          startTime: new Date(pStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        };
      });

      // Heart Rate Parsing
      const hrDsId = "derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm";
      const hrDatasetId = `${sessionStartNanos}-${sessionEndNanos}`;
      const hrRes = await this.fetchWithAuth(`https://www.googleapis.com/fitness/v1/users/me/datasetSources/${hrDsId}/datasets/${hrDatasetId}`, headers);
      
      let hrMetrics: HeartRateData = { resting: 60, average: 65, min: 55, max: 85, history: [] };
      if (hrRes.ok) {
        const hrJson = await hrRes.json();
        const pts = hrJson.point || [];
        const vals = pts.map((p: any) => p.value[0].fpVal || p.value[0].intVal).filter((v: number) => v > 30 && v < 220);
        
        if (vals.length > 0) {
          const avg = Math.round(vals.reduce((a: number, b: number) => a + b, 0) / vals.length);
          const min = Math.round(Math.min(...vals));
          const max = Math.round(Math.max(...vals));
          const step = Math.max(1, Math.floor(pts.length / 50));
          const history = pts.filter((_: any, i: number) => i % step === 0).map((p: any) => ({
            time: new Date(Number(BigInt(p.startTimeNanos) / 1000000n)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            bpm: Math.round(p.value[0].fpVal || p.value[0].intVal)
          }));
          hrMetrics = { average: avg, min, max, resting: min, history };
        }
      }

      // 24H Calories Parsing
      const calDsId = "derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended";
      const calStart = BigInt(now.getTime() - 24 * 3600 * 1000) * 1000000n;
      const calEnd = BigInt(now.getTime()) * 1000000n;
      const calRes = await this.fetchWithAuth(`https://www.googleapis.com/fitness/v1/users/me/datasetSources/${calDsId}/datasets/${calStart}-${calEnd}`, headers);
      let calories = 0;
      if (calRes.ok) {
        const calJson = await calRes.json();
        calories = Math.round(calJson.point?.reduce((acc: number, p: any) => acc + (p.value[0].fpVal || 0), 0) || 0);
      }

      // Quality Score Calculation
      const durationHours = totalDuration / 60;
      let durationScore = 0;
      if (durationHours >= 7 && durationHours <= 9) durationScore = 100;
      else if (durationHours > 9) durationScore = 90 - (durationHours - 9) * 10;
      else durationScore = (durationHours / 7) * 100;

      const efficiency = totalDuration > 0 ? Math.round(((totalDuration - awakeMins) / totalDuration) * 100) : 0;
      const archRatio = (deepMins + remMins) / Math.max(1, totalDuration);
      const architectureScore = Math.min(100, archRatio * 200);

      const finalScore = Math.max(0, Math.min(100, Math.round(durationScore * 0.4 + efficiency * 0.3 + architectureScore * 0.3)));

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
        aiInsights: ["实验室：生理信号解码完成，同步代谢模型中。"]
      };

    } catch (err: any) {
      console.error("[SomnoAI Engine Critical Failure]", err);
      throw err;
    }
  }

  public logout() {
    this.accessToken = null;
    sessionStorage.removeItem('google_fit_token');
  }
}

export const googleFit = new GoogleFitService();
