
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

  /**
   * Ensures the Google Identity Services client is initialized.
   * Uses a promise-based singleton pattern to prevent multiple initializations.
   */
  public async ensureClientInitialized(): Promise<void> {
    if (this.tokenClient) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        await this.waitForGoogleReady();
        console.log("Initializing Google OAuth2 Token Client...");
        
        this.tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES.join(" "),
          callback: (response: any) => {
            console.log("Google OAuth2 Callback Response:", response);
            if (response.error) {
              console.error("Authorization Error:", response.error);
              this.authPromise?.reject(new Error(response.error_description || response.error));
              return;
            }
            
            this.accessToken = response.access_token;
            if (this.accessToken) {
              sessionStorage.setItem('google_fit_token', this.accessToken);
              console.log("Access token received and stored.");
              this.authPromise?.resolve(this.accessToken);
            } else {
              this.authPromise?.reject(new Error("未能获取有效的 Access Token"));
            }
          },
          error_callback: (err: any) => {
            console.error("GSI Token Client Error:", err);
            this.authPromise?.reject(new Error(err.message || "OAuth 客户端错误"));
          }
        });
      } catch (err) {
        this.initPromise = null; // Allow retry on failure
        throw err;
      }
    })();

    return this.initPromise;
  }

  /**
   * Triggers the OAuth2 authorization flow.
   * @param forcePrompt Whether to force account selection and consent screen.
   */
  async authorize(forcePrompt = false): Promise<string> {
    // If we have a token and no prompt is forced, return the existing token
    if (this.accessToken && !forcePrompt) return this.accessToken;
    
    await this.ensureClientInitialized();

    return new Promise((resolve, reject) => {
      this.authPromise = { resolve, reject };
      console.log("Requesting access token with prompt:", forcePrompt ? 'select_account consent' : 'none');
      
      try {
        this.tokenClient.requestAccessToken({ 
          prompt: forcePrompt ? 'select_account consent' : '' 
        });
      } catch (err: any) {
        reject(new Error("发起授权请求失败: " + err.message));
      }
    });
  }

  async fetchSleepData(): Promise<Partial<SleepRecord>> {
    if (!this.accessToken) throw new Error("授权失效，请重新登录。");

    const now = new Date();
    const startTimeMillis = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    const endTimeMillis = now.getTime();
    const headers = { Authorization: `Bearer ${this.accessToken}` };

    try {
      const sessionsRes = await fetch(
        `https://www.googleapis.com/fitness/v1/users/me/sessions?startTime=${new Date(startTimeMillis).toISOString()}&endTime=${new Date(endTimeMillis).toISOString()}&type=72`,
        { headers }
      );
      
      if (sessionsRes.status === 401) {
        this.logout();
        throw new Error("登录已过期，请重新连接。");
      }

      const sessionsData = await sessionsRes.json();
      const sessions = sessionsData.session || [];

      if (sessions.length === 0) {
        throw new Error("Google Fit 实验室中暂无近期睡眠记录。请确保您的穿戴设备已同步数据到手机 Google Fit App。");
      }

      const latest = sessions[sessions.length - 1];
      const startMs = BigInt(latest.startTimeMillis);
      const endMs = BigInt(latest.endTimeMillis);
      const totalDuration = Number((endMs - startMs) / BigInt(60000));

      const dsRes = await fetch("https://www.googleapis.com/fitness/v1/users/me/dataSources", { headers });
      const dsData = await dsRes.json();
      
      const sleepDataSources = dsData.dataSource?.filter((d: any) => d.dataType.name === "com.google.sleep.segment") || [];
      const sleepDsId = sleepDataSources.length > 0 
        ? sleepDataSources[0].dataStreamId 
        : "derived:com.google.sleep.segment:com.google.android.gms:merged";

      const datasetId = `${startMs * BigInt(1000000)}-${endMs * BigInt(1000000)}`;
      const segmentRes = await fetch(
        `https://www.googleapis.com/fitness/v1/users/me/datasetSources/${sleepDsId}/datasets/${datasetId}`,
        { headers }
      );
      
      let stages: SleepStage[] = [];
      let deepMins = 0;
      let remMins = 0;
      let awakeMins = 0;

      if (segmentRes.ok) {
        const segData = await segmentRes.json();
        const points = segData.point || [];
        stages = points.map((p: any) => {
          const type = p.value[0].intVal;
          const pStart = BigInt(p.startTimeNanos);
          const pEnd = BigInt(p.endTimeNanos);
          const duration = Number((pEnd - pStart) / BigInt(60000000000));
          const startTime = new Date(Number(pStart / BigInt(1000000))).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          
          if (type === 5) { deepMins += duration; return { name: '深睡', duration, startTime }; }
          if (type === 6) { remMins += duration; return { name: 'REM', duration, startTime }; }
          if (type === 1) { awakeMins += duration; return { name: '清醒', duration, startTime }; }
          return { name: '浅睡', duration, startTime };
        });
      }

      if (stages.length === 0) {
        stages = [{ name: '浅睡', duration: totalDuration, startTime: new Date(Number(startMs)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }];
      }

      const hrDsId = "derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm";
      const hrUrl = `https://www.googleapis.com/fitness/v1/users/me/datasetSources/${hrDsId}/datasets/${startMs * BigInt(1000000)}-${endMs * BigInt(1000000)}`;
      const hrRes = await fetch(hrUrl, { headers });
      
      let hrMetrics: HeartRateData = { resting: 60, average: 65, min: 55, max: 85, history: [] };
      if (hrRes.ok) {
        const hrJson = await hrRes.json();
        const points = hrJson.point || [];
        const values = points.map((p: any) => p.value[0].fpVal).filter((v: number) => v > 30);
        if (values.length > 0) {
          hrMetrics = {
            average: Math.round(values.reduce((a: number, b: number) => a + b, 0) / values.length),
            min: Math.round(Math.min(...values)),
            max: Math.round(Math.max(...values)),
            resting: Math.round(Math.min(...values)),
            history: points.slice(-30).map((p: any) => ({
              time: new Date(Number(BigInt(p.startTimeNanos) / BigInt(1000000))).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              bpm: Math.round(p.value[0].fpVal)
            }))
          };
        }
      }

      return {
        totalDuration,
        score: Math.min(100, Math.round((totalDuration / 480) * 70 + (deepMins / Math.max(1, totalDuration)) * 150)),
        deepRatio: Math.round((deepMins / Math.max(1, totalDuration)) * 100),
        remRatio: Math.round((remMins / Math.max(1, totalDuration)) * 100),
        efficiency: totalDuration > 0 ? Math.round(((totalDuration - awakeMins) / totalDuration) * 100) : 0,
        date: latest.name || new Date(Number(startMs)).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }),
        stages,
        heartRate: hrMetrics,
        aiInsights: ["实验室：生理信号特征流同步成功。"]
      };

    } catch (err: any) {
      console.error("Fetch Data Failed:", err);
      throw err;
    }
  }

  public logout() {
    this.accessToken = null;
    sessionStorage.removeItem('google_fit_token');
  }
}

export const googleFit = new GoogleFitService();
