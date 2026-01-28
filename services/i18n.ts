export type Language = 'en' | 'zh';

const commonEn = {
  nav: { lab: 'LAB', trends: 'TRENDS', insights: 'CORE', settings: 'CFG' },
  errors: {
    healthApiDenied: 'Access Denied: Permissions required in system settings.',
    syncFailed: 'Telemetry Sync Failed. Node unreachable.',
    noDataFound: 'No data identified in local storage.',
    noSleepData: 'No sleep metrics detected.',
    authExpired: 'Session expired. Re-authorization required.',
    blocked: 'Access Restricted by System Policy.'
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
    cmdSync: 'Sync Lab Data',
    cmdExport: 'Archive Metrics',
    lullaby: 'Neural Lullaby',
    manifesto: 'It integrates physiological indicator monitoring, AI deep insights, and health advice to provide users with a comprehensive digital sleep experiment experience.'
  },
  settings: {
    title: 'Configuration',
    language: 'Language',
    coffee: 'Support Research',
    logout: 'Disconnect & Reload',
    profileTitle: 'Subject Profile',
    displayName: 'Callsign',
    personalInfo: 'Biological Metadata',
    age: 'Age',
    gender: 'Neural Polarity',
    genderMale: 'Male',
    genderFemale: 'Female',
    genderOther: 'Other',
    genderNone: 'N/A',
    height: 'Height',
    weight: 'Mass',
    preferences: 'Logic Preferences',
    units: 'Calibration Units',
    coaching: 'CRO Style',
    styleClinical: 'Clinical',
    styleMotivational: 'Motivational',
    styleMinimal: 'Minimalist',
    paypalId: 'Vyncuslim vyncuslim',
    duitNowId: '+60 187807388',
    paypalLink: 'https://paypal.me/vyncuslim',
    feedback: 'Lab Feedback',
    feedbackSub: 'Identify anomalies or propose improvements',
    feedbackType: 'Log Type',
    feedbackReport: 'Report',
    feedbackSuggestion: 'Suggestion',
    feedbackImprovement: 'Improvement',
    feedbackEmail: 'Contact Node (Email)',
    feedbackContent: 'Telemetry Log / Description',
    feedbackSubmit: 'Execute Submission',
    feedbackSuccess: 'Log Committed',
    feedbackError: 'Registry Failure'
  },
  auth: {
    lab: 'SomnoAI Digital Sleep Lab',
    tagline: 'NEURAL INFRASTRUCTURE • DIGITAL TELEMETRY',
    manifesto: 'It integrates physiological indicator monitoring, AI deep insights, and health advice to provide users with a comprehensive digital sleep experiment experience.',
    sendCode: 'REQUEST LAB TOKEN',
    emailLabel: 'Email Identifier',
    passwordLabel: 'Access Password',
    authorize: 'AUTHORIZE ACCESS',
    confirmRegister: 'CONFIRM REGISTRATION',
    google: 'GOOGLE',
    sandbox: 'SANDBOX MODE',
    help: 'CANNOT ACTIVATE ACCOUNT?',
    verifyCode: 'Verify Token',
    back: 'Back to Terminal',
    handshake: 'Neural Handshake',
    dispatched: 'Token dispatched',
    initialize: 'INITIALIZE OVERRIDE',
    resend: 'RESEND TOKEN',
    wait: 'WAIT',
    retry: 'FOR RETRY',
    accessRestricted: 'ACCESS RESTRICTED',
    policyNotice: 'Wait for cooldown to clear.',
    auditNotice: 'Neural activity is cryptographically logged.',
    forgotPassword: 'Forgot Key?',
    resetHeading: 'RECOVER ACCESS',
    resetSub: 'Enter email for recovery link.',
    sendReset: 'SEND RECOVERY LINK',
    resetSuccess: 'Handshake initiated.'
  },
  assistant: {
    title: 'Neural Core',
    intro: 'Neural link established. How can I optimize your recovery?',
    placeholder: 'Input telemetry query...',
    error: 'Synthesis failed.',
    generateLullaby: 'Neural Lullaby',
    playing: 'Synthesizing...'
  },
  about: {
    title: 'Knowledge Base',
    manifesto: 'Complete, systematic, and direct digital laboratory manual for physiological monitoring and AI-driven health optimization.',
    sections: {
      intro: {
        title: 'Manifesto',
        content: 'SomnoAI Digital Sleep Lab integrates physiological indicator monitoring, AI deep insights, and health advice into a unified digital experience. Our mission is to transform raw biometric data into actionable health protocols using state-of-the-art neural synthesis.'
      },
      monitoring: {
        title: 'Physiological Telemetry',
        content: 'We utilize high-precision wearable bridges to monitor heart rate variability (HRV), sleep architecture (Deep, REM, Light), and circadian rhythms. This data forms the baseline for all neural experiments.'
      },
      aiInsights: {
        title: 'Neural Synthesis Logic',
        content: 'Our Gemini-powered core analyzes physiological patterns to identify clearing efficiency and memory consolidation states. The AI acts as a Chief Biohacker, identifying anomalies and proposing tactical optimizations.'
      },
      privacy: {
        title: 'Security Protocol',
        content: 'SomnoAI operates on an "Edge-First" philosophy. Your biometric telemetry is processed locally or via transient encrypted streams. We adhere to the strictest Google API data minimization policies.'
      },
      guide: {
        title: 'Operational Guide',
        content: '1. Establish Device Link via Health Connect.\n2. Execute Daily Sync to update telemetry logs.\n3. Consultation with Neural Core for insight synthesis.\n4. Implementation of Tactical Health Protocols.'
      }
    }
  }
};

