
import { SleepRecord, SleepStage, HeartRateData } from "../types.ts";

// 注意：在生产环境中，请确保此 Client ID 已在 GCP 控制台配置了您的 Vercel 域名作为授权来源
const CLIENT_ID = "312904526470-84ra3lld33sci0kvhset8523b0hdul1c.apps.googleusercontent.com";
const SCOPES = [
  "https://www.googleapis.com/auth/fitness.sleep.read",
  "https://www.googleapis.com/auth/fitness.heart_rate.read",
  "openid",
  "profile",
  "email"
];

declare var google: any;

export class GoogleFitService {
  private accessToken: string | null = null;
  private tokenClient: any = null;
  private authPromise: { resolve: (t: string) => void; reject: (e: Error) => void } | null = null;

  public hasToken(): boolean {
    return !!this.accessToken;
  }

  private async waitForGoogleReady(): Promise<void> {
    const maxAttempts = 50;
    for (let i = 0; i < maxAttempts; i++) {
      if (typeof google !== 'undefined' && google.accounts && google.accounts.oauth2) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error("Google 身份验证组件加载失败，请检查网络或关闭广告拦截。");
  }

  public async ensureClientInitialized() {
    if (this.tokenClient) return;
    await this.waitForGoogleReady();

    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES.join(" "),
      callback: (response: any) => {
        if (response.error) {
          console.error("GIS Error:", response);
          this.authPromise?.reject(new Error(response.error_description || response.error));
          return;
        }
        this.accessToken = response.access_token;
        this.authPromise?.resolve(response.access_token);
      }
    });
  }

  async authorize(forcePrompt = true): Promise<string> {
    if (this.accessToken && !forcePrompt) return this.accessToken;
    await this.ensureClientInitialized();
    return new Promise((resolve, reject) => {
      this.authPromise = { resolve, reject };
      // requestAccessToken 必须由用户手势触发
      this.tokenClient.requestAccessToken({ prompt: forcePrompt ? 'consent' : '' });
    });
  }

  async fetchSleepData(): Promise<Partial<SleepRecord>> {
    if (!this.accessToken) throw new Error("未授权 Google Fit 访问。");

    const now = new Date();
    const startTimeMillis = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    const endTimeMillis = now.getTime();

    try {
      // 1. 获取睡眠会话 (Session Type 72 为睡眠)
      const sleepUrl = `https://www.googleapis.com/fitness/v1/users/me/sessions?startTime=${new Date(startTimeMillis).toISOString()}&endTime=${new Date(endTimeMillis).toISOString()}&type=72`;
      const sleepRes = await fetch(sleepUrl, { headers: { Authorization: `Bearer ${this.accessToken}` } });
      const sleepData = await sleepRes.json();
      const sessions = sleepData.session || [];

      if (sessions.length === 0) {
        throw new Error("未检测到最近的睡眠记录。请确保穿戴设备已同步到 Google Fit。");
      }

      // 获取最近一次记录
      const latest = sessions[sessions.length - 1];
      const sStart = BigInt(latest.startTimeMillis);
      const sEnd = BigInt(latest.endTimeMillis);
      const totalDuration = Number((sEnd - sStart) / BigInt(60000));

      // 2. 获取分期数据 (使用大数据源)
      const segmentSource = "derived:com.google.sleep.segment:com.google.android.gms:merged";
      const segmentUrl = `https://www.googleapis.com/fitness/v1/users/me/datasetSources/${segmentSource}/datasets/${sStart * BigInt(1000000)}-${sEnd * BigInt(1000000)}`;
      const segmentRes = await fetch(segmentUrl, { headers: { Authorization: `Bearer ${this.accessToken}` } });
      
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
          const duration = Number((pEnd - pStart) / BigInt(60000000000));
          const startTime = new Date(Number(pStart / BigInt(1000000))).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          
          let name: '深睡' | 'REM' | '浅睡' | '清醒' = '浅睡';
          // 睡眠类型代码：1=清醒, 4=浅睡, 5=深睡, 6=REM
          if (type === 5) { name = '深睡'; deepMins += duration; }
          else if (type === 6) { name = 'REM'; remMins += duration; }
          else if (type === 1) { name = '清醒'; awakeMins += duration; }
          
          return { name, duration, startTime };
        });
      }

      // 估算逻辑（如果无详细分期）
      if (stages.length === 0) {
        deepMins = Math.floor(totalDuration * 0.22);
        remMins = Math.floor(totalDuration * 0.18);
        stages = [
          { name: '深睡', duration: deepMins, startTime: '--' },
          { name: 'REM', duration: remMins, startTime: '--' },
          { name: '浅睡', duration: totalDuration - deepMins - remMins, startTime: '--' }
        ];
      }

      // 3. 获取心率数据
      const hrSource = "derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm";
      const hrUrl = `https://www.googleapis.com/fitness/v1/users/me/datasetSources/${hrSource}/datasets/${sStart * BigInt(1000000)}-${sEnd * BigInt(1000000)}`;
      const hrRes = await fetch(hrUrl, { headers: { Authorization: `Bearer ${this.accessToken}` } });

      let hrMetrics: HeartRateData = { resting: 60, average: 65, min: 55, max: 85, history: [] };
      if (hrRes.ok) {
        const hrJson = await hrRes.json();
        const points = hrJson.point || [];
        const values = points.map((p: any) => p.value[0].fpVal).filter((v: number) => v > 30);
        
        if (values.length > 0) {
          hrMetrics = {
            average: Math.round(values.reduce((a: number, b: number) => a + b, 0) / values.length),
            min: Math.round(Math.min(...values)),
            max: Math.round(Math.max(...values)),
            resting: Math.round(Math.min(...values)),
            history: points.slice(-20).map((p: any) => ({
              time: new Date(Number(BigInt(p.startTimeNanos) / BigInt(1000000))).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              bpm: Math.round(p.value[0].fpVal)
            }))
          };
        }
      }

      return {
        totalDuration,
        score: Math.min(100, Math.round((totalDuration / 480) * 80 + (deepMins / totalDuration) * 100)),
        deepRatio: Math.round((deepMins / totalDuration) * 100),
        remRatio: Math.round((remMins / totalDuration) * 100),
        efficiency: Math.round(((totalDuration - awakeMins) / totalDuration) * 100),
        date: new Date(Number(sStart)).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }),
        stages,
        heartRate: hrMetrics,
        aiInsights: ["实验室：生理信号流已捕获，AI 正在分析您的恢复曲线。"]
      };
    } catch (error: any) {
      console.error("Fetch Data Failed:", error);
      throw error;
    }
  }
}

export const googleFit = new GoogleFitService();
