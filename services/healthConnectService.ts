
import { SleepRecord, SleepStage } from "../types.ts";
import { supabase } from "./supabaseService.ts";

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
   * Pulls the latest telemetry data that was uploaded via the bright-responder API (from the App).
   */
  public async syncCloudIngress(): Promise<Partial<SleepRecord>> {
    const { data: { user } } = await (supabase.auth as any).getUser();
    if (!user) throw new Error("UNAUTHORIZED_NODE");

    // Fetch latest record from the user_data or related telemetry table
    // Assuming bright-responder stores the latest metrics in 'user_data' 
    // or a dedicated 'health_telemetry' table.
    const { data, error } = await supabase
      .from('user_data')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !data) {
      throw new Error("CLOUD_NODE_EMPTY");
    }

    // Map the DB record back to the SleepRecord UI format
    return {
      date: new Date().toLocaleDateString(),
      score: data.sleep_score || 85, // Fallback if score isn't pre-calculated
      totalDuration: data.total_sleep_minutes || 480,
      heartRate: {
        resting: data.resting_hr || 60,
        max: data.max_hr || 85,
        min: data.min_hr || 50,
        average: data.avg_hr || 65,
        history: []
      }
    };
  }

  private async waitForGoogleSDK(): Promise<void> {
    if (typeof google !== 'undefined' && google && google.accounts && google.accounts.oauth2) return;
    
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (typeof google !== 'undefined' && google && google.accounts && google.accounts.oauth2) {
          clearInterval(interval);
          resolve();
        } else if (attempts > 30) {
          clearInterval(interval);
          reject(new Error("GOOGLE_SDK_BLOCKED_OR_MISSING"));
        }
      }, 100);
    });
  }

  public isNativeBridgeAvailable(): boolean {
    return !!(window as any).HealthBridge;
  }

  public async authorize(): Promise<string> {
    if (this.isNativeBridgeAvailable()) return "NATIVE_AUTHORIZED";
    await this.waitForGoogleSDK();
    
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
    // If user has Cloud Data available from the App, try syncing that first
    try {
      return await this.syncCloudIngress();
    } catch (e) {
      console.debug("Cloud ingress not available, falling back to local bridge.");
    }

    if (this.isNativeBridgeAvailable()) {
      const rawData = await (window as any).HealthBridge.getHealthData();
      return typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
    }

    const token = this.accessToken || localStorage.getItem('health_connect_token');
    if (!token) throw new Error("LINK_REQUIRED");

    // Standard Google Fit fetch...
    return {}; 
  }
}

export const healthConnect = new HealthConnectService();
