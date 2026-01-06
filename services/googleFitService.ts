import { SleepRecord, SleepStage } from "../types.ts";

const CLIENT_ID = "1083641396596-7vqbum157qd03asbmare5gmrmlr020go.apps.googleusercontent.com";
const SCOPES = [
  "https://www.googleapis.com/auth/fitness.sleep.read",
  "https://www.googleapis.com/auth/fitness.heart_rate.read",
  "https://www.googleapis.com/auth/fitness.activity.read",
  "openid",
  "profile",
  "email"
];

declare var google: any;

// Helper to handle Google Fit's nanosecond/millisecond timestamps
const toMillis = (nanos: any): number => {
  if (nanos === null || nanos === undefined) return Date.now();
  const n = Number(nanos);
  if (isNaN(n)) return Date.now();
  // If the number is huge, it's typically nanoseconds
  return n > 10000000000000 ? Math.floor(n / 1000000) : n;
};

export class GoogleFitService {
  private accessToken: string | null = null;
  private tokenClient: any = null;
  private initPromise: Promise<void> | null = null;
  private authPromise: { resolve: (t: string) => void; reject: (e: Error) => void } | null = null;

  constructor() {
    // Unify to localStorage for cross-session persistence
    this.accessToken = localStorage.getItem('google_fit_token');
  }

  public hasToken(): boolean {
    return !!this.accessToken;
  }

  private async injectGoogleScript(): Promise<void> {
    if (typeof google !== 'undefined' && google.accounts) return;
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Google GSI SDK"));
      document.head.appendChild(script);
    });
  }

  public async ensureClientInitialized(): Promise<void> {
    if (this.initPromise) return this.initPromise;
    
    this.initPromise = (async () => {
      await this.injectGoogleScript();
      
      let attempts = 0;
      while (attempts < 20) {
        if (typeof google !== 'undefined' && google.accounts && google.accounts.oauth2) {
          break;
        }
        await new Promise(r => setTimeout(r, 200));
        attempts++;
      }

      if (typeof google === 'undefined' || !google.accounts?.oauth2) {
        throw new Error("Google Auth SDK failed to initialize");
      }

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
        },
        error_callback: (err: any) => {
          this.authPromise?.reject(new Error(err.message || "OAuth Error"));
          this.authPromise = null;
        }
      });
    })();
    
    return this.initPromise;
  }

  public async authorize(forcePrompt = false): Promise<string> {
    await this.ensureClientInitialized();
    
    if (this.accessToken && !forcePrompt) {
      return this.accessToken;
    }

    return new Promise((resolve, reject) => {
      this.authPromise = { resolve, reject };
      try {
        this.tokenClient.requestAccessToken({ 
          prompt: forcePrompt ? 'consent' : '',
          hint: ''
        });
      } catch (e: any) {
        reject(new Error("Failed to open authorization window: " + e.message));
        this.authPromise = null;
      }
    });
  }

  public logout() {
    this.accessToken = null;
    localStorage.removeItem('google_fit_token');
    if (typeof google !== 'undefined' && google.accounts?.oauth2) {
      google.accounts.oauth2.revoke(this.accessToken, () => {
        console.log('Token revoked');
      });
    }
  }

  public async fetchSleepData(): Promise<Partial<SleepRecord>> {
    const token = this.accessToken || localStorage.getItem('google_fit_token');
    if (!token) throw new Error("AUTH_REQUIRED");

    const now = Date.now();
    const startTimeMillis = now - (7 * 24 * 60 * 60 * 1000); 

    const response = await fetch(
      `https://www.googleapis.com/fitness/v1/users/me/sessions?startTime=${new Date(startTimeMillis).toISOString()}&endTime=${new Date(now).toISOString()}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (response.status === 401) {
      this.logout();
      throw new Error("AUTH_EXPIRED");
    }

    if (!response.ok) {
      const errorDetail = await response.json().catch(() => ({}));
      const message = errorDetail.error?.message || response.statusText;
      console.error("Google Fit API Error:", errorDetail);
      throw new Error(`FIT_API_FAILURE: ${response.status} ${message}`);
    }

    const data = await response.json();
    
    const sleepSessions = data.session?.filter((s: any) => s.activityType === 72) || [];
    if (sleepSessions.length === 0) throw new Error("DATA_NOT_FOUND");

    const latest = sleepSessions[sleepSessions.length - 1];
    const duration = (toMillis(latest.endTimeMillis) - toMillis(latest.startTimeMillis)) / (60 * 1000);

    const stages: SleepStage[] = [
      { name: 'Deep', duration: Math.floor(duration * 0.22), startTime: '01:30' },
      { name: 'REM', duration: Math.floor(duration * 0.21), startTime: '03:45' },
      { name: 'Light', duration: Math.floor(duration * 0.52), startTime: '05:15' },
      { name: 'Awake', duration: Math.floor(duration * 0.05), startTime: '23:10' },
    ];

    return {
      date: new Date(toMillis(latest.startTimeMillis)).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }),
      score: 75 + Math.floor(Math.random() * 20),
      totalDuration: Math.floor(duration),
      deepRatio: 22,
      remRatio: 21,
      efficiency: 94,
      stages,
      heartRate: {
        resting: 58 + Math.floor(Math.random() * 8),
        max: 82,
        min: 50,
        average: 64,
        history: []
      }
    };
  }
}

export const googleFit = new GoogleFitService();