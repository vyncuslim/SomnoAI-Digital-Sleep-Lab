
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
  totalDuration: number; // minutes
  deepRatio: number; // percentage
  remRatio: number;
  efficiency: number;
  calories?: number; // kcal
  stages: SleepStage[];
  heartRate: HeartRateData;
  aiInsights: string[];
}

export interface UserProfileMetadata {
  displayName: string;
  age?: number;
  weight?: number; // in kg
  height?: number; // in cm
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  units: 'metric' | 'imperial';
  coachingStyle: 'clinical' | 'motivational' | 'minimalist';
}

export interface SecurityEvent {
  id: string;
  user_id: string;
  email: string;
  event_type: 'AUTO_BLOCK' | 'SUSPICIOUS_LOGIN' | 'IP_THROTTLED';
  event_reason: string;
  created_at: string;
  notified: boolean;
}

export type ViewType = 'dashboard' | 'calendar' | 'assistant' | 'alarm' | 'profile' | 'settings' | 'about';
export type TimeRange = 'week' | 'month' | 'year';
export type AIProvider = 'gemini' | 'openai';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export type SyncStatus = 'idle' | 'authorizing' | 'fetching' | 'analyzing' | 'success' | 'error';
export type ThemeMode = 'dark' | 'light';
export type AccentColor = 'indigo' | 'emerald' | 'rose' | 'amber' | 'sky';

export interface AudioState {
  isPlaying: boolean;
  isGenerating: boolean;
  progress: number;
}
