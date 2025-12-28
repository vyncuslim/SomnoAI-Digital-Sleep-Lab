
export interface SleepStage {
  name: '深睡' | 'REM' | '浅睡' | '清醒';
  duration: number; // 分钟
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
  totalDuration: number; // 分钟
  deepRatio: number; // 百分比
  remRatio: number;
  efficiency: number;
  calories?: number; // 卡路里消耗 (kcal)
  stages: SleepStage[];
  heartRate: HeartRateData;
  aiInsights: string[];
}

export type ViewType = 'dashboard' | 'calendar' | 'assistant' | 'alarm' | 'profile';

export type TimeRange = 'week' | 'month' | 'year';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export type SyncStatus = 'idle' | 'authorizing' | 'fetching' | 'analyzing' | 'success' | 'error';
