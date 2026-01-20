
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

/**
 * Strategic Ingress Interface
 * Aligns with Edge Function POST /api/health/upload
 * Sole responsibility: Bridge telemetry to 'health_records' table.
 */
export interface HealthTelemetryPayload {
  steps: number;
  heart_rate: number;
  weight: number;
  recorded_at: string;
  source: string;
  payload?: any; // Preserved raw metrics for secondary AI synthesis
}

/**
 * Interface representing a message in the AI assistant conversation
 */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/**
 * Interface for system security audit and monitoring events
 */
export interface SecurityEvent {
  id: string;
  email?: string;
  event_type: string;
  event_reason?: string;
  notified?: boolean;
  created_at?: string;
  timestamp?: string;
}

export type ViewType = 'dashboard' | 'calendar' | 'assistant' | 'alarm' | 'profile' | 'settings' | 'about' | 'admin' | 'admin-login' | 'telemetry-bridge';
export type SyncStatus = 'idle' | 'authorizing' | 'fetching' | 'analyzing' | 'success' | 'error';
export type Language = 'en' | 'zh';
