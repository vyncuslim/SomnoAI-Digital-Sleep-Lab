import { SleepRecord, SleepStage, HeartRateData } from "../types.ts";

const CLIENT_ID = "1083641396596-7vqbum157qd03asbmare5gmrmlr020go.apps.googleusercontent.com";
const SCOPES = [
  "https://www.googleapis.com/auth/fitness.sleep.read",
  "https://www.googleapis.com/auth/fitness.heart_rate.read",
  "https://www.googleapis.com/auth/fitness.activity.read",
  "openid",
  "profile",
  "email"
];

declare var google: any;

/**
 * 安全地将纳米级时间戳转换为毫秒
 */
const toMillis = (nanos: any): number => {
  if (!nanos) return Date.now();
  try {
    // 兼容字符串和数字输入，优先尝试 BigInt 转换
    const bigNanos = typeof nanos === 'string' 
      ? BigInt(nanos.replace(/[^0-9]/g, '')) 
      : BigInt(Math.floor(Number(nanos)));
    return Number(bigNanos / 1000000n);
  } catch (e) {
    console.warn("SomnoAI: Time Conversion fallback used for", nanos);
    // 退回到普通数字处理
    return Math.floor(Number(nanos) / 1000000) || Date.now();
  }
};

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
    const maxAttempts = 50;
    for (let i = 0; i < maxAttempts; i++) {
      if (typeof google !== 'undefined' && google.accounts && google.accounts.oauth2) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 150));
    }
    throw new Error("GOOGLE_SDK_TIMEOUT: Google 身份验证组件加载超时，请检查网络。");
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
              const errorMsg = response.error_description || response.error;
              this.authPromise?.reject(new Error(errorMsg));
              this.authPromise = null;
              return;
            }
            
            this.accessToken = response.access_token;
            if (this.accessToken) {
              sessionStorage.setItem('google_fit_token', this.accessToken);
              this.authPromise?.resolve(this.accessToken);
            } else {
              this.authPromise?.reject(new Error("MISSING_TOKEN"));
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
    
    if (this.authPromise) {
      this.authPromise.reject(new Error("CANCELLED: New Auth Request"));
    }

    if (forcePrompt || !this.accessToken) {
      return new Promise((resolve, reject) => {
        this.authPromise = { resolve, reject };
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
      throw new Error("AUTH_EXPIRED");
    }
    if (res.status === 403) {
      throw new Error("PERMISSION_DENIED");
    }
    return res;
  }

  async fetchSleepData(): Promise<Partial<SleepRecord>> {
    if (!this.accessToken) throw new Error("AUTH_EXPIRED");

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
      if (aggData && Array.isArray(aggData.bucket)) {
        for (let i = aggData.bucket.length - 1; i >= 0; i--) {
          const bucket = aggData.bucket[i];
          if (bucket.dataset?.[0]?.point?.length > 0) {
            targetBucket = bucket;
            break;
          }
        }
      }

      if (!targetBucket) {
        throw new Error("DATA_NOT_FOUND");
      }

      const allSleepPoints = targetBucket.dataset[0].point || [];
      const hrPoints = targetBucket.dataset[1]?.point || [];
      const calPoints = targetBucket.dataset[2]?.point || [];

      let deep = 0, rem = 0, awake = 0;
      const stages: SleepStage[] = allSleepPoints.map((p: any) => {
        const type = p.value?.[0]?.intVal;
        const s = toMillis(p.startTimeNanos);
        const e = toMillis(p.endTimeNanos);
        const d = Math.max(0, Math.round((e - s) / 60000));
        
        let name: SleepStage['name'] = '浅睡';
        if (type === 5) { name = '深睡'; deep += d; }
        else if (type === 6) { name = 'REM'; rem += d; }
        else if (type === 1 || type === 3) { name = '清醒'; awake += d; }
        
        return { 
          name, 
          duration: d, 
          startTime: new Date(s).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        };
      });

      const sessionStartMs = allSleepPoints.length > 0 ? toMillis(allSleepPoints[0].startTimeNanos) : Date.now();
      const sessionEndMs = allSleepPoints.length > 0 ? toMillis(allSleepPoints[allSleepPoints.length - 1].endTimeNanos) : Date.now();
      const totalDuration = Math.max(1, Math.round((sessionEndMs - sessionStartMs) / 60000));

      const hrVals = hrPoints.map((p: any) => p.value?.[0]?.fpVal || p.value?.[0]?.intVal).filter((v: any) => typeof v === 'number') || [];
      const heartRate: HeartRateData = {
        average: hrVals.length > 0 ? Math.round(hrVals.reduce((a: number, b: number) => a + b, 0) / hrVals.length) : 70,
        resting: hrVals.length > 0 ? Math.min(...hrVals) : 65,
        min: hrVals.length > 0 ? Math.min(...hrVals) : 60,
        max: hrVals.length > 0 ? Math.max(...hrVals) : 100,
        history: hrPoints.slice(-15).map((p: any) => ({
          time: new Date(toMillis(p.startTimeNanos)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          bpm: Math.round(p.value?.[0]?.fpVal || p.value?.[0]?.intVal || 70)
        }))
      };

      const calories = Math.round(calPoints.reduce((acc: number, p: any) => acc + (p.value?.[0]?.fpVal || 0), 0)) || 0;

      const score = Math.min(100, Math.round(
        (Math.min(480, totalDuration) / 480) * 40 + 
        (Math.min(25, (deep / (totalDuration || 1)) * 100) / 25) * 35 + 
        (Math.min(20, (rem / (totalDuration || 1)) * 100) / 20) * 25
      )) || 70;

      return {
        totalDuration,
        deepRatio: totalDuration > 0 ? Math.round((deep / totalDuration) * 100) : 0,
        remRatio: totalDuration > 0 ? Math.round((rem / totalDuration) * 100) : 0,
        efficiency: totalDuration > 0 ? Math.round(((totalDuration - awake) / totalDuration) * 100) : 0,
        date: new Date(sessionStartMs).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }),
        stages, heartRate, calories, score
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