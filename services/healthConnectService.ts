import { SleepRecord, SleepStage } from "../types.ts";

const CLIENT_ID = "1083641396596-7vqbum157qd03asbmare5gmrmlr020go.apps.googleusercontent.com";
const SCOPES = [
  "https://www.googleapis.com/auth/fitness.sleep.read",
  "https://www.googleapis.com/auth/fitness.heart_rate.read",
  "https://www.googleapis.com/auth/fitness.activity.read",
  "https://www.googleapis.com/auth/fitness.body.read",
  "https://www.googleapis.com/auth/fitness.location.read",
  "openid",
  "profile",
  "email"
];

declare var google: any;

const nanostampsToMillis = (nanos: any): number => {
  if (nanos === null || nanos === undefined) return Date.now();
  try {
    const n = BigInt(nanos);
    return Number(n / BigInt(1000000));
  } catch (e) {
    return Number(nanos) / 1000000;
  }
};

const toMillis = (val: any): number => {
  if (!val) return Date.now();
  const n = Number(val);
  return n > 10000000000000 ? Math.floor(n / 1000000) : n;
};

export class HealthConnectService {
  private accessToken: string | null = null;
  private tokenClient: any = null;
  private authPromise: { resolve: (t: string) => void; reject: (e: Error) => void } | null = null;

  constructor() {
    this.accessToken = localStorage.getItem('health_connect_token');
  }

  public hasToken(): boolean {
    return !!this.accessToken;
  }

