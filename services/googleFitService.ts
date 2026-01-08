
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

const toMillis = (nanos: any): number => {
  if (nanos === null || nanos === undefined) return Date.now();
  const n = Number(nanos);
  if (isNaN(n)) return Date.now();
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
    const startTimeMillis = now - (30 * 24 * 60 * 60 * 1000); 

    // 1. 获取睡眠会话
    const sessionRes = await fetch(
      `https://www.googleapis.com/fitness/v1/users/me/sessions?startTime=${new Date(startTimeMillis).toISOString()}&endTime=${new Date(now).toISOString()}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!sessionRes.ok) throw new Error("FIT_SESSION_FETCH_FAILED");
    const sessionData = await sessionRes.json();
    const sleepSessions = (sessionData.session || []).filter((s: any) => s.activityType === 72);
    
    if (sleepSessions.length === 0) throw new Error("SLEEP_DATA_SPECIFICALLY_NOT_FOUND");

    const latest = sleepSessions[sleepSessions.length - 1];
    const sTime = toMillis(latest.startTimeMillis);
    const eTime = toMillis(latest.endTimeMillis);

    // 2. 获取真实睡眠分段详情
    const segmentData = await this.fetchAggregate(token, sTime, eTime, "com.google.sleep.segment");
    const stages: SleepStage[] = [];
    let deepMins = 0, remMins = 0, lightMins = 0, awakeMins = 0;

    // 解析 Google Fit 睡眠阶段: 1=Awake, 4=Light, 5=Deep, 6=REM
    const points = segmentData.bucket?.[0]?.dataset?.[0]?.point || [];
    points.forEach((p: any) => {
      const type = p.value?.[0]?.intVal;
      const duration = (toMillis(p.endTimeNanos) - toMillis(p.startTimeNanos)) / (60 * 1000);
      const startTimeStr = new Date(toMillis(p.startTimeNanos)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      let stageName: any = 'Light';
      if (type === 1) { stageName = 'Awake'; awakeMins += duration; }
      else if (type === 4) { stageName = 'Light'; lightMins += duration; }
      else if (type === 5) { stageName = 'Deep'; deepMins += duration; }
      else if (type === 6) { stageName = 'REM'; remMins += duration; }

      stages.push({ name: stageName, duration: Math.round(duration), startTime: startTimeStr });
    });

    // 如果没有分段详情，按总时长估算比例（防止部分设备只记总数不记分段）
    const totalDuration = (eTime - sTime) / (60 * 1000);
    if (stages.length === 0) {
      stages.push({ name: 'Deep', duration: Math.round(totalDuration * 0.2), startTime: '--' });
      stages.push({ name: 'REM', duration: Math.round(totalDuration * 0.2), startTime: '--' });
      stages.push({ name: 'Light', duration: Math.round(totalDuration * 0.6), startTime: '--' });
    }

    // 3. 获取真实心率聚合
    const hrData = await this.fetchAggregate(token, sTime, eTime, "com.google.heart_rate.bpm");
    const hrPoints = hrData.bucket?.[0]?.dataset?.[0]?.point?.[0]?.value || [];
    const resting = Math.round(hrPoints[2]?.fpVal || 60); // min bpm
    const average = Math.round(hrPoints[0]?.fpVal || 65); // avg bpm
    const max = Math.round(hrPoints[1]?.fpVal || 85);    // max bpm

    // 4. 计算真实分数和效率
    const efficiency = totalDuration > 0 ? Math.round(((totalDuration - awakeMins) / totalDuration) * 100) : 0;
    // 简易评分算法：基于总时长（目标7-8小时）和效率
    const scoreBase = Math.min(100, (totalDuration / 480) * 100);
    const finalScore = Math.round((scoreBase * 0.6) + (efficiency * 0.4));

    return {
      date: new Date(sTime).toLocaleDateString(navigator.language, { month: 'long', day: 'numeric', weekday: 'long' }),
      score: finalScore,
      totalDuration: Math.round(totalDuration),
      deepRatio: totalDuration > 0 ? Math.round((deepMins / totalDuration) * 100) : 0,
      remRatio: totalDuration > 0 ? Math.round((remMins / totalDuration) * 100) : 0,
      efficiency,
      stages,
      heartRate: {
        resting,
        max,
        min: resting,
        average,
        history: [] // 需要更复杂的查询来获取点，此处先取聚合
      }
    };
  }
}

export const googleFit = new GoogleFitService();
