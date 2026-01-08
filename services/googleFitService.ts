
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

const nanostampsToMillis = (nanos: any): number => {
  if (nanos === null || nanos === undefined) return Date.now();
  const n = BigInt(nanos);
  return Number(n / BigInt(1000000));
};

const toMillis = (val: any): number => {
  if (!val) return Date.now();
  const n = Number(val);
  return n > 10000000000000 ? Math.floor(n / 1000000) : n;
};

export class GoogleFitService {
  private accessToken: string | null = null;
  private tokenClient: any = null;
  private initPromise: Promise<void> | null = null;
  private authPromise: { resolve: (t: string) => void; reject: (e: Error) => void } | null = null;

  constructor() {
    this.accessToken = localStorage.getItem('google_fit_token');
  }

  public hasToken(): boolean {
    return !!this.accessToken;
  }

  private async injectGoogleScript(): Promise<void> {
    if (typeof google !== 'undefined' && google.accounts?.oauth2) return;
    
    return new Promise((resolve, reject) => {
      const scriptId = 'google-gsi-sks';
      if (document.getElementById(scriptId)) {
        let checkInterval = setInterval(() => {
          if (typeof google !== 'undefined' && google.accounts?.oauth2) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
        return;
      }

      const script = document.createElement('script');
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setTimeout(() => {
          if (google && google.accounts?.oauth2) resolve();
          else reject(new Error("GOOGLE_SDK_INIT_FAILED"));
        }, 200);
      };
      script.onerror = () => reject(new Error("GOOGLE_SDK_LOAD_ERROR"));
      document.head.appendChild(script);
    });
  }

  public async ensureClientInitialized(): Promise<void> {
    if (this.initPromise) return this.initPromise;
    this.initPromise = this.injectGoogleScript();
    return this.initPromise;
  }

  public async authorize(forcePrompt = false): Promise<string> {
    await this.ensureClientInitialized();
    if (!this.tokenClient) {
      this.tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES.join(' '),
        callback: (response: any) => {
          if (response.error) {
            this.authPromise?.reject(new Error(response.error_description || response.error));
          } else {
            this.accessToken = response.access_token;
            localStorage.setItem('google_fit_token', this.accessToken!);
            this.authPromise?.resolve(this.accessToken!);
          }
          this.authPromise = null;
        }
      });
    }

    if (this.accessToken && !forcePrompt) return this.accessToken;

    return new Promise((resolve, reject) => {
      this.authPromise = { resolve, reject };
      this.tokenClient.requestAccessToken({ prompt: forcePrompt ? 'consent' : '' });
    });
  }

  public logout() {
    const token = this.accessToken || localStorage.getItem('google_fit_token');
    this.accessToken = null;
    localStorage.removeItem('google_fit_token');
    if (token && typeof google !== 'undefined') {
      google.accounts.oauth2.revoke(token, () => {});
    }
  }

  private async fetchAggregate(token: string, startTime: number, endTime: number, dataTypeName: string) {
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
    return response.json();
  }

  public async fetchSleepData(): Promise<Partial<SleepRecord>> {
    const token = this.accessToken || localStorage.getItem('google_fit_token');
    if (!token) throw new Error("AUTH_REQUIRED");

    const now = Date.now();
    const searchWindowStart = now - (48 * 60 * 60 * 1000); 

    const sessionRes = await fetch(
      `https://www.googleapis.com/fitness/v1/users/me/sessions?startTime=${new Date(searchWindowStart).toISOString()}&endTime=${new Date(now).toISOString()}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    let sTime = 0;
    let eTime = 0;
    const sessionData = await sessionRes.json();
    const sleepSessions = (sessionData.session || []).filter((s: any) => s.activityType === 72);

    if (sleepSessions.length > 0) {
      const latest = sleepSessions[sleepSessions.length - 1];
      sTime = toMillis(latest.startTimeMillis);
      eTime = toMillis(latest.endTimeMillis);
    } else {
      const rawSegments = await this.fetchAggregate(token, now - (24 * 60 * 60 * 1000), now, "com.google.sleep.segment");
      const points = rawSegments.bucket?.[0]?.dataset?.[0]?.point || [];
      if (points.length === 0) throw new Error("SLEEP_DATA_SPECIFICALLY_NOT_FOUND");
      sTime = nanostampsToMillis(points[0].startTimeNanos);
      eTime = nanostampsToMillis(points[points.length - 1].endTimeNanos);
    }

    const segmentData = await this.fetchAggregate(token, sTime, eTime, "com.google.sleep.segment");
    const stages: SleepStage[] = [];
    let deepMins = 0, remMins = 0, lightMins = 0, awakeMins = 0;

    const allPoints = segmentData.bucket?.[0]?.dataset?.[0]?.point || [];
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

    const totalDuration = (eTime - sTime) / (60 * 1000);

    const hrAgg = await this.fetchAggregate(token, sTime, eTime, "com.google.heart_rate.bpm");
    const hrVal = hrAgg.bucket?.[0]?.dataset?.[0]?.point?.[0]?.value || [];
    const resting = Math.round(hrVal[2]?.fpVal || 62);
    const average = Math.round(hrVal[0]?.fpVal || 65);
    const max = Math.round(hrVal[1]?.fpVal || 88);

    const hrHistory: { time: string; bpm: number }[] = [];
    try {
      const startTimeNanos = BigInt(sTime) * BigInt(1000000);
      const endTimeNanos = BigInt(eTime) * BigInt(1000000);
      const hrStreamRes = await fetch(
        `https://www.googleapis.com/fitness/v1/users/me/dataSources/derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm/datasets/${startTimeNanos}-${endTimeNanos}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const streamData = await hrStreamRes.json();
      (streamData.point || []).slice(0, 50).forEach((p: any) => {
        const bpm = p.value[0].fpVal;
        const time = new Date(nanostampsToMillis(p.startTimeNanos)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        hrHistory.push({ time, bpm: Math.round(bpm) });
      });
    } catch (e) { console.warn("HR Stream Fetch Error", e); }

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
      heartRate: { resting, max, min: resting, average, history: hrHistory }
    };
  }
}

export const googleFit = new GoogleFitService();
