export type Language = 'en' | 'zh';

export interface SleepRecord {
  id: string;
  date: string;
  score: number;
  heartRate: {
    resting: number;
    max?: number;
  };
  deepRatio: number;
  remRatio: number;
  totalDuration: number;
  // Add other properties as needed
}

export type SyncStatus = 'idle' | 'authorizing' | 'fetching' | 'analyzing' | 'success' | 'error';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: any[];
}

export interface SleepExperiment {
  hypothesis: string;
  protocol: string[];
  expectedImpact: string;
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  tags: string[];
  imageUrl?: string;
}

export interface DiaryEntry {
  id: string;
  date: string;
  content: string;
  mood: string;
  tags: string[];
}

export type SleepStage = 'Awake' | 'Light' | 'Deep' | 'REM';

export interface HeartRateData {
  timestamp: string;
  value: number;
}
