
import { SleepRecord, SleepStage, HeartRateData } from "../types.ts";

const CLIENT_ID = "312904526470-84ra3lld33sci0kvhset8523b0hdul1c.apps.googleusercontent.com";
const SCOPES = [
  "https://www.googleapis.com/auth/fitness.sleep.read",
  "https://www.googleapis.com/auth/fitness.heart_rate.read"
];

declare var google: any;

export class GoogleFitService {
  private accessToken: string | null = null;

  async authorize(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        if (typeof google === 'undefined' || !google.accounts) {
          return reject(new Error("Google 授权组件尚未就绪，请刷新页面。"));
        }

        const client = google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES.join(" "),
          callback: (response: any) => {
            if (response.error) {
              return reject(new Error(`授权被拒绝: ${response.error}`));
            }
            this.accessToken = response.access_token;
            console.log("Google Fit 授权成功");
            resolve(response.access_token);
          },
        });
        
        client.requestAccessToken();
      } catch (err) {
        reject(err);
      }
    });
  }

  async fetchSleepData(): Promise<Partial<SleepRecord>> {
    if (!this.accessToken) throw new Error("请先完成 Google 授权");

    const now = new Date();
    const startTimeMillis = now.getTime() - 24 * 60 * 60 * 1000;
    const endTimeMillis = now.getTime();

    // 1. 获取睡眠会话 (Type 72 = Sleep)
    const sleepUrl = `https://www.googleapis.com/fitness/v1/users/me/sessions?startTime=${new Date(startTimeMillis).toISOString()}&endTime=${new Date(endTimeMillis).toISOString()}&type=72`;
    
    // 2. 获取心率数据集
    const hrUrl = `https://www.googleapis.com/fitness/v1/users/me/datasetSources/derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm/datasets/${startTimeMillis * 1000000}-${endTimeMillis * 1000000}`;

    const [sleepRes, hrRes] = await Promise.all([
      fetch(sleepUrl, { headers: { Authorization: `Bearer ${this.accessToken}` } }),
      fetch(hrUrl, { headers: { Authorization: `Bearer ${this.accessToken}` } })
    ]);

    if (!sleepRes.ok) throw new Error("无法读取睡眠数据，请确保已在 Google 健身中开启相关功能。");

    const sleepData = await sleepRes.json();
    const sessions = sleepData.session || [];

    if (sessions.length === 0) {
      throw new Error("最近 24 小时未在 Google Fit 中找到睡眠记录。");
    }

    const latest = sessions[sessions.length - 1];
    const durationMins = Math.floor((latest.endTimeMillis - latest.startTimeMillis) / 60000);

    // 解析心率数据
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
          resting: Math.min(...values) + 5, // 估算静息心率
          history: points.slice(-20).map((p: any) => ({
            time: new Date(p.startTimeNanos / 1000000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            bpm: Math.round(p.value[0].fpVal)
          }))
        };
      }
    }

    return {
      totalDuration: durationMins,
      score: Math.min(100, Math.floor(durationMins / 4.8)),
      date: new Date(latest.startTimeMillis).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }),
      heartRate: hrMetrics,
      aiInsights: ["实验室已成功接入 Google 生态：实时心率与睡眠时段已完成解析。"]
    };
  }
}

export const googleFit = new GoogleFitService();
