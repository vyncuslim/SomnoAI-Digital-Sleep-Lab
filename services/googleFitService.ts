
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
    throw new Error("Google Identity Services SDK (GSI) 加载超时。请确认您的浏览器未拦截 accounts.google.com 的脚本。");
  }

  public async ensureClientInitialized(): Promise<void> {
    if (this.tokenClient) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        await this.waitForGoogleReady();
        
        console.log("SomnoAI Auth: 正在配置 Google OAuth2 令牌客户端...");
        this.tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES.join(" "),
          callback: (response: any) => {
            console.log("SomnoAI Auth: 拦截到身份验证信号", response);
            
            if (response.error) {
              const errorDesc = response.error_description || response.error;
              console.error("SomnoAI Auth 授权终止:", errorDesc);
              this.authPromise?.reject(new Error(errorDesc));
              this.authPromise = null;
              return;
            }
            
            this.accessToken = response.access_token;
            if (this.accessToken) {
              console.log("SomnoAI Auth: 核心令牌提取成功。");
              sessionStorage.setItem('google_fit_token', this.accessToken);
              this.authPromise?.resolve(this.accessToken);
            } else {
              this.authPromise?.reject(new Error("授权负载中未包含有效令牌。"));
            }
            this.authPromise = null;
          },
          error_callback: (err: any) => {
            console.error("GSI Token Client Error:", err);
            this.authPromise?.reject(new Error("Google 身份验证端点发生内部错误。"));
            this.authPromise = null;
          }
        });
        console.log("SomnoAI Auth: 客户端初始化就绪。");
      } catch (err) {
        console.error("SomnoAI Auth: 初始化链路中断", err);
        this.initPromise = null;
        throw err;
      }
    })();
    return this.initPromise;
  }

  async authorize(forcePrompt = false): Promise<string> {
    console.log(`SomnoAI Auth: 触发授权序列 (强制重置: ${forcePrompt})`);
    
    if (this.accessToken && !forcePrompt) {
      return this.accessToken;
    }
    
    await this.ensureClientInitialized();
    
    return new Promise((resolve, reject) => {
      if (this.authPromise) {
        this.authPromise.reject(new Error("当前请求已被新授权序列中断。"));
      }
      
      this.authPromise = { resolve, reject };
      
      try {
        // Use select_account for manual triggers to allow switching
        this.tokenClient.requestAccessToken({ 
          prompt: forcePrompt ? 'select_account' : '' 
        });
      } catch (e) {
        console.error("SomnoAI Auth: 弹窗调起失败", e);
        reject(new Error("授权窗口被浏览器拦截，请在地址栏允许弹出窗口并重试。"));
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
      throw new Error("PERMISSION_DENIED: 权限拒绝。请务必勾选所有敏感数据复选框。");
    }
    return res;
  }

  async fetchSleepData(): Promise<Partial<SleepRecord>> {
    if (!this.accessToken) throw new Error("AUTH_EXPIRED: 令牌已过期");

    const now = new Date();
    // Scan last 7 days for the most complete physiological stream
    const startTimeMillis = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    const endTimeMillis = now.getTime();
    const headers = { Authorization: `Bearer ${this.accessToken}` };

    try {
      console.log("SomnoAI Lab: 正在检索生理特征流元数据...");
      const dsRes = await this.fetchWithAuth("https://www.googleapis.com/fitness/v1/users/me/dataSources", headers);
      const dsData = await dsRes.json();
      const sleepSources = dsData.dataSource?.filter((d: any) => d.dataType.name === "com.google.sleep.segment") || [];
      
      let allPoints: any[] = [];
      for (const source of sleepSources) {
        const sid = source.dataStreamId;
        const datasetId = `${BigInt(startTimeMillis) * 1000000n}-${BigInt(endTimeMillis) * 1000000n}`;
        const res = await this.fetchWithAuth(`https://www.googleapis.com/fitness/v1/users/me/datasetSources/${sid}/datasets/${datasetId}`, headers);
        if (res.ok) {
          const data = await res.json();
          if (data.point?.length > 0) allPoints = [...allPoints, ...data.point];
        }
      }

      if (allPoints.length === 0) {
        throw new Error("DATA_NOT_FOUND: 数据库中未发现睡眠信号。请检查 Google Fit 是否有最近的睡眠图表。");
      }

      // Sort and extract the latest contiguous session
      allPoints.sort((a, b) => Number(BigInt(a.startTimeNanos) - BigInt(b.startTimeNanos)));
      const latestPoint = allPoints[allPoints.length - 1];
      let sessionPoints = [latestPoint];
      let startNanos = BigInt(latestPoint.startTimeNanos);
      
      for (let i = allPoints.length - 2; i >= 0; i--) {
        const p = allPoints[i];
        if (startNanos - BigInt(p.endTimeNanos) > 4n * 3600n * 1000000000n) break;
        sessionPoints.unshift(p);
        startNanos = BigInt(p.startTimeNanos);
      }

      const startMs = Number(startNanos / 1000000n);
      const endMs = Number(BigInt(latestPoint.endTimeNanos) / 1000000n);
      const totalDuration = Math.round((endMs - startMs) / 60000);

      let deep = 0, rem = 0, awake = 0;
      const stages: SleepStage[] = sessionPoints.map((p: any) => {
        const type = p.value[0].intVal;
        const dur = Math.round((Number(BigInt(p.endTimeNanos) - BigInt(p.startTimeNanos)) / 1000000) / 60000);
        let name: SleepStage['name'] = '浅睡';
        if (type === 5) { name = '深睡'; deep += dur; }
        else if (type === 6) { name = 'REM'; rem += dur; }
        else if (type === 1 || type === 3) { name = '清醒'; awake += dur; }
        return { 
          name, duration: dur, 
          startTime: new Date(Number(BigInt(p.startTimeNanos) / 1000000n)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        };
      });

      // Heart Rate Analysis
      const hrDsId = "derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm";
      const hrRes = await this.fetchWithAuth(`https://www.googleapis.com/fitness/v1/users/me/datasetSources/${hrDsId}/datasets/${startNanos}-${BigInt(latestPoint.endTimeNanos)}`, headers);
      let hrMetrics: HeartRateData = { resting: 62, average: 68, min: 58, max: 90, history: [] };
      if (hrRes.ok) {
        const hrJson = await hrRes.json();
        const vals = hrJson.point?.map((p: any) => p.value[0].fpVal || p.value[0].intVal) || [];
        if (vals.length > 0) {
          const avg = Math.round(vals.reduce((a: number, b: number) => a + b, 0) / vals.length);
          hrMetrics = {
            average: avg, resting: Math.min(...vals), min: Math.min(...vals), max: Math.max(...vals),
            history: hrJson.point.slice(-24).map((p: any) => ({
              time: new Date(Number(BigInt(p.startTimeNanos) / 1000000n)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              bpm: Math.round(p.value[0].fpVal || p.value[0].intVal)
            }))
          };
        }
      }

      return {
        totalDuration,
        deepRatio: Math.round((deep / Math.max(1, totalDuration)) * 100),
        remRatio: Math.round((rem / Math.max(1, totalDuration)) * 100),
        efficiency: Math.round(((totalDuration - awake) / Math.max(1, totalDuration)) * 100),
        date: new Date(startMs).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }),
        stages, heartRate: hrMetrics,
        score: Math.min(100, Math.round((totalDuration / 480) * 40 + (deep / totalDuration) * 300 + (rem / totalDuration) * 200))
      };
    } catch (err: any) {
      console.error("SomnoAI Lab Error:", err);
      throw err;
    }
  }

  public logout() {
    this.accessToken = null;
    sessionStorage.removeItem('google_fit_token');
  }
}

export const googleFit = new GoogleFitService();
