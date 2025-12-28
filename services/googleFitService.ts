
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
    throw new Error("Google 服务加载超时。");
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
              return;
            }
            this.accessToken = response.access_token;
            if (this.accessToken) {
              sessionStorage.setItem('google_fit_token', this.accessToken);
              this.authPromise?.resolve(this.accessToken);
            }
          },
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

  async fetchSleepData(): Promise<Partial<SleepRecord>> {
    if (!this.accessToken) throw new Error("授权失效。");

    const now = new Date();
    // 扩大搜索范围至 10 天
    const startTimeMillis = now.getTime() - 10 * 24 * 60 * 60 * 1000;
    const endTimeMillis = now.getTime();
    const headers = { Authorization: `Bearer ${this.accessToken}` };

    try {
      // --- 步骤 1: 尝试获取睡眠会话 (Sessions) ---
      const sessionsRes = await fetch(
        `https://www.googleapis.com/fitness/v1/users/me/sessions?startTime=${new Date(startTimeMillis).toISOString()}&endTime=${new Date(endTimeMillis).toISOString()}&type=72`,
        { headers }
      );
      const sessionsData = await sessionsRes.json();
      const sessions = sessionsData.session || [];

      let startMs: bigint;
      let endMs: bigint;
      let dateLabel: string;

      if (sessions.length > 0) {
        const latest = sessions[sessions.length - 1];
        startMs = BigInt(latest.startTimeMillis);
        endMs = BigInt(latest.endTimeMillis);
        dateLabel = latest.name || new Date(Number(startMs)).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });
      } else {
        // --- 步骤 2: 穿透模式 - 直接搜索数据点 ---
        // 如果没有会话，尝试直接从 com.google.sleep.segment 数据源找最近的数据点
        const dsId = "derived:com.google.sleep.segment:com.google.android.gms:merged";
        const datasetId = `${BigInt(startTimeMillis) * BigInt(1000000)}-${BigInt(endTimeMillis) * BigInt(1000000)}`;
        const rawRes = await fetch(`https://www.googleapis.com/fitness/v1/users/me/datasetSources/${dsId}/datasets/${datasetId}`, { headers });
        const rawData = await rawRes.json();
        const points = rawData.point || [];

        if (points.length === 0) {
          throw new Error("未发现睡眠数据。请检查：1.手机 Google Fit 已同步 2.授权时勾选了所有复选框 3.设备支持睡眠分期写入。");
        }

        // 找到最后一段连续的数据点作为“模拟会house”
        const lastPoint = points[points.length - 1];
        endMs = BigInt(lastPoint.endTimeNanos) / BigInt(1000000);
        // 往前找 8 小时内的数据点
        const firstPoint = points.find((p: any) => BigInt(p.startTimeNanos) > BigInt(lastPoint.endTimeNanos) - BigInt(12 * 3600 * 1000000000)) || points[0];
        startMs = BigInt(firstPoint.startTimeNanos) / BigInt(1000000);
        dateLabel = new Date(Number(startMs)).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });
      }

      const totalDuration = Number((endMs - startMs) / BigInt(60000));

      // --- 步骤 3: 抓取精细分期 ---
      const dsId = "derived:com.google.sleep.segment:com.google.android.gms:merged";
      const datasetId = `${startMs * BigInt(1000000)}-${endMs * BigInt(1000000)}`;
      const segmentRes = await fetch(`https://www.googleapis.com/fitness/v1/users/me/datasetSources/${dsId}/datasets/${datasetId}`, { headers });
      
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
          const d = Number((pEnd - pStart) / BigInt(60000000000));
          const st = new Date(Number(pStart / BigInt(1000000))).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          if (type === 5) { deepMins += d; return { name: '深睡', duration: d, startTime: st }; }
          if (type === 6) { remMins += d; return { name: 'REM', duration: d, startTime: st }; }
          if (type === 1) { awakeMins += d; return { name: '清醒', duration: d, startTime: st }; }
          return { name: '浅睡', duration: d, startTime: st };
        });
      }

      if (stages.length === 0) {
        stages = [{ name: '浅睡', duration: totalDuration, startTime: new Date(Number(startMs)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }];
      }

      // --- 步骤 4: 抓取心率与卡路里 ---
      const hrDsId = "derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm";
      const hrUrl = `https://www.googleapis.com/fitness/v1/users/me/datasetSources/${hrDsId}/datasets/${startMs * BigInt(1000000)}-${endMs * BigInt(1000000)}`;
      const hrRes = await fetch(hrUrl, { headers });
      let hrMetrics: HeartRateData = { resting: 60, average: 65, min: 55, max: 85, history: [] };
      if (hrRes.ok) {
        const hrJson = await hrRes.json();
        const pts = hrJson.point || [];
        const vals = pts.map((p: any) => p.value[0].fpVal).filter((v: number) => v > 30);
        if (vals.length > 0) {
          hrMetrics = {
            average: Math.round(vals.reduce((a: number, b: number) => a + b, 0) / vals.length),
            min: Math.round(Math.min(...vals)),
            max: Math.round(Math.max(...vals)),
            resting: Math.round(Math.min(...vals)),
            history: pts.slice(-30).map((p: any) => ({
              time: new Date(Number(BigInt(p.startTimeNanos) / BigInt(1000000))).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              bpm: Math.round(p.value[0].fpVal)
            }))
          };
        }
      }

      // 抓取 24 小时卡路里
      const calDs = "derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended";
      const calTimeId = `${BigInt(now.getTime() - 86400000) * BigInt(1000000)}-${BigInt(now.getTime()) * BigInt(1000000)}`;
      const calRes = await fetch(`https://www.googleapis.com/fitness/v1/users/me/datasetSources/${calDs}/datasets/${calTimeId}`, { headers });
      let calories = 0;
      if (calRes.ok) {
        const calData = await calRes.json();
        calories = Math.round(calData.point?.reduce((acc: number, p: any) => acc + (p.value[0].fpVal || 0), 0) || 0);
      }

      return {
        totalDuration,
        score: Math.min(100, Math.round((totalDuration / 480) * 70 + (deepMins / Math.max(1, totalDuration)) * 150)),
        deepRatio: Math.round((deepMins / Math.max(1, totalDuration)) * 100),
        remRatio: Math.round((remMins / Math.max(1, totalDuration)) * 100),
        efficiency: totalDuration > 0 ? Math.round(((totalDuration - awakeMins) / totalDuration) * 100) : 0,
        date: dateLabel,
        stages,
        heartRate: hrMetrics,
        calories,
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
