
import { SleepRecord, SleepStage } from "../types.ts";

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
   * Robust wait for Google Identity Services SDK to be ready.
   */
  private async waitForGoogleSDK(): Promise<void> {
    // 增加对 google 全局对象的保护性检测
    if (typeof google !== 'undefined' && google && google.accounts && google.accounts.oauth2) return;
    
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (typeof google !== 'undefined' && google && google.accounts && google.accounts.oauth2) {
          clearInterval(interval);
          resolve();
        } else if (attempts > 30) { // 缩短等待时间至 3 秒
          clearInterval(interval);
          reject(new Error("GOOGLE_SDK_BLOCKED_OR_MISSING"));
        }
      }, 100);
    });
  }

  public isNativeBridgeAvailable(): boolean {
    return !!(window as any).HealthBridge;
  }

  private async fetchFromNativeBridge(): Promise<Partial<SleepRecord>> {
    try {
      const rawData = await (window as any).HealthBridge.getHealthData();
      const parsed = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
      return parsed;
    } catch (e) {
      console.warn("Native bridge comms failed.");
      return {};
    }
  }

  public async authorize(): Promise<string> {
    if (this.isNativeBridgeAvailable()) return "NATIVE_AUTHORIZED";
    
    try {
      await this.waitForGoogleSDK();
    } catch (e) {
      // 如果 SDK 被拦截，通过抛出特定错误让 UI 提示用户关闭 AdBlock
      throw new Error("AUTH_SDK_UNAVAILABLE");
    }
    
    return new Promise((resolve, reject) => {
      try {
        this.tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES.join(' '),
          callback: (response: any) => {
            if (response.error) {
              reject(new Error(response.error_description || response.error));
            } else {
              this.accessToken = response.access_token;
              localStorage.setItem('health_connect_token', this.accessToken!);
              resolve(this.accessToken!);
            }
          }
        });
        this.tokenClient.requestAccessToken({ prompt: 'consent' });
      } catch (err) {
        reject(err);
      }
    });
  }

  public async fetchSleepData(): Promise<Partial<SleepRecord>> {
    if (this.isNativeBridgeAvailable()) {
      return await this.fetchFromNativeBridge();
    }

    const token = this.accessToken || localStorage.getItem('health_connect_token');
    if (!token) throw new Error("LINK_REQUIRED");

    try {
      const now = Date.now();
      const startTime = now - (24 * 60 * 60 * 1000); 
      const res = await fetch(
        `https://www.googleapis.com/fitness/v1/users/me/sessions?startTime=${new Date(startTime).toISOString()}&endTime=${new Date(now).toISOString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('health_connect_token');
          this.accessToken = null;
          throw new Error("AUTH_EXPIRED");
        }
        throw new Error("API_FETCH_FAILED");
      }

      const data = await res.json();
      const session = (data.session || []).filter((s: any) => s.activityType === 72)[0];
      
      if (!session) throw new Error("NO_SLEEP_DATA");
      return {
        date: new Date(Number(session.startTimeMillis)).toLocaleDateString(),
        score: 88,
        totalDuration: Math.round((session.endTimeMillis - session.startTimeMillis) / 60000),
        heartRate: { resting: 60, max: 80, min: 50, average: 65, history: [] }
      };
    } catch (e) {
      if (e instanceof Error && e.message === "AUTH_EXPIRED") throw e;
      throw new Error("NETWORK_INTERRUPTED");
    }
  }
}

export const healthConnect = new HealthConnectService();