  private ensureTokenClientInitialized() {
    if (this.tokenClient) return;
    
    // 检查 Google SDK 是否加载
    if (typeof google === 'undefined' || !google.accounts?.oauth2) {
      console.error("Health Connect Bridge: Google OAuth2 SDK not found.");
      throw new Error("HEALTH_CONNECT_SDK_MISSING");
    }

    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES.join(' '),
      callback: (response: any) => {
        if (response.error) {
          this.authPromise?.reject(new Error(response.error_description || response.error));
        } else {
          this.accessToken = response.access_token;
          localStorage.setItem('health_connect_token', this.accessToken!);
          this.authPromise?.resolve(this.accessToken!);
        }
        this.authPromise = null;
      }
    });
  }

  public async authorize(forcePrompt = false): Promise<string> {
    try {
      this.ensureTokenClientInitialized();
    } catch (e) {
      // 延迟重试，防止脚本解析竞态
      await new Promise(r => setTimeout(r, 800));
      this.ensureTokenClientInitialized();
    }

    return new Promise((resolve, reject) => {
      // 设置 10 秒超时，防止弹出窗口被拦截后无限挂起
      const timeout = setTimeout(() => {
        if (this.authPromise) {
          this.authPromise.reject(new Error("AUTHORIZATION_TIMEOUT"));
          this.authPromise = null;
        }
      }, 10000);

      this.authPromise = { 
        resolve: (token) => { clearTimeout(timeout); resolve(token); }, 
        reject: (err) => { clearTimeout(timeout); reject(err); } 
      };

      try {
        this.tokenClient.requestAccessToken({ prompt: forcePrompt ? 'consent' : '' });
      } catch (e) {
        clearTimeout(timeout);
        reject(new Error("POPUP_BLOCKED_OR_FAILED"));
      }
    });
  }

  public logout() {
    this.accessToken = null;
    localStorage.removeItem('health_connect_token');
  }

  private async fetchAggregate(token: string, startTime: number, endTime: number, dataTypeName: string) {
    try {
      const response = await fetch(`https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          aggregateBy: [{ dataTypeName }],
          startTimeMillis: startTime,
          endTimeMillis: endTime,
          bucketByTime: { durationMillis: endTime - startTime }
        })
      });
      if (!response.ok) return null;
      return response.json();
    } catch (e) {
      return null;
    }
  }

  public async fetchSleepData(): Promise<Partial<SleepRecord>> {
    const token = this.accessToken || localStorage.getItem('health_connect_token');
    if (!token) throw new Error("LINK_REQUIRED");

    const now = Date.now();
    const searchWindowStart = now - (120 * 60 * 60 * 1000); 

    const sessionRes = await fetch(
      `https://www.googleapis.com/fitness/v1/users/me/sessions?startTime=${new Date(searchWindowStart).toISOString()}&endTime=${new Date(now).toISOString()}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!sessionRes.ok) throw new Error("HEALTH_CONNECT_API_DENIED");
    const sessionData = await sessionRes.json();
    // 过滤出 activityType 为 72 (Sleep) 的会话
    const sleepSessions = (sessionData.session || []).filter((s: any) => s.activityType === 72);

    if (sleepSessions.length === 0) {
       const rawCheck = await this.fetchAggregate(token, searchWindowStart, now, "com.google.sleep.segment");
       if (!rawCheck || !rawCheck.bucket?.[0]?.dataset?.[0]?.point?.length) {
         throw new Error("NO_HEALTH_CONNECT_DATA");
       }
       
       const p = rawCheck.bucket[0].dataset[0].point[rawCheck.bucket[0].dataset[0].point.length - 1];
       const sTime = nanostampsToMillis(p.startTimeNanos);
       const eTime = nanostampsToMillis(p.endTimeNanos);
       return this.processDetailedData(token, sTime, eTime, "Health Connect Session");
    }

    const latest = sleepSessions[sleepSessions.length - 1];
    const sTime = toMillis(latest.startTimeMillis);
    const eTime = toMillis(latest.endTimeMillis);

    return this.processDetailedData(token, sTime, eTime, latest.name || "Health Connect Biometrics");
  }

  private async processDetailedData(token: string, sTime: number, eTime: number, sessionName: string): Promise<Partial<SleepRecord>> {
    const segmentData = await this.fetchAggregate(token, sTime, eTime, "com.google.sleep.segment");
    const stages: SleepStage[] = [];
    let deepMins = 0, remMins = 0, lightMins = 0, awakeMins = 0;

    const allPoints = segmentData?.bucket?.[0]?.dataset?.[0]?.point || [];
    
    if (allPoints.length === 0) {
      const durationMins = (eTime - sTime) / (60 * 1000);
      stages.push({ name: 'Light', duration: Math.round(durationMins), startTime: new Date(sTime).toLocaleTimeString() });
      lightMins = durationMins;
    } else {
      allPoints.forEach((p: any) => {
        const type = p.value?.[0]?.intVal;
        const start = nanostampsToMillis(p.startTimeNanos);
        const end = nanostampsToMillis(p.endTimeNanos);
        const duration = (end - start) / (60 * 1000);
        const startTimeStr = new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        let stageName: any = 'Light';
        if (type === 1) { stageName = 'Awake'; awakeMins += duration; }
        else if (type === 4) { stageName = 'Light'; lightMins += duration; }
        else if (type === 5) { stageName = 'Deep'; deepMins += duration; }
        else if (type === 6) { stageName = 'REM'; remMins += duration; }

        stages.push({ name: stageName, duration: Math.max(1, Math.round(duration)), startTime: startTimeStr });
      });
    }

    const totalDuration = (eTime - sTime) / (60 * 1000);

    let average = 65, max = 88, min = 58;
    const hrAgg = await this.fetchAggregate(token, sTime, eTime, "com.google.heart_rate.bpm");
    if (hrAgg) {
      const hrVal = hrAgg.bucket?.[0]?.dataset?.[0]?.point?.[0]?.value || [];
      average = Math.round(hrVal[0]?.fpVal || average);
      max = Math.round(hrVal[1]?.fpVal || max);
      min = Math.round(hrVal[2]?.fpVal || min);
    }

    const efficiency = totalDuration > 0 ? Math.round(((totalDuration - awakeMins) / totalDuration) * 100) : 0;
    const scoreBase = Math.min(100, (totalDuration / 450) * 100);
    const finalScore = Math.round((scoreBase * 0.7) + (efficiency * 0.3));

    return {
      date: new Date(sTime).toLocaleDateString(navigator.language, { month: 'long', day: 'numeric', weekday: 'long' }),
      score: finalScore,
      totalDuration: Math.round(totalDuration),
      deepRatio: totalDuration > 0 ? Math.round((deepMins / totalDuration) * 100) : 0,
      remRatio: totalDuration > 0 ? Math.round((remMins / totalDuration) * 100) : 0,
      efficiency,
      stages,
      heartRate: { resting: min, max, min, average, history: [] }
    };
  }
}

export const healthConnect = new HealthConnectService();