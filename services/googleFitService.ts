
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
  private resolveAuth: ((token: string) => void) | null = null;
  private rejectAuth: ((error: Error) => void) | null = null;

  private async waitForGoogleReady(): Promise<void> {
    const maxAttempts = 50;
    for (let i = 0; i < maxAttempts; i++) {
      if (typeof google !== 'undefined' && google.accounts && google.accounts.oauth2) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error("Google Identity Service failed to load. Please check your internet connection.");
  }

  /**
   * Initializes the token client if not already done.
   */
  private async initClient() {
    await this.waitForGoogleReady();
    if (this.tokenClient) return;

    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES.join(" "),
      callback: (response: any) => {
        if (response.error) {
          console.error("GSI Error callback:", response);
          this.rejectAuth?.(new Error(`Authorization failed: ${response.error_description || response.error}`));
          return;
        }
        if (response.access_token) {
          this.accessToken = response.access_token;
          console.log("Google Fit access token received.");
          this.resolveAuth?.(response.access_token);
        } else {
          this.rejectAuth?.(new Error("No access token returned from Google."));
        }
      },
      error_callback: (err: any) => {
        console.error("GSI Error:", err);
        this.rejectAuth?.(new Error("Google Authorization Client error."));
      }
    });
  }

  async authorize(): Promise<string> {
    await this.initClient();

    return new Promise((resolve, reject) => {
      this.resolveAuth = resolve;
      this.rejectAuth = reject;

      try {
        // Calling requestAccessToken triggers the popup.
        // It's best to call this as directly as possible after a user action.
        this.tokenClient.requestAccessToken({ prompt: 'consent' });
      } catch (err: any) {
        console.error("Error triggering popup:", err);
        reject(new Error("Failed to open authorization popup."));
      }
    });
  }

  async fetchSleepData(): Promise<Partial<SleepRecord>> {
    if (!this.accessToken) {
      throw new Error("Missing access token. Please connect to Google Fit first.");
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
        throw new Error("Access expired. Please re-sync.");
      }

      if (!sleepRes.ok) {
        throw new Error("Could not retrieve sleep data from Google Fit.");
      }

      const sleepData = await sleepRes.json();
      const sessions = sleepData.session || [];

      if (sessions.length === 0) {
        throw new Error("No sleep records found for the last 24 hours.");
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
        aiInsights: ["实验室已成功同步：今日睡眠时段与实时脉搏曲线已更新。"]
      };
    } catch (error: any) {
      console.error("Fetch Error:", error);
      throw error;
    }
  }
}

export const googleFit = new GoogleFitService();
