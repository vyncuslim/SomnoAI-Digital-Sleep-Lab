
import { SleepRecord, SleepStage, HeartRateData } from "../types.ts";

const CLIENT_ID = "1083641396596-7vqbum157qd03asbmare5gmrmlr020go.apps.googleusercontent.com";
const SCOPES = [
  "https://www.googleapis.com/auth/fitness.sleep.read",
  "https://www.googleapis.com/auth/fitness.heart_rate.read",
  "https://www.googleapis.com/auth/fitness.activity.read",
  "https://www.googleapis.com/auth/fitness.body.read",
  "https://www.googleapis.com/auth/fitness.location.read",
  "openid",
  "profile",
  "email"
];

declare var google: any;

/**
 * GoogleFitService provides methods to initialize the Google Identity Services
 * and authorize the user for Google Fit data access.
 */
export class GoogleFitService {
  private accessToken: string | null = null;
  private tokenClient: any = null;
  private initPromise: Promise<void> | null = null;
  private authPromise: { resolve: (t: string) => void; reject: (e: Error) => void } | null = null;

  constructor() {
    this.accessToken = localStorage.getItem('google_fit_token');
  }

  /**
   * Injects the Google Identity Services script into the DOM.
   */
  private async injectGoogleScript(): Promise<void> {
    if (typeof google !== 'undefined' && google.accounts?.oauth2) return;
    
    return new Promise((resolve, reject) => {
      const scriptId = 'google-gsi-sks';
      if (document.getElementById(scriptId)) {
        let checkInterval = setInterval(() => {
          if (typeof google !== 'undefined' && google.accounts?.oauth2) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
        return;
      }

      const script = document.createElement('script');
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setTimeout(() => {
          if (google && google.accounts?.oauth2) resolve();
          else reject(new Error("GOOGLE_SDK_INIT_FAILED"));
        }, 200);
      };
      script.onerror = () => reject(new Error("GOOGLE_SDK_LOAD_ERROR"));
      document.head.appendChild(script);
    });
  }

  /**
   * Ensures the GSI client is fully loaded and ready for authentication.
   */
  public async ensureClientInitialized(): Promise<void> {
    if (this.initPromise) return this.initPromise;
    this.initPromise = this.injectGoogleScript();
    return this.initPromise;
  }

  /**
   * Authorizes the user and returns an access token.
   */
  public async authorize(forcePrompt = false): Promise<string> {
    await this.ensureClientInitialized();
    if (!this.tokenClient) {
      this.tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES.join(' '),
        callback: (response: any) => {
          if (response.error) {
            this.authPromise?.reject(new Error(response.error_description || response.error));
          } else {
            this.accessToken = response.access_token;
            localStorage.setItem('google_fit_token', this.accessToken!);
            this.authPromise?.resolve(this.accessToken!);
          }
          this.authPromise = null;
        }
      });
    }

    return new Promise((resolve, reject) => {
      this.authPromise = { resolve, reject };
      this.tokenClient.requestAccessToken({ prompt: forcePrompt ? 'consent' : '' });
    });
  }

  public logout() {
    this.accessToken = null;
    localStorage.removeItem('google_fit_token');
  }
}

// Fixed: Exporting the googleFit instance to satisfy the import in components/Auth.tsx
export const googleFit = new GoogleFitService();
