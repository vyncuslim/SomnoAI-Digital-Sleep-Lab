
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
    if (typeof google !== 'undefined' && google.accounts?.oauth2) return;
    
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (typeof google !== 'undefined' && google.accounts?.oauth2) {
          clearInterval(interval);
          resolve();
        } else if (attempts > 50) { // 5 seconds max
          clearInterval(interval);
          reject(new Error("GOOGLE_SDK_MISSING"));
        }
      }, 100);
    });
  }

  public isNativeBridgeAvailable(): boolean {
    return !!(window as any).HealthBridge;
  }

  private async fetchFromNativeBridge(): Promise<Partial<SleepRecord>> {
    const rawData = await (window as any).HealthBridge.getHealthData();
    const parsed = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
    return parsed;
  }

  public async authorize(): Promise<string> {
    if (this.isNativeBridgeAvailable()) return "NATIVE_AUTHORIZED";
    
    try {
      await this.waitForGoogleSDK();
    } catch (e) {
      throw e;
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
  }
}

export const healthConnect = new HealthConnectService();
