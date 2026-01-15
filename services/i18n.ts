export type Language = 'en' | 'zh' | 'de' | 'fr';

export const translations = {
  en: {
    nav: { lab: 'lab', trends: 'TRENDS', insights: 'INSIGHTS', settings: 'SETTINGS' },
    errors: {
      healthApiDenied: 'Access Denied: Please ensure permissions are granted in Android settings.',
      syncFailed: 'Telemetry Sync Failed. Check system health link.',
      noDataFound: 'No data identified. Ensure your wearable app has synced.',
      noSleepData: 'No explicit "Sleep" sessions identified.',
      authExpired: 'System Link expired. Please re-authorize.',
      blocked: 'Access Restricted: Node suspended by system policy.'
    },
    dashboard: {
      neuralActive: 'Neural Network Active',
      liveLink: 'Live Link',
      processorLoad: 'Processor Load',
      aiSynthesis: 'AI Neural Synthesis',
      secureHandshake: 'Secure Handshake',
      stable: 'Stable',
      sleepScore: 'Sleep Score',
      deepRepair: 'Deep Repair',
      remConsolid: 'REM Consolid',
      efficiency: 'Efficiency',
      telemetry: 'Telemetric Flow',
      cmdSync: 'Sync Feature Stream',
      cmdExport: 'Archive Lab Data',
      manifesto: 'SomnoAI fuses physiological monitoring, deep AI insights, and professional health guidance into a comprehensive digital sleep laboratory experience.'
    },
    auth: {
      lab: 'SOMNOAI LAB',
      tagline: 'DIGITAL IDENTITY TELEMETRY',
      sendCode: 'REQUEST LAB TOKEN',
      emailLabel: 'Email Address',
      verifyCode: 'Verify Neural Token',
      back: 'Back to Identifier',
      handshake: 'Neural Handshake',
      dispatched: 'Token dispatched to',
      initialize: 'INITIALIZE OVERRIDE',
      resend: 'RESEND LAB TOKEN',
      wait: 'WAIT',
      retry: 'FOR RETRY',
      accessRestricted: 'ACCESS RESTRICTED',
      policyNotice: 'Wait for the cooldown to clear before requesting again.',
      auditNotice: 'Neural activity within this terminal is cryptographically logged. Access attempts are audited in real-time.'
    },
    settings: {
      title: 'SomnoAI Digital Sleep Lab',
      subtitle: 'Neural Infrastructure',
      logout: 'Disconnect & Reload',
      language: 'System Language',
      geminiCore: 'Gemini Core Engine',
      active: 'Active',
      coffee: 'Support Research',
      lastSync: 'Last Sync',
      never: 'Never',
      thankYouTitle: 'Contribution Acknowledged',
      closeReceipt: 'Return to Lab'
    }
  },
  zh: {
    nav: { lab: '实验室', trends: '趋势分析', insights: 'AI 洞察', settings: '系统设置' },
    errors: {
      healthApiDenied: '连接被拒绝：请确保在 Android 设置中授予了权限。',
      syncFailed: '遥测同步失败。请检查系统健康链路。',
      noDataFound: '未发现数据。请确保您的可穿戴设备已同步。',
      noSleepData: '未发现明确的“睡眠”会话。',
      authExpired: '系统链路已过期。请重新连接。',
      blocked: '访问受限：您的身份节点已被系统策略挂起。'
    },
    dashboard: {
      neuralActive: '神经感知网络活跃',
      liveLink: '实时遥测',
      processorLoad: '系统负载',
      aiSynthesis: 'AI 神经分析合成',
      secureHandshake: '安全链路握手',
      stable: '内核稳定',
      sleepScore: '睡眠效率评分',
      deepRepair: '深度神经修复',
      remConsolid: 'REM 记忆巩固',
      efficiency: '生物效能',
      telemetry: '生理指标遥测流',
      cmdSync: '注入特征数据',
      cmdExport: '归档实验报告',
      manifesto: '它将生理指标监控、AI 深度洞察与健康建议融为一体，为用户提供全方位的数字化睡眠实验室。'
    },
    auth: {
      lab: 'SOMNOAI 实验室',
      tagline: '数字化身份遥测',
      sendCode: '获取实验室令牌',
      emailLabel: '电子邮箱地址',
      verifyCode: '验证神经令牌',
      back: '返回身份标识',
      handshake: '神经链路握手',
      dispatched: '令牌已发送至',
      initialize: '初始化权限覆盖',
      resend: '重新请求令牌',
      wait: '等待',
      retry: '后重试',
      accessRestricted: '访问受限',
      policyNotice: '请等待冷却时间结束后再重新请求。',
      auditNotice: '此终端内的所有神经活动均经过加密记录。访问尝试受到实时审计。'
    },
    settings: {
      title: 'SomnoAI 数字化睡眠实验室',
      subtitle: '神经基础设施',
      logout: '断开连接并注销',
      language: '系统语言',
      geminiCore: 'Gemini 神经内核',
      active: '已激活',
      coffee: '支持数字化科研',
      lastSync: '最后同步',
      never: '从未同步',
      thankYouTitle: '贡献已确认',
      closeReceipt: '返回实验室控制台'
    }
  }
};
