export type Language = 'en' | 'zh';

export interface SleepRecord {
  id: string;
  date: string;
  score: number;
  heartRate: {
    resting: number;
    min: number;
    max: number;
    average: number;
    history: number[];
  };
  deepRatio: number;
  remRatio: number;
  totalDuration: number;
  efficiency: number;
  stages: any[];
  aiInsights: string[];
}
