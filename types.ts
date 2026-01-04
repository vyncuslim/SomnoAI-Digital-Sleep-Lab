
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

export type ViewType = 'dashboard' | 'calendar' | 'assistant' | 'alarm' | 'profile' | 'about';

export type TimeRange = 'week' | 'month' | 'year';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export type SyncStatus = 'idle' | 'authorizing' | 'fetching' | 'analyzing' | 'success' | 'error';

export type ThemeMode = 'dark' | 'light';
export type AccentColor = 'indigo' | 'emerald' | 'rose' | 'amber' | 'sky';
