
export const COLORS = {
  deep: '#3b82f6',
  rem: '#a855f7',
  light: '#06b6d4',
  awake: '#64748b',
  primary: '#4f46e5',
  cardBg: 'rgba(30, 41, 59, 0.5)',
};

export const MOCK_RECORD: any = {
  id: 'today',
  date: '12月27日 星期六',
  score: 82,
  totalDuration: 450,
  deepRatio: 22,
  remRatio: 18,
  efficiency: 85,
  heartRate: {
    average: 62,
    min: 54,
    max: 78,
    history: []
  },
  aiInsights: [
    "连接 Google Fit 后，将根据您的睡眠数据生成个性化建议",
    "建议在 22:30 前入睡，以获得更完整的睡眠周期",
    "保持规律的作息时间有助于提高睡眠质量"
  ],
  stages: [
    { name: '清醒', duration: 30, startTime: '23:00' },
    { name: '浅睡', duration: 120, startTime: '23:30' },
    { name: '深睡', duration: 90, startTime: '01:30' },
    { name: 'REM', duration: 60, startTime: '03:00' },
    { name: '浅睡', duration: 150, startTime: '04:00' },
  ]
};
