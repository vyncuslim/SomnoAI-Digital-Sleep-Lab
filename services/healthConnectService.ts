
import { SleepRecord, SleepStage } from "../types.ts";

const BACKEND_API = "https://www.sleepsomno.com/health-data";
const CLIENT_ID = "1083641396596-7vqbum157qd03asbmare5gmrmlr020go.apps.googleusercontent.com";
const SCOPES = [
  "https://www.googleapis.com/auth/fitness.sleep.read",
  "https://www.googleapis.com/auth/fitness.heart_rate.read",
  "openid", "profile", "email"
];

declare var google: any;

export class HealthConnectService {
  private accessToken: string | null = null;
  private tokenClient: any = null;

  constructor() {
    this.accessToken = localStorage.getItem('health_connect_token');
  }

  /**
   * 检查原生 Android HealthBridge 插件是否存在
   */
  public isNativeBridgeAvailable(): boolean {
    return !!(window as any).HealthBridge;
  }

  /**
   * 从原生 App 壳获取数据 (Hardware Level)
   */
  private async fetchFromNativeBridge(): Promise<Partial<SleepRecord>> {
    const rawData = await (window as any).HealthBridge.getHealthData();
    // 原生通常返回字符串化的 JSON
    const parsed = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
    console.log("Hardware Data Received:", parsed);
    return parsed;
  }

  /**
   * 将实验室分析结果同步到您的企业后端 API
   */
  public async uploadToBackend(record: SleepRecord): Promise<boolean> {
    try {
      const response = await fetch(BACKEND_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Lab-Source': this.isNativeBridgeAvailable() ? 'Android-Native' : 'Web-Cloud'
        },
        body: JSON.stringify(record)
      });
      return response.ok;
    } catch (e) {
      console.error("Cloud Archive Failed:", e);
      return false;
    }
  }

  public async authorize(): Promise<string> {
    if (this.isNativeBridgeAvailable()) return "NATIVE_AUTHORIZED";
    
    // Web Fallback Auth (Google Fit)
    return new Promise((resolve, reject) => {
      if (typeof google === 'undefined') return reject(new Error("GOOGLE_SDK_MISSING"));
      this.tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES.join(' '),
        callback: (response: any) => {
          if (response.error) reject(response);
          else {
            this.accessToken = response.access_token;
            localStorage.setItem('health_connect_token', this.accessToken!);
            resolve(this.accessToken!);
          }
        }
      });
      this.tokenClient.requestAccessToken({ prompt: 'consent' });
    });
  }

  public async fetchSleepData(): Promise<Partial<SleepRecord>> {
    // 1. 优先尝试硬件级同步
    if (this.isNativeBridgeAvailable()) {
      return await this.fetchFromNativeBridge();
    }

    // 2. 云端 Fallback (逻辑同前，通过 API 获取)
    const token = this.accessToken || localStorage.getItem('health_connect_token');
    if (!token) throw new Error("LINK_REQUIRED");

    const now = Date.now();
    const startTime = now - (24 * 60 * 60 * 1000); 
    const res = await fetch(
      `https://www.googleapis.com/fitness/v1/users/me/sessions?startTime=${new Date(startTime).toISOString()}&endTime=${new Date(now).toISOString()}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    if (!res.ok) throw new Error("API_FETCH_FAILED");
    const data = await res.json();
    const session = (data.session || []).filter((s: any) => s.activityType === 72)[0];
    
    if (!session) throw new Error("NO_SLEEP_DATA");
    return {
      date: new Date(Number(session.startTimeMillis)).toLocaleDateString(),
      score: 88, // Mock if no aggregated data
      totalDuration: Math.round((session.endTimeMillis - session.startTimeMillis) / 60000),
      heartRate: { resting: 60, max: 80, min: 50, average: 65, history: [] }
    };
  }
}

export const healthConnect = new HealthConnectService();
