
import { SleepRecord, SleepStage } from "../types.ts";

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

const toMillis = (val: any): number => {
  if (!val) return Date.now();
  const n = Number(val);
  return n > 10000000000000 ? Math.floor(n / 1000000) : n;
};

const nanostampsToMillis = (nanos: any): number => {
  if (!nanos) return Date.now();
  try { return Number(BigInt(nanos) / BigInt(1000000)); } catch { return Number(nanos) / 1000000; }
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

  private initTokenClient() {
    if (typeof google === 'undefined' || !google.accounts?.oauth2) {
      throw new Error("GOOGLE_SDK_NOT_LOADED");
    }

    if (this.tokenClient) return;

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

  public async authorize(forcePrompt = true): Promise<string> {
    this.initTokenClient();

    return new Promise((resolve, reject) => {
      this.authPromise = { resolve, reject };
      
      // 设置 10s 超时处理，防止弹出窗口被静默拦截
      const timeout = setTimeout(() => {
        if (this.authPromise) {
          this.authPromise.reject(new Error("AUTHORIZATION_TIMEOUT"));
          this.authPromise = null;
        }
      }, 10000);

      try {
        console.log("Requesting Health Connect Access Token...");
        this.tokenClient.requestAccessToken({ prompt: forcePrompt ? 'consent' : '' });
      } catch (e) {
        clearTimeout(timeout);
        reject(e);
      }
    });
  }

  public async fetchSleepData(): Promise<Partial<SleepRecord>> {
    const token = this.accessToken || localStorage.getItem('health_connect_token');
    if (!token) throw new Error("LINK_REQUIRED");

    const now = Date.now();
    const startTime = now - (7 * 24 * 60 * 60 * 1000); // 最近7天

    const res = await fetch(
      `https://www.googleapis.com/fitness/v1/users/me/sessions?startTime=${new Date(startTime).toISOString()}&endTime=${new Date(now).toISOString()}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) throw new Error("API_FETCH_FAILED");
    const data = await res.json();
    const sleepSessions = (data.session || []).filter((s: any) => s.activityType === 72);

    if (sleepSessions.length === 0) throw new Error("NO_HEALTH_CONNECT_DATA");

    const latest = sleepSessions[sleepSessions.length - 1];
    return this.processSession(token, latest);
  }

  private async processSession(token: string, session: any): Promise<Partial<SleepRecord>> {
    const sTime = toMillis(session.startTimeMillis);
    const eTime = toMillis(session.endTimeMillis);
    
    // 聚合心率和睡眠分段
    const response = await fetch(`https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        aggregateBy: [{ dataTypeName: "com.google.sleep.segment" }, { dataTypeName: "com.google.heart_rate.bpm" }],
        startTimeMillis: sTime,
        endTimeMillis: eTime,
        bucketByTime: { durationMillis: eTime - sTime }
      })
    });

    const agg = await response.json();
    const points = agg.bucket?.[0]?.dataset?.[0]?.point || [];
    
    const stages: SleepStage[] = points.map((p: any) => ({
      name: p.value[0].intVal === 1 ? 'Awake' : p.value[0].intVal === 5 ? 'Deep' : p.value[0].intVal === 6 ? 'REM' : 'Light',
      duration: Math.round((nanostampsToMillis(p.endTimeNanos) - nanostampsToMillis(p.startTimeNanos)) / 60000),
      startTime: new Date(nanostampsToMillis(p.startTimeNanos)).toLocaleTimeString()
    }));

    const hr = agg.bucket?.[0]?.dataset?.[1]?.point?.[0]?.value || [65, 80, 55];

    return {
      date: new Date(sTime).toLocaleDateString(undefined, { month: 'long', day: 'numeric', weekday: 'long' }),
      score: 85, // 演示计算逻辑
      totalDuration: Math.round((eTime - sTime) / 60000),
      deepRatio: 25,
      remRatio: 20,
      efficiency: 92,
      stages,
      heartRate: { resting: Math.round(hr[2] || 60), max: Math.round(hr[1] || 85), min: Math.round(hr[2] || 55), average: Math.round(hr[0] || 65), history: [] }
    };
  }
}

export const healthConnect = new HealthConnectService();
