
import { SleepRecord, SleepStage, HeartRateData } from "../types.ts";

const CLIENT_ID = "312904526470-84ra3lld33sci0kvhset8523b0hdul1c.apps.googleusercontent.com";
const SCOPES = [
  "https://www.googleapis.com/auth/fitness.sleep.read",
  "https://www.googleapis.com/auth/fitness.heart_rate.read"
];

declare var google: any;

export class GoogleFitService {
  private accessToken: string | null = null;
  private tokenClient: any = null;

  private async waitForGoogleReady(): Promise<void> {
    const maxAttempts = 25;
    for (let i = 0; i < maxAttempts; i++) {
      if (typeof google !== 'undefined' && google.accounts && google.accounts.oauth2) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    throw new Error("Google 授权组件初始化超时，请检查网络连接或尝试刷新页面。");
  }

  async authorize(): Promise<string> {
    await this.waitForGoogleReady();

    return new Promise((resolve, reject) => {
      try {
        this.tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES.join(" "),
          callback: (response: any) => {
            if (response.error) {
              console.error("GSI Error:", response);
              return reject(new Error(`授权失败: ${response.error_description || response.error}`));
            }
            if (!response.access_token) {
              return reject(new Error("授权响应中未包含访问令牌"));
            }
            this.accessToken = response.access_token;
            console.log("Google Fit 授权成功");
            resolve(response.access_token);
          },
          error_callback: (err: any) => {
            console.error("GSI Client Error:", err);
            reject(new Error("Google 授权客户端发生异常"));
          }
        });
        
        // requestAccessToken() will trigger the popup
        this.tokenClient.requestAccessToken({ prompt: 'consent' });
      } catch (err: any) {
        console.error("Authorization Setup Error:", err);
        reject(new Error(err.message || "无法启动 Google 授权流程"));
      }
    });
  }

  async fetchSleepData(): Promise<Partial<SleepRecord>> {
    if (!this.accessToken) throw new Error("令牌失效或未授权，请重新登录");

    const now = new Date();
    const startTimeMillis = now.getTime() - 24 * 60 * 60 * 1000;
    const endTimeMillis = now.getTime();

    try {
      // 1. 获取睡眠会话
      const sleepUrl = `https://www.googleapis.com/fitness/v1/users/me/sessions?startTime=${new Date(startTimeMillis).toISOString()}&endTime=${new Date(endTimeMillis).toISOString()}&type=72`;
      
      // 2. 获取心率数据集 (过去 24 小时)
      const hrUrl = `https://www.googleapis.com/fitness/v1/users/me/datasetSources/derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm/datasets/${startTimeMillis * 1000000}-${endTimeMillis * 1000000}`;

      const [sleepRes, hrRes] = await Promise.all([
        fetch(sleepUrl, { headers: { Authorization: `Bearer ${this.accessToken}` } }),
        fetch(hrUrl, { headers: { Authorization: `Bearer ${this.accessToken}` } })
      ]);

      if (sleepRes.status === 401 || hrRes.status === 401) {
        this.accessToken = null;
        throw new Error("授权已过期，请重新同步。");
      }

      if (!sleepRes.ok) {
        const errJson = await sleepRes.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || "无法从 Google 健身读取睡眠记录。");
      }

      const sleepData = await sleepRes.json();
      const sessions = sleepData.session || [];

      if (sessions.length === 0) {
        throw new Error("未检测到最近的睡眠记录，请确保您的智能设备已同步数据到 Google Fit。");
      }

      const latest = sessions[sessions.length - 1];
      const durationMins = Math.floor((latest.endTimeMillis - latest.startTimeMillis) / 60000);

      let hrMetrics: HeartRateData = { resting: 60, average: 65, min: 55, max: 85, history: [] };
      if (hrRes.ok) {
        const hrJson = await hrRes.json();
        const points = hrJson.point || [];
        if (points.length > 0) {
          const values = points.map((p: any) => p.value[0].fpVal);
          hrMetrics = {
            average: Math.round(values.reduce((a: number, b: number) => a + b, 0) / values.length),
            min: Math.min(...values),
            max: Math.max(...values),
            resting: Math.min(...values) + 5,
            history: points.slice(-24).map((p: any) => ({
              time: new Date(p.startTimeNanos / 1000000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              bpm: Math.round(p.value[0].fpVal)
            }))
          };
        }
      }

      return {
        totalDuration: durationMins,
        score: Math.min(100, Math.max(40, Math.floor(durationMins / 4.8))),
        date: new Date(latest.startTimeMillis).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }),
        heartRate: hrMetrics,
        aiInsights: ["数据实验室已成功同步：今日睡眠时段与实时脉搏曲线已就绪。"]
      };
    } catch (error: any) {
      console.error("Fetch Error:", error);
      throw error;
    }
  }
}

export const googleFit = new GoogleFitService();
