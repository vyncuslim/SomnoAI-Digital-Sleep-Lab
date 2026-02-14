
export interface SleepStage {
  name: 'Deep' | 'REM' | 'Light' | 'Awake';
  duration: number; // minutes
  startTime: string;
}

export interface HeartRateData {
  resting: number;
  max: number;
  min: number;
  average: number;
  history: { time: string; bpm: number }[];
}

export interface SleepRecord {
  id: string;
  date: string;
  score: number;
  totalDuration: number;
  deepRatio: number;
  remRatio: number;
  efficiency: number;
  calories?: number;
  stages: SleepStage[];
  heartRate: HeartRateData;
  aiInsights: string[];
}

export interface DiaryEntry {
  id: string;
  content: string;
  mood?: string;
  created_at: string;
}

/**
 * Strategic Ingress Interface
 */
export interface HealthTelemetryPayload {
  steps: number;
  heart_rate: number;
  weight: number;
  recorded_at: string;
  source: string;
  payload?: any; 
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface SecurityEvent {
  id: string;
  email?: string;
  event_type: string;
  event_reason?: string;
  notified?: boolean;
  created_at: string; // Standardized
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  level: string;
  user_id?: string;
  created_at: string; // Standardized
}

export type ViewType = 'dashboard' | 'calendar' | 'assistant' | 'diary' | 'registry' | 'profile' | 'settings' | 'about' | 'admin' | 'admin-login' | 'privacy' | 'terms' | 'feedback' | 'experiment' | 'support' | 'contact' | 'not-found' | 'signup' | 'login' | 'science' | 'faq' | 'landing' | 'update-password';
export type SyncStatus = 'idle' | 'authorizing' | 'fetching' | 'analyzing' | 'success' | 'error';
export type Language = 'en' | 'zh' | 'es';
