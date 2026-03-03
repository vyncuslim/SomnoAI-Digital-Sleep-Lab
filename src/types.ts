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
    history: any[];
  };
  deepRatio: number;
  remRatio: number;
  totalDuration: number; // minutes
  efficiency: number;
  stages: any[];
  aiInsights?: any;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'none';
  height?: number; // in cm
  weight?: number; // in kg
  goals?: string[];
  devices?: string[];
  joinDate: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    role: string;
    bio: string;
  };
  date: string;
  readTime: string;
  category?: string;
  tags: string[];
  imageUrl?: string;
  source?: string;
}

export interface Feedback {
  id: string;
  userId: string;
  type: 'report' | 'suggestion' | 'improvement';
  content: string;
  date: string;
  status: 'open' | 'in-progress' | 'resolved';
}

export interface SystemStatus {
  status: 'operational' | 'degraded' | 'outage';
  lastUpdated: string;
  incidents: {
    id: string;
    title: string;
    status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
    date: string;
    updates: {
      date: string;
      message: string;
    }[];
  }[];
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalRecords: number;
  totalFeedback: number;
  systemHealth: number;
}
