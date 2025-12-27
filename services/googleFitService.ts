
import { SleepRecord, SleepStage, HeartRateData } from "../types.ts";

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

  private async waitForGoogleReady(): Promise<void> {
    const maxAttempts = 50;
    for (let i = 0; i < maxAttempts; i++) {
      if (typeof google !== 'undefined' && google.accounts && google.accounts.oauth2) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error("Google 身份验证组件加载失败，请刷新页面或检查网络。");
  }

  private async ensureClientInitialized() {
    if (this.tokenClient) return;
    await this.waitForGoogleReady();

    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES.join(" "),
      callback: (response: any) => {
        if (response.error) {
          console.error("GSI Error:", response);
          this.authPromise?.reject(new Error(`授权失败: ${response.error_description || response.error}`));
          return;
        }
        if (response.access_token) {
          this.accessToken = response.access_token;
          this.authPromise?.resolve(response.access_token);
        } else {
          this.authPromise?.reject(new Error("未获得访问令牌。"));
        }
      },
      error_callback: (err: any) => {
        console.error("GSI Client Internal Error:", err);
        this.authPromise?.reject(new Error("Google 授权客户端发生内部错误。"));
      }
    });
  }

  async authorize(): Promise<string> {
    // We call this to make sure it's ready, but ideally it should have been pre-warmed
    await this.ensureClientInitialized();

    return new Promise((resolve, reject) => {
      this.authPromise = { resolve, reject };
      try {
        // requestAccessToken MUST be called directly in response to a user click
        this.tokenClient.requestAccessToken({ prompt: 'consent' });
      } catch (err: any) {
        console.error("Popup trigger error:", err);
        reject(new Error("无法启动授权弹窗，请检查浏览器是否拦截了弹出窗口。"));
      }
    });
  }

  async fetchSleepData(): Promise<Partial<SleepRecord>> {
    if (!this.accessToken) {
      throw new Error("尚未授权，请先连接 Google 健身。");
    }

    const now = new Date();
    const startTimeMillis = now.getTime() - 24 * 60 * 60 * 1000;
    const endTimeMillis = now.getTime();

    try {
      const sleepUrl = `https://www.googleapis.com/fitness/v1/users/me/sessions?startTime=${new Date(startTimeMillis).toISOString()}&endTime=${new Date(endTimeMillis).toISOString()}&type=72`;
      
      const hrUrl = `https://www.googleapis.com/fitness/v1/users/me/datasetSources/derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm/datasets/${startTimeMillis * 1000000}-${endTimeMillis * 1000000}`;

      const [sleepRes, hrRes] = await Promise.all([
        fetch(sleepUrl, { headers: { Authorization: `Bearer ${this.accessToken}` } }),
        fetch(hrUrl, { headers: { Authorization: `Bearer ${this.accessToken}` } })
      ]);

      if (sleepRes.status === 401 || hrRes.status === 401) {
        this.accessToken = null;
        throw new Error("登录已过期，请重新同步。");
      }

      if (!sleepRes.ok) {
        throw new Error("从 Google Fit 读取数据失败，请确保已开启相应权限。");
      }

      const sleepData = await sleepRes.json();
      const sessions = sleepData.session || [];

      if (sessions.length === 0) {
        throw new Error("最近 24 小时内未发现睡眠记录。");
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
        aiInsights: ["同步成功：实验室已接入您的最新生理指标流。"]
      };
    } catch (error: any) {
      console.error("Data Fetch Error:", error);
      throw error;
    }
  }
}

export const googleFit = new GoogleFitService();
