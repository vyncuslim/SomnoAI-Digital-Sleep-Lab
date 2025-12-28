
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
    throw new Error("Google Identity Services SDK (GSI) failed to load. Check your network or browser settings.");
  }

  public async ensureClientInitialized(): Promise<void> {
    if (this.tokenClient) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        console.log("SomnoAI Auth: Waiting for Google SDK readiness...");
        await this.waitForGoogleReady();
        
        console.log("SomnoAI Auth: Initializing Token Client with ClientID:", CLIENT_ID);
        this.tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES.join(" "),
          callback: (response: any) => {
            console.log("SomnoAI Auth: Received OAuth response from Google", response);
            
            if (response.error) {
              console.error("SomnoAI Auth Error:", response.error, response.error_description);
              this.authPromise?.reject(new Error(response.error_description || response.error));
              this.authPromise = null;
              return;
            }
            
            this.accessToken = response.access_token;
            if (this.accessToken) {
              console.log("SomnoAI Auth: Access Token successfully acquired.");
              sessionStorage.setItem('google_fit_token', this.accessToken);
              this.authPromise?.resolve(this.accessToken);
            } else {
              console.error("SomnoAI Auth: Response received but no access token found.");
              this.authPromise?.reject(new Error("No access token provided by Google."));
            }
            this.authPromise = null;
          }
        });
        console.log("SomnoAI Auth: Token Client initialized successfully.");
      } catch (err) {
        console.error("SomnoAI Auth: Initialization failed", err);
        this.initPromise = null;
        throw err;
      }
    })();
    return this.initPromise;
  }

  async authorize(forcePrompt = false): Promise<string> {
    console.log(`SomnoAI Auth: Authorization requested (forcePrompt: ${forcePrompt})`);
    
    if (this.accessToken && !forcePrompt) {
      console.log("SomnoAI Auth: Using existing valid token.");
      return this.accessToken;
    }
    
    await this.ensureClientInitialized();
    
    return new Promise((resolve, reject) => {
      // Clear any existing stale promise
      if (this.authPromise) {
        this.authPromise.reject(new Error("New authorization request initiated."));
      }
      
      this.authPromise = { resolve, reject };
      const config = { 
        prompt: forcePrompt ? 'select_account consent' : '' 
      };
      
      console.log("SomnoAI Auth: Invoking Google requestAccessToken dialog...", config);
      this.tokenClient.requestAccessToken(config);
    });
  }

  async fetchSleepData(): Promise<Partial<SleepRecord>> {
    if (!this.accessToken) throw new Error("AUTH_EXPIRED: 授权已失效");

    const now = new Date();
    const startTimeMillis = now.getTime() - 10 * 24 * 60 * 60 * 1000;
    const endTimeMillis = now.getTime();
    const headers = { Authorization: `Bearer ${this.accessToken}` };

    try {
      console.log("SomnoAI Lab: Probing physiological feature streams...");
      const dsRes = await fetch("https://www.googleapis.com/fitness/v1/users/me/dataSources", { headers });
      
      if (dsRes.status === 401) throw new Error("AUTH_EXPIRED: 令牌已过期");
      if (dsRes.status === 403) throw new Error("PERMISSION_DENIED: 权限未授予，请确保勾选所有复选框");
      
      const dsData = await dsRes.json();
      const sleepSources = dsData.dataSource?.filter((d: any) => d.dataType.name === "com.google.sleep.segment") || [];
      
      console.log(`[Diagnostic] Found ${sleepSources.length} active sleep data sources`);
      let sleepPoints: any[] = [];
      
      for (const source of sleepSources) {
        const sid = source.dataStreamId;
        const datasetId = `${BigInt(startTimeMillis) * BigInt(1000000)}-${BigInt(endTimeMillis) * BigInt(1000000)}`;
        const res = await fetch(`https://www.googleapis.com/fitness/v1/users/me/datasetSources/${sid}/datasets/${datasetId}`, { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.point && data.point.length > 0) {
            console.log(`[Diagnostic] Source ${sid} provided ${data.point.length} signal points`);
            if (data.point.length > sleepPoints.length) sleepPoints = data.point;
          }
        }
      }

      if (sleepPoints.length === 0) {
        throw new Error("DATA_NOT_FOUND: No recent sleep signals detected. Ensure Google Fit has synchronized data.");
      }

      const lastPoint = sleepPoints[sleepPoints.length - 1];
      const endNanos = BigInt(lastPoint.endTimeNanos);
      let startNanos = BigInt(lastPoint.startTimeNanos);
      
      for (let i = sleepPoints.length - 1; i >= 0; i--) {
        const p = sleepPoints[i];
        const gap = startNanos - BigInt(p.endTimeNanos);
        if (gap > BigInt(4 * 3600 * 1000000000)) break; 
        startNanos = BigInt(p.startTimeNanos);
      }

      const startMs = Number(startNanos / BigInt(1000000));
      const endMs = Number(endNanos / BigInt(1000000));
      const totalDuration = Math.round((endMs - startMs) / 60000);

      console.log(`[Diagnostic] Lock Period: ${new Date(startMs).toLocaleTimeString()} - ${new Date(endMs).toLocaleTimeString()} (${totalDuration} min)`);

      let deepMins = 0;
      let remMins = 0;
      let awakeMins = 0;
      const currentSessionPoints = sleepPoints.filter(p => 
        BigInt(p.startTimeNanos) >= startNanos && BigInt(p.endTimeNanos) <= endNanos
      );

      const stages: SleepStage[] = currentSessionPoints.map((p: any) => {
        const type = p.value[0].intVal;
        const pStart = Number(BigInt(p.startTimeNanos) / BigInt(1000000));
        const pEnd = Number(BigInt(p.endTimeNanos) / BigInt(1000000));
        const duration = Math.round((pEnd - pStart) / 60000);
        
        if (type === 5) deepMins += duration;
        else if (type === 6) remMins += duration;
        else if (type === 1) awakeMins += duration;
        
        return { 
          name: type === 5 ? '深睡' : type === 6 ? 'REM' : type === 1 ? '清醒' : '浅睡', 
          duration, 
          startTime: new Date(pStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        } as SleepStage;
      });

      console.log("SomnoAI Lab: Syncing heart rate feature stream...");
      const hrDsId = "derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm";
      const hrDatasetId = `${startNanos}-${endNanos}`;
      const hrRes = await fetch(`https://www.googleapis.com/fitness/v1/users/me/datasetSources/${hrDsId}/datasets/${hrDatasetId}`, { headers });
      
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
            resting: min, 
            history: pts.slice(-40).map((p: any) => ({
              time: new Date(Number(BigInt(p.startTimeNanos) / BigInt(1000000))).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              bpm: Math.round(p.value[0].fpVal)
            }))
          };
          console.log(`[Diagnostic] Heart rate stream captured: Avg ${avg} BPM`);
        }
      }

      const calDsId = "derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended";
      const calStart = BigInt(now.getTime() - 24 * 3600 * 1000) * BigInt(1000000);
      const calEnd = BigInt(now.getTime()) * BigInt(1000000);
      const calRes = await fetch(`https://www.googleapis.com/fitness/v1/users/me/datasetSources/${calDsId}/datasets/${calStart}-${calEnd}`, { headers });
      let calories = 0;
      if (calRes.ok) {
        const calJson = await calRes.json();
        calories = Math.round(calJson.point?.reduce((acc: number, p: any) => acc + (p.value[0].fpVal || 0), 0) || 0);
        console.log(`[Diagnostic] Captured 24H metabolism stream: ${calories} kcal`);
      }

      const durationScore = Math.min(100, (totalDuration / 480) * 100);
      const architectureScore = Math.min(100, ((deepMins + remMins) / Math.max(1, totalDuration)) * 250);
      const finalScore = Math.round(durationScore * 0.6 + architectureScore * 0.4);

      return {
        totalDuration,
        score: finalScore,
        deepRatio: Math.round((deepMins / Math.max(1, totalDuration)) * 100),
        remRatio: Math.round((remMins / Math.max(1, totalDuration)) * 100),
        efficiency: totalDuration > 0 ? Math.round(((totalDuration - awakeMins) / totalDuration) * 100) : 0,
        date: new Date(startMs).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }),
        stages,
        heartRate: hrMetrics,
        calories,
        aiInsights: ["实验室：生理信号特征流与代谢模型同步成功。"]
      };

    } catch (err: any) {
      console.error("[SomnoAI Engine Error]", err);
      throw err;
    }
  }

  public logout() {
    this.accessToken = null;
    sessionStorage.removeItem('google_fit_token');
  }
}

export const googleFit = new GoogleFitService();
