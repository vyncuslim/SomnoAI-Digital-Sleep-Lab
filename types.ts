
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

// 核心：Android 传输给网站的 API 数据结构
export interface HealthTelemetryPayload {
  source: 'health_connect' | 'android_native_bridge';
  sync_id: string; // 唯一同步 ID，防止重复写入
  device_metadata: {
    model: string;
    os_version: string;
    app_version: string;
    sync_latency_ms: number;
  };
  metrics: {
    sleep_sessions: any[]; // 原始 Health Connect 数组
    heart_rate_samples: any[];
    step_counts?: any[];
    weight_samples?: any[];
  };
  timestamp: string;
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

export type ViewType = 'dashboard' | 'calendar' | 'assistant' | 'alarm' | 'profile' | 'settings' | 'about' | 'admin' | 'admin-login';
export type SyncStatus = 'idle' | 'authorizing' | 'fetching' | 'analyzing' | 'success' | 'error';
export type Language = 'en' | 'zh';
