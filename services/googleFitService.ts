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
 * 工业级健壮的时间戳转换函数
 * 绝不使用 BigInt 处理非数字，防止 Uncaught RangeError
 */
const toMillis = (nanos: any): number => {
  if (nanos === null || nanos === undefined) return Date.now();
  
  // 如果已经是毫秒级数字
  if (typeof nanos === 'number' && !isNaN(nanos) && nanos < 2000000000000) {
    return Math.floor(nanos);
  }

  try {
    const str = String(nanos).replace(/[^0-9]/g, '');
    if (str.length === 0) return Date.now();

    // 如果长度超过 13 位，说明是纳秒
    if (str.length > 13) {
      try {
        return Number(BigInt(str) / 1000000n);
      } catch (e) {
        return Date.now();
      }
    }
    
    const val = parseInt(str, 10);
    return isNaN(val) ? Date.now() : val;
  } catch (e) {
    return Date.now();
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
    const maxAttempts = 100;
    for (let i = 0; i < maxAttempts; i++) {
      if (typeof google !== 'undefined' && google.accounts && google.accounts.oauth2) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error("GOOGLE_SDK_NOT_LOADED");
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
              this.authPromise?.reject(new Error("EMPTY_TOKEN"));
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
    if (forcePrompt || !this.accessToken) {
      return new Promise((resolve, reject) => {
        this.authPromise = { resolve, reject };
        this.tokenClient.requestAccessToken({ prompt: forcePrompt ? 'select_account consent' : '' });
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
    return res;
  }

  async fetchSleepData(): Promise<Partial<SleepRecord>> {
    if (!this.accessToken) throw new Error("AUTH_EXPIRED");
    const now = Date.now();
    const headers = { Authorization: `Bearer ${this.accessToken}`, "Content-Type": "application/json" };

    try {
      const aggregateUrl = "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate";
      const body = {
        aggregateBy: [
          { dataTypeName: "com.google.sleep.segment" },
          { dataTypeName: "com.google.heart_rate.bpm" },
          { dataTypeName: "com.google.calories.expended" }
        ],
        startTimeMillis: now - 7 * 24 * 60 * 60 * 1000,
        endTimeMillis: now,
        bucketByTime: { durationMillis: 86400000 }
      };

      const aggRes = await this.fetchWithAuth(aggregateUrl, headers, { method: 'POST', body: JSON.stringify(body) });
      const aggData = await aggRes.json();

      let targetBucket = aggData?.bucket?.slice().reverse().find((b: any) => b.dataset?.[0]?.point?.length > 0);
      if (!targetBucket) throw new Error("DATA_NOT_FOUND");

      const allSleepPoints = targetBucket.dataset?.[0]?.point || [];
      const hrPoints = targetBucket.dataset?.[1]?.point || [];
      const calPoints = targetBucket.dataset?.[2]?.point || [];

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
        return { name, duration: d, startTime: new Date(s).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      });

      const totalDuration = stages.reduce((acc, s) => acc + s.duration, 0) || 1;
      const hrVals = hrPoints.map((p: any) => p.value?.[0]?.fpVal || p.value?.[0]?.intVal).filter((v: any) => typeof v === 'number');
      
      const heartRate: HeartRateData = {
        average: hrVals.length ? Math.round(hrVals.reduce((a: number, b: number) => a + b, 0) / hrVals.length) : 70,
        resting: hrVals.length ? Math.min(...hrVals) : 65,
        min: hrVals.length ? Math.min(...hrVals) : 60,
        max: hrVals.length ? Math.max(...hrVals) : 100,
        history: hrPoints.slice(-12).map((p: any) => ({
          time: new Date(toMillis(p.startTimeNanos)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          bpm: Math.round(p.value?.[0]?.fpVal || p.value?.[0]?.intVal || 70)
        }))
      };

      return {
        totalDuration,
        deepRatio: Math.round((deep / totalDuration) * 100),
        remRatio: Math.round((rem / totalDuration) * 100),
        efficiency: Math.round(((totalDuration - awake) / totalDuration) * 100),
        date: new Date(toMillis(allSleepPoints[0]?.startTimeNanos)).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }),
        stages, heartRate, calories: Math.round(calPoints.reduce((acc: number, p: any) => acc + (p.value?.[0]?.fpVal || 0), 0)),
        score: Math.min(100, Math.round((deep / totalDuration) * 200 + (rem / totalDuration) * 150 + (heartRate.resting < 70 ? 10 : 0)))
      };
    } catch (err) {
      throw err;
    }
  }

  public logout() {
    this.accessToken = null;
    sessionStorage.removeItem('google_fit_token');
  }
}

export const googleFit = new GoogleFitService();