const commonZh = {
  nav: { lab: '实验室', trends: '趋势', insights: '核心', settings: '配置' },
  errors: {
    healthApiDenied: '拒绝访问：系统设置中未获得权限。',
    syncFailed: '遥测同步失败。节点无法连接。',
    noDataFound: '本地存储中未发现数据。',
    noSleepData: '未检测到睡眠指标。',
    authExpired: '会话已过期，请重新登录。',
    blocked: '系统策略限制访问。'
  },
  dashboard: {
    neuralActive: '神经网络活跃',
    liveLink: '实时链接',
    processorLoad: '处理器负载',
    aiSynthesis: 'AI 神经合成',
    secureHandshake: '安全握手',
    stable: '稳定',
    sleepScore: '睡眠分数',
    deepRepair: '深度修复',
    remConsolid: 'REM 巩固',
    efficiency: '睡眠效率',
    telemetry: '遥测流',
    cmdSync: '同步实验室数据',
    cmdExport: '归档指标',
    lullaby: '神经催眠曲',
    manifesto: '它将生理指标监控、AI 深度洞察与健康建议融为一体，为用户提供全方位的数字化睡眠实验室体验。'
  },
  settings: {
    title: '系统配置',
    language: '界面语言',
    coffee: '支持研究',
    logout: '断开链接并重载',
    profileTitle: '受试者档案',
    displayName: '呼号',
    personalInfo: '生物元数据',
    age: '年龄',
    gender: '极性',
    genderMale: '男',
    genderFemale: '女',
    genderOther: '其他',
    genderNone: '不详',
    height: '身高',
    weight: '体重',
    preferences: '逻辑偏好',
    units: '校准单位',
    coaching: 'CRO 风格',
    styleClinical: '临床',
    styleMotivational: '激励',
    styleMinimal: '极简',
    paypalId: 'Vyncuslim vyncuslim',
    duitNowId: '+60 187807388',
    paypalLink: 'https://paypal.me/vyncuslim',
    feedback: '实验室反馈',
    feedbackSub: '识别异常或提出改进建议',
    feedbackType: '日志类型',
    feedbackReport: '报告异常',
    feedbackSuggestion: '功能建议',
    feedbackImprovement: '改进方案',
    feedbackEmail: '联系节点 (邮箱)',
    feedbackContent: '遥测日志 / 详细说明',
    feedbackSubmit: '执行提交',
    feedbackSuccess: '日志已记录',
    feedbackError: '注册失败'
  },
  auth: {
    lab: 'SomnoAI 数字睡眠实验室',
    tagline: '神经基础设施 • 数字遥测',
    manifesto: '它将生理指标监控、AI 深度洞察与健康建议融为一体，为用户提供全方位的数字化睡眠实验室体验。',
    sendCode: '请求实验室令牌',
    emailLabel: '邮箱标识符',
    passwordLabel: '访问密码',
    authorize: '授权访问',
    confirmRegister: '确认注册',
    google: 'GOOGLE 登录',
    sandbox: '沙盒模式',
    help: '无法激活账户？',
    verifyCode: '验证令牌',
    back: '返回终端',
    handshake: '神经握手',
    dispatched: '令牌已发送',
    initialize: '初始化覆盖',
    resend: '重新发送',
    wait: '请等待',
    retry: '后重试',
    accessRestricted: '访问受限',
    policyNotice: '等待冷却时间结束。',
    auditNotice: '神经活动已被加密记录。',
    forgotPassword: '忘记密钥？',
    resetHeading: '恢复访问',
    resetSub: '输入邮箱以发送恢复链接。',
    sendReset: '发送恢复链接',
    resetSuccess: '握手已启动。'
  },
  assistant: {
    title: '神经核心',
    intro: '神经链接已建立。我该如何优化您的恢复过程？',
    placeholder: '输入遥测查询...',
    error: '合成失败。',
    generateLullaby: '神经催眠曲',
    playing: '正在合成...'
  },
  about: {
    title: '知识库',
    manifesto: '完整、系统化、可直接上线的数字化实验室手册，涵盖生理监控与 AI 健康优化。',
    sections: {
      intro: {
        title: '核心宣言',
        content: 'SomnoAI 数字睡眠实验室将生理指标监控、AI 深度洞察与健康建议融为一体。我们的使命是利用先进的神经合成技术，将原始生物遥测数据转化为可执行的健康协议。'
      },
      monitoring: {
        title: '生理遥测',
        content: '我们利用高精度穿戴设备桥接，监控心率变异性 (HRV)、睡眠结构 (深度、REM、浅睡) 以及昼夜节律。这些数据构成了所有神经实验的基础。'
      },
      aiInsights: {
        title: '神经合成逻辑',
        content: '我们的 Gemini 驱动核心分析生理模式，以识别大脑清理效率和记忆巩固状态。AI 担任首席生物客 (Chief Biohacker)，识别异常并提出战术优化。'
      },
      privacy: {
        title: '安全协议',
        content: 'SomnoAI 坚持“边缘优先”理念。您的生物指标在本地处理或通过加密流传输。我们遵守最严格的 Google API 数据最小化政策。'
      },
      guide: {
        title: '操作指南',
        content: '1. 通过 Health Connect 建立设备连接。\n2. 执行每日同步以更新遥测日志。\n3. 与神经核心互动进行洞察合成。\n4. 实施战术健康协议。'
      }
    }
  }
};

export const translations: Record<Language, typeof commonEn> = {
  en: commonEn,
  zh: commonZh
};
