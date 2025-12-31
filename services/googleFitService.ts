
import { SleepRecord, SleepStage, HeartRateData } from "../types.ts";

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
    throw new Error("GOOGLE_SDK_LOAD_FAILED: 无法加载 Google 身份服务，请检查网络。");
  }

  public async ensureClientInitialized(): Promise<void> {
    if (this.tokenClient) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        await this.waitForGoogleReady();
        console.log("SomnoAI: Initializing Google Token Client...");
        
        this.tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES.join(" "),
          callback: (response: any) => {
            console.log("SomnoAI: Received Auth Response", response);
            if (response.error) {
              const errorMsg = response.error_description || response.error;
              console.error("SomnoAI Auth Error Callback:", errorMsg);
              this.authPromise?.reject(new Error(errorMsg));
              this.authPromise = null;
              return;
            }
            
            this.accessToken = response.access_token;
            if (this.accessToken) {
              sessionStorage.setItem('google_fit_token', this.accessToken);
              this.authPromise?.resolve(this.accessToken);
            } else {
              this.authPromise?.reject(new Error("MISSING_TOKEN: 响应中缺少访问令牌。"));
            }
            this.authPromise = null;
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
    await this.ensureClientInitialized();
    
    // 如果已有 Promise 在等待，先处理它
    if (this.authPromise) {
      this.authPromise.reject(new Error("REQUEST_CANCELLED: 新的授权请求已发起。"));
    }

    if (forcePrompt || !this.accessToken) {
      if (forcePrompt) this.logout(); // 强制模式下先登出
      
      return new Promise((resolve, reject) => {
        this.authPromise = { resolve, reject };
        console.log("SomnoAI: Requesting Access Token with prompt mode:", forcePrompt);
        
        // 对于未验证的应用，必须强制 prompt='select_account consent' 
        // 这样用户才能看到权限勾选列表，并点击“高级”按钮
        this.tokenClient.requestAccessToken({ 
          prompt: forcePrompt ? 'select_account consent' : ''
        });
      });
    }

    return this.accessToken;
  }

  private async fetchWithAuth(url: string, headers: any, options: RequestInit = {}) {
    const res = await fetch(url, { ...options, headers: { ...headers, ...options.headers } });
    
    if (res.status === 401) {
      this.logout();
      throw new Error("AUTH_EXPIRED: 令牌失效，请重新登录。");
    }
    
    if (res.status === 403) {
      // 特别注意：对于 Google Fit，403 通常意味着用户没有在授权页手动勾选对应的权限框
      throw new Error("PERMISSION_DENIED: 您未在 Google 授权页面手动勾选「查看睡眠」或「查看心率」复选框。请重新授权并确保勾选所有权限。");
    }
    
    return res;
  }

  async fetchSleepData(): Promise<Partial<SleepRecord>> {
    if (!this.accessToken) throw new Error("AUTH_EXPIRED");

    console.group("SomnoAI Lab: 信号聚合引擎");
    const now = new Date();
    const endTimeMillis = now.getTime();
    const startTimeMillis = endTimeMillis - 7 * 24 * 60 * 60 * 1000;
    const headers = { Authorization: `Bearer ${this.accessToken}`, "Content-Type": "application/json" };

    try {
      const aggregateUrl = "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate";
      const body = {
        aggregateBy: [
          { dataTypeName: "com.google.sleep.segment" },
          { dataTypeName: "com.google.heart_rate.bpm" },
          { dataTypeName: "com.google.calories.expended" }
        ],
        startTimeMillis,
        endTimeMillis,
        bucketByTime: { durationMillis: 86400000 }
      };

      const aggRes = await this.fetchWithAuth(aggregateUrl, headers, { method: 'POST', body: JSON.stringify(body) });
      const aggData = await aggRes.json();

      let targetBucket: any = null;
      if (aggData.bucket) {
        for (let i = aggData.bucket.length - 1; i >= 0; i--) {
          const bucket = aggData.bucket[i];
          const hasSleep = bucket.dataset[0]?.point?.length > 0;
          if (hasSleep) {
            targetBucket = bucket;
            break;
          }
        }
      }

      if (!targetBucket) {
        const sessionUrl = `https://www.googleapis.com/fitness/v1/users/me/sessions?startTime=${new Date(startTimeMillis).toISOString()}&endTime=${now.toISOString()}&activityType=72`;
        const sRes = await this.fetchWithAuth(sessionUrl, headers);
        const sData = await sRes.json();
        
        if (sData.session && sData.session.length > 0) {
          sData.session.sort((a: any, b: any) => Number(b.startTimeMillis) - Number(a.startTimeMillis));
          const latestS = sData.session[0];
          return await this.fetchRecordFromSession(latestS, headers);
        }
        
        console.groupEnd();
        throw new Error("DATA_NOT_FOUND: 权限正常，但 Fit 中最近 7 天没有任何睡眠数据。");
      }

      const sleepPoints = targetBucket.dataset[0].point;
      const hrPoints = targetBucket.dataset[1].point;
      const calPoints = targetBucket.dataset[2].point;

      let deep = 0, rem = 0, awake = 0;
      const stages: SleepStage[] = sleepPoints.map((p: any) => {
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

      const firstPoint = sleepPoints[0];
      const lastPoint = sleepPoints[sleepPoints.length - 1];
      const sessionStartMs = Number(BigInt(firstPoint.startTimeNanos) / 1000000n);
      const sessionEndMs = Number(BigInt(lastPoint.endTimeNanos) / 1000000n);
      const totalDuration = Math.round((sessionEndMs - sessionStartMs) / 60000);

      const hrVals = hrPoints.map((p: any) => p.value[0].fpVal || p.value[0].intVal) || [];
      const heartRate: HeartRateData = hrVals.length > 0 ? {
        average: Math.round(hrVals.reduce((a: number, b: number) => a + b, 0) / hrVals.length),
        resting: Math.min(...hrVals), min: Math.min(...hrVals), max: Math.max(...hrVals),
        history: hrPoints.slice(-15).map((p: any) => ({
          time: new Date(Number(BigInt(p.startTimeNanos) / 1000000n)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          bpm: Math.round(p.value[0].fpVal || p.value[0].intVal)
        }))
      } : { resting: 65, average: 70, min: 60, max: 95, history: [] };

      const calories = Math.round(calPoints.reduce((acc: number, p: any) => acc + (p.value[0].fpVal || 0), 0)) || 0;

      const score = Math.min(100, Math.round(
        (Math.min(480, totalDuration) / 480) * 40 + 
        (Math.min(25, (deep / Math.max(1, totalDuration)) * 100) / 25) * 35 + 
        (Math.min(20, (rem / Math.max(1, totalDuration)) * 100) / 20) * 25
      ));

      console.groupEnd();
      return {
        totalDuration,
        deepRatio: Math.round((deep / Math.max(1, totalDuration)) * 100),
        remRatio: Math.round((rem / Math.max(1, totalDuration)) * 100),
        efficiency: Math.round(((totalDuration - awake) / Math.max(1, totalDuration)) * 100),
        date: new Date(sessionStartMs).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }),
        stages, heartRate, calories, score
      };

    } catch (err: any) {
      console.groupEnd();
      throw err;
    }
  }

  private async fetchRecordFromSession(session: any, headers: any): Promise<Partial<SleepRecord>> {
    const startMs = Number(session.startTimeMillis);
    const endMs = Number(session.endTimeMillis);
    const duration = Math.round((endMs - startMs) / 60000);
    const startNanos = BigInt(startMs) * 1000000n;
    const endNanos = BigInt(endMs) * 1000000n;

    const hrUrl = `https://www.googleapis.com/fitness/v1/users/me/datasetSources/derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm/datasets/${startNanos}-${endNanos}`;
    let heartRate: HeartRateData = { resting: 65, average: 70, min: 60, max: 95, history: [] };
    try {
      const hrRes = await this.fetchWithAuth(hrUrl, headers);
      if (hrRes.ok) {
        const hrData = await hrRes.json();
        const vals = hrData.point?.map((p: any) => p.value[0].fpVal || p.value[0].intVal) || [];
        if (vals.length > 0) {
          heartRate = {
            average: Math.round(vals.reduce((a: number, b: number) => a + b, 0) / vals.length),
            resting: Math.min(...vals), min: Math.min(...vals), max: Math.max(...vals),
            history: hrData.point.slice(-15).map((p: any) => ({
              time: new Date(Number(BigInt(p.startTimeNanos) / 1000000n)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              bpm: Math.round(p.value[0].fpVal || p.value[0].intVal)
            }))
          };
        }
      }
    } catch (e) {}

    return {
      totalDuration: duration,
      date: new Date(startMs).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }),
      score: 75,
      stages: [{ name: '浅睡', duration, startTime: new Date(startMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }],
      heartRate,
      calories: 0
    };
  }

  public logout() {
    this.accessToken = null;
    sessionStorage.removeItem('google_fit_token');
  }
}

export const googleFit = new GoogleFitService();
