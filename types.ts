export type Language = 'en' | 'zh';

export interface SleepRecord {
  id: string;
  date: string;
  score: number;
  heartRate: {
    resting: number;
    max?: number;
    min?: number;
    average?: number;
    history?: HeartRateData[];
  };
  deepRatio: number;
  remRatio: number;
  totalDuration: number;
  efficiency?: number;
  stages?: SleepStage[];
  aiInsights?: string[];
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
  author: {
    name: string;
    role: string;
    bio: string;
  };
  tags: string[];
  imageUrl?: string;
  slug: string;
  category: string;
  readTime: string;
}

export interface DiaryEntry {
  id: string;
  date: string;
  content: string;
  mood: string;
  tags: string[];
  created_at?: string;
}

export interface SleepStage {
  name: string;
  duration: number;
  startTime: string;
}

export interface HeartRateData {
  timestamp: string;
  value: number;
}

export type UserRole = "user" | "editor" | "admin" | "owner";

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  is_super_owner: boolean;
  is_blocked: boolean;
  full_name: string | null;
}
