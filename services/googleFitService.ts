
import { SleepRecord, SleepStage, HeartRateData } from "../types.ts";

// Google Fit OAuth Client ID
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
    throw new Error("Google Identity Services SDK 加载超时。");
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
              this.authPromise?.reject(new Error("Missing access_token"));
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
    if (this.accessToken && !forcePrompt) return this.accessToken;
    await this.ensureClientInitialized();
    return new Promise((resolve, reject) => {
      this.authPromise = { resolve, reject };
      this.tokenClient.requestAccessToken({ prompt: forcePrompt ? 'select_account consent' : '' });
    });
  }

  private async fetchWithAuth(url: string, headers: any) {
    const res = await fetch(url, { headers });
    if (res.status === 401) throw new Error("AUTH_EXPIRED");
    if (res.status === 403) throw new Error("PERMISSION_DENIED");
    return res;
  }

  async fetchSleepData(): Promise<Partial<SleepRecord>> {
    if (!this.accessToken) throw new Error("AUTH_EXPIRED");

    console.group("SomnoAI Lab: 高级会话捕获模式");
    const now = new Date();
    const startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const endTime = now.toISOString();
    const headers = { Authorization: `Bearer ${this.accessToken}` };

    try {
      // 1. 优先通过 Sessions API 查找睡眠记录 (ActivityType 72 = Sleep)
      // 这是最可靠的方法，因为它能捕获由各种 App 写入的“睡眠会话”
      const sessionsUrl = `https://www.googleapis.com/fitness/v1/users/me/sessions?startTime=${startTime}&endTime=${endTime}&activityType=72`;
      const sessionsRes = await this.fetchWithAuth(sessionsUrl, headers);
      const sessionsData = await sessionsRes.json();
      
      const sleepSessions = sessionsData.session || [];
      console.log(`SomnoAI Lab: 在 Session API 中发现 ${sleepSessions.length} 个睡眠窗口`);

      if (sleepSessions.length === 0) {
        // 如果 Session API 没找到，尝试之前的数据源遍历逻辑作为 fallback
        console.warn("SomnoAI Lab: Session API 未返回结果，尝试扫描原始数据流...");
        return await this.fetchSleepDataFromDataSources(headers);
      }

      // 2. 锁定最近的一个有效会话
      sleepSessions.sort((a: any, b: any) => Number(b.startTimeMillis) - Number(a.startTimeMillis));
      const latestSession = sleepSessions[0];
      const startMs = Number(latestSession.startTimeMillis);
      const endMs = Number(latestSession.endTimeMillis);
      const startNanos = BigInt(startMs) * 1000000n;
      const endNanos = BigInt(endMs) * 1000000n;
      
      console.log(`SomnoAI Lab: 锁定最新会话 [${latestSession.name || '未命名'}]，时长: ${Math.round((endMs - startMs) / 60000)}min`);

      // 3. 尝试获取该会话内的精细阶段数据 (com.google.sleep.segment)
      let stages: SleepStage[] = [];
      try {
        const segmentDs = "derived:com.google.sleep.segment:com.google.android.gms:merged";
        const segmentRes = await this.fetchWithAuth(`https://www.googleapis.com/fitness/v1/users/me/datasetSources/${segmentDs}/datasets/${startNanos}-${endNanos}`, headers);
        if (segmentRes.ok) {
          const segmentData = await segmentRes.json();
          if (segmentData.point?.length > 0) {
            stages = segmentData.point.map((p: any) => {
              const type = p.value[0].intVal;
              const s = Number(BigInt(p.startTimeNanos) / 1000000n);
              const e = Number(BigInt(p.endTimeNanos) / 1000000n);
              const d = Math.round((e - s) / 60000);
              let name: SleepStage['name'] = '浅睡';
              if (type === 5) name = '深睡';
              else if (type === 6) name = 'REM';
              else if (type === 1 || type === 3) name = '清醒';
              return { name, duration: d, startTime: new Date(s).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
            });
            console.log(`SomnoAI Lab: 成功解码 ${stages.length} 个睡眠微架构阶段`);
          }
        }
      } catch (e) {
        console.warn("SomnoAI Lab: 无法提取精细阶段，将降级为基础时长分析");
      }

      // 4. 如果没有精细阶段，构造一个占位阶段以保证 UI 显示
      if (stages.length === 0) {
        stages = [{ 
          name: '浅睡', 
          duration: Math.round((endMs - startMs) / 60000), 
          startTime: new Date(startMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        }];
      }

      // 5. 获取伴随的生理体征 (心率和能耗)
      const heartRate = await this.fetchHeartRate(startNanos, endNanos, headers);
      const calories = await this.fetchCalories(startNanos, endNanos, headers);

      // 6. 质量评估
      const durationMins = Math.round((endMs - startMs) / 60000);
      const deepMins = stages.filter(s => s.name === '深睡').reduce((acc, s) => acc + s.duration, 0);
      const remMins = stages.filter(s => s.name === 'REM').reduce((acc, s) => acc + s.duration, 0);
      const awakeMins = stages.filter(s => s.name === '清醒').reduce((acc, s) => acc + s.duration, 0);

      const score = Math.min(100, Math.round(
        (Math.min(480, durationMins) / 480) * 40 + 
        (Math.min(25, (deepMins / Math.max(1, durationMins)) * 100) / 25) * 35 + 
        (Math.min(20, (remMins / Math.max(1, durationMins)) * 100) / 20) * 25
      ));

      console.groupEnd();
      return {
        totalDuration: durationMins,
        deepRatio: Math.round((deepMins / Math.max(1, durationMins)) * 100),
        remRatio: Math.round((remMins / Math.max(1, durationMins)) * 100),
        efficiency: Math.round(((durationMins - awakeMins) / Math.max(1, durationMins)) * 100),
        date: new Date(startMs).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }),
        stages, heartRate, calories, score
      };

    } catch (err: any) {
      console.groupEnd();
      throw err;
    }
  }

  // Fallback: 传统的通过扫描数据源寻找信号的方法
  private async fetchSleepDataFromDataSources(headers: any): Promise<Partial<SleepRecord>> {
    const now = new Date();
    const startNanos = BigInt(now.getTime() - 7 * 24 * 60 * 60 * 1000) * 1000000n;
    const endNanos = BigInt(now.getTime()) * 1000000n;

    const dsRes = await this.fetchWithAuth("https://www.googleapis.com/fitness/v1/users/me/dataSources", headers);
    const dsData = await dsRes.json();
    const sources = dsData.dataSource?.filter((d: any) => 
      d.dataType.name === "com.google.sleep.segment" || d.dataType.name === "com.google.sleep.session"
    ) || [];

    let allPoints: any[] = [];
    for (const source of sources) {
      const res = await this.fetchWithAuth(`https://www.googleapis.com/fitness/v1/users/me/datasetSources/${source.dataStreamId}/datasets/${startNanos}-${endNanos}`, headers);
      if (res.ok) {
        const data = await res.json();
        if (data.point?.length > 0) allPoints = [...allPoints, ...data.point];
      }
    }

    if (allPoints.length === 0) throw new Error("DATA_NOT_FOUND");

    allPoints.sort((a, b) => Number(BigInt(a.startTimeNanos) - BigInt(b.startTimeNanos)));
    const latest = allPoints[allPoints.length - 1];
    const startMs = Number(BigInt(latest.startTimeNanos) / 1000000n);
    const endMs = Number(BigInt(latest.endTimeNanos) / 1000000n);
    const duration = Math.round((endMs - startMs) / 60000);

    return {
      totalDuration: duration,
      date: new Date(startMs).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }),
      score: 70, // Fallback score
      stages: [{ name: '浅睡', duration, startTime: new Date(startMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }],
      heartRate: { resting: 65, average: 70, min: 60, max: 100, history: [] },
      calories: 2000
    };
  }

  private async fetchHeartRate(startNanos: bigint, endNanos: bigint, headers: any): Promise<HeartRateData> {
    try {
      const hrSid = "derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm";
      const res = await this.fetchWithAuth(`https://www.googleapis.com/fitness/v1/users/me/datasetSources/${hrSid}/datasets/${startNanos}-${endNanos}`, headers);
      if (res.ok) {
        const json = await res.json();
        const vals = json.point?.map((p: any) => p.value[0].fpVal || p.value[0].intVal) || [];
        if (vals.length > 0) {
          return {
            average: Math.round(vals.reduce((a: number, b: number) => a + b, 0) / vals.length),
            resting: Math.min(...vals), min: Math.min(...vals), max: Math.max(...vals),
            history: json.point.slice(-20).map((p: any) => ({
              time: new Date(Number(BigInt(p.startTimeNanos) / 1000000n)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              bpm: Math.round(p.value[0].fpVal || p.value[0].intVal)
            }))
          };
        }
      }
    } catch (e) {}
    return { resting: 60, average: 65, min: 55, max: 90, history: [] };
  }

  private async fetchCalories(startNanos: bigint, endNanos: bigint, headers: any): Promise<number> {
    try {
      const calSid = "derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended";
      const res = await this.fetchWithAuth(`https://www.googleapis.com/fitness/v1/users/me/datasetSources/${calSid}/datasets/${startNanos}-${endNanos}`, headers);
      if (res.ok) {
        const json = await res.json();
        return Math.round(json.point?.reduce((sum: number, p: any) => sum + (p.value[0].fpVal || 0), 0) || 0);
      }
    } catch (e) {}
    return 0;
  }

  public logout() {
    this.accessToken = null;
    sessionStorage.removeItem('google_fit_token');
  }
}

export const googleFit = new GoogleFitService();
