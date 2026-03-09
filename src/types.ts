export type Language = 'en' | 'zh';

export interface HeartRateData {
  time: string;
  value: number;
}

export interface SleepStage {
  stage: 'Deep' | 'Light' | 'REM' | 'Awake';
  duration: number; // minutes
  startTime: string;
  endTime: string;
}

export interface SleepRecord {
  id: string;
  date: string;
  score: number;
  heartRate: {
    resting: number;
    min: number;
    max: number;
    average: number;
    history: HeartRateData[];
  };
  deepRatio: number;
  remRatio: number;
  totalDuration: number; // minutes
  efficiency: number;
  stages: SleepStage[];
  aiInsights?: string[];
}

export interface UserProfile {
  id: string;
  email: string;
  role?: 'user' | 'editor' | 'admin' | 'owner' | 'super_owner';
  is_super_owner?: boolean;
  is_blocked?: boolean;
  blocked_reason?: string;
  block_code?: string;
  created_at?: string;
  updated_at?: string;
  full_name?: string;
  avatar_url?: string;
  preferences?: Record<string, any>;
  subscription_plan?: string;
  subscription_id?: string;
  subscription_status?: string;
  stripe_customer_id?: string;
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
    avatar?: string;
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
  userId?: string;
  email?: string;
  type: 'report' | 'suggestion' | 'compliment' | 'other';
  content: string;
  created_at: string;
  status?: 'open' | 'in-progress' | 'resolved';
}

export interface AuditLog {
  id: string;
  action: string;
  user_id: string;
  details: string | Record<string, any>;
  created_at: string;
}

export interface SecurityEvent {
  id: string;
  type: 'INFO' | 'WARNING' | 'BLOCK' | 'CRITICAL';
  details: string;
  ip_address: string;
  created_at: string;
  user_id?: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  user_email?: string;
  created_at: string;
}

export interface MarketingData {
  date: string;
  datasource: string;
  source: string;
  active_users: number;
  clicks: number;
  sessions: number;
  active1_day_users: number;
  active7_day_users: number;
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
