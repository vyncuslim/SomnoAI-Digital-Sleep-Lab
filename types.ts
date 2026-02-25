export type Language = 'en' | 'zh';

export interface SleepRecord {
  score: number;
  heartRate: {
    resting: number;
  };
  deepRatio: number;
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
