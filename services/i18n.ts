export type Language = 'en' | 'zh' | 'es';

/**
 * SOMNO LAB NEURAL LINGUISTICS ENGINE v11.9
 * Synchronized with official mailbox matrix.
 */

const BRAND_NAME = "SomnoAI Digital Sleep Lab";

const commonEn = {
  brand: {
    name: BRAND_NAME,
    sublabel: "Digital Sleep Lab"
  },
  landing: {
    heroTitle: "MASTERY OF REST",
    heroSubtitle: "SomnoAI integrates physiological monitoring, deep AI insights, and tailored health protocols into a unified digital sleep laboratory experience.",
    ctaPrimary: "START OPTIMIZATION",
    ctaSecondary: "ACCESS TERMINAL",
    feature1Title: "Deep Immersion",
    feature1Desc: "Analyze your sleep architecture to offer insights infused with biological wisdom.",
    feature2Title: "Fluid Telemetry",
    feature2Desc: "Seamlessly sync with your lifestyle. Technology that fades into the background.",
    feature3Title: "Secure Edge",
    feature3Desc: "Your biometric data stays yours. Edge processing ensures privacy sovereignty.",
    quote: "Modern high performance is built on the foundation of high-quality stillness.",
    badge: "Powered by Google Gemini",
    footerLegal: "Edge-First Privacy Certified"
  },
  dashboard: {
    manifesto: "High-performance recovery is the blueprint for high-performance living.",
    executiveBrief: "Executive Mission Brief",
    statusActive: "ACTIVE",
    protocolLabel: "Protocol: Neural-v2.8.5",
    signalInjection: "Signal Injection",
    syncData: "Execute biological refresh from synchronized nodes.",
    syncButton: "EXECUTE FULL SYNC",
    syncingButton: "SYNCING DATA..."
  },
  assistant: {
    title: "Neural Assistant",
    intro: `Welcome to the ${BRAND_NAME}. I have synchronized with your latest biometric telemetry.`,
    placeholder: "Ask about your sleep architecture..."
  },
  registry: {
    title: "Profile Settings",
    subtitle: "Personal Health Calibration",
    syncing: "Synchronizing...",
    success: "Profile Calibrated",
    failure: "Update Failed",
    commit: "Commit Changes",
    identitySector: "Account Identity",
    biometricSector: "Physiological Metrics",
    callsign: "Subject Display Name",
    identifier: "Registry Email",
    polarity: "Gender",
    sovereignty: "Privacy Sovereignty",
    sovereigntyDesc: `Your health telemetry is processed locally within our secure infrastructure. Data is never persisted on our cloud nodes.`
  },
  settings: {
    title: 'Lab Config',
    language: 'Language',
    coffee: 'Support Research',
    logout: 'Disconnect Session',
    apiKey: 'AI Engine Status',
    apiKeyPlaceholder: 'Input API Key...',
    age: 'Current Age',
    gender: 'Gender',
    genderMale: 'Male',
    genderFemale: 'Female',
    genderOther: 'Non-Binary',
    genderNone: 'Confidential',
    height: 'Stature (cm)',
    weight: 'Mass (kg)',
    feedbackReport: 'Anomaly',
    feedbackSuggestion: 'Proposal',
    feedbackImprovement: 'Feature Request'
  },
  support: {
    title: 'Support Matrix',
    subtitle: 'Diagnostic Channels',
    techSupport: 'Feedback',
    techDesc: 'Submit biometric anomalies.',
    funding: 'Funding',
    fundingDesc: 'Support sleep staging models.',
    platforms: 'Ecosystem',
    pcTitle: 'Desktop Node',
    pcDesc: 'Best for deep architecture visualization.',
    mobileTitle: 'Mobile Node',
    mobileDesc: 'Lightweight PWA support.',
    faq: 'System FAQ',
    donateTitle: 'CONTRIBUTION ACKNOWLEDGED',
    donateSubtitle: 'Your support fuels advanced research.',
    backToLab: 'Return'
  },
  experiment: {
    title: 'Neural Experiment',
    subtitle: 'Synthesis Engine',
    synthesizing: 'Synthesizing...',
    generate: 'Generate Protocol',
    noExperiment: 'No active protocol found.',
    activeHeader: 'Active Research Protocol',
    hypothesis: 'Neural Hypothesis',
    protocol: 'Step-by-step Protocol',
    impact: 'Expected Recovery Impact',
    commit: 'Commit to Registry'
  },
  feedback: {
    exitTitle: 'Session Termination',
    exitSubtitle: 'Provide feedback before disconnecting.',
    success: 'Feedback Archived',
    commentPlaceholder: 'Notes on your sleep quality...',
    submitAndLogout: 'Submit & Disconnect',
    skipAndLogout: 'Skip & Disconnect'
  }
};

const commonZh = {
  ...commonEn,
  brand: {
    name: BRAND_NAME,
    sublabel: "数字化睡眠实验室"
  },
  landing: {
    heroTitle: "工程级 恢复方案",
    heroSubtitle: "它将生理指标监控、AI 深度洞察与健康建议融为一体，为用户提供全方位的数字化睡眠实验室体验。",
    ctaPrimary: "开始优化",
    ctaSecondary: "访问终端",
    feature1Title: "深度沉浸",
    feature1Desc: "分析您的睡眠架构，提供富有生物学智慧的洞察建议。",
    feature2Title: "流畅遥测",
    feature2Desc: "无缝融入您的生活方式。让技术隐于幕后。",
    feature3Title: "安全边缘",
    feature3Desc: "您的生物识别数据始终属于您。边缘处理确保指标绝不离开您的数字避港。",
    quote: "现代高效能建立在高质量宁静的基础之上。",
    badge: "由 Google Gemini 驱动",
    footerLegal: "边缘优先隐私认证"
  },
  dashboard: {
    manifesto: "优质的睡眠恢复，是高效生活的基石。",
    executiveBrief: "实验室执行摘要",
    statusActive: "运行中",
    protocolLabel: "协议版本: Neural-v2.8.5",
    signalInjection: "信号注入",
    syncData: "从所有同步的生态系统节点执行完整的生物刷新。",
    syncButton: "执行全量同步",
    syncingButton: "正在同步数据..."
  },
  assistant: {
    title: "AI 睡眠教练",
    intro: `欢迎回到 ${BRAND_NAME}。我已分析完您最新的生理指标。`,
    placeholder: "询问关于您睡眠质量的任何问题..."
  },
  registry: {
    title: "个人资料",
    subtitle: "个人健康指标校准",
    syncing: "正在同步...",
    success: "资料已更新",
    failure: "更新失败",
    commit: "保存资料",
    identitySector: "账户信息",
    biometricSector: "生理指标",
    callsign: "真实姓名 / 昵称",
    identifier: "登录邮箱",
    polarity: "性别",
    sovereignty: "隐私主权协议",
    sovereigntyDesc: `您的健康数据仅在浏览器本地处理。原始数据绝不上传云端。`
  },
  settings: {
    title: '实验室配置',
    language: '界面语言',
    coffee: '支持我们开发',
    logout: '退出当前登录',
    apiKey: 'AI 引擎状态',
    apiKeyPlaceholder: '输入 API 密钥...',
    age: '当前年龄',
    gender: '性别',
    genderMale: '男性',
    genderFemale: '女性',
    genderOther: '多元性别',
    genderNone: '保密',
    height: '身高 (CM)',
    weight: '体重 (KG)',
    feedbackReport: '报告异常',
    feedbackSuggestion: '系统提议',
    feedbackImprovement: '功能请求'
  },
  support: {
    title: '支持中心',
    subtitle: '实验室诊断频道',
    techSupport: '技术反馈',
    techDesc: '提交您在神经连接中遇到的生物测定异常。',
    funding: '研发资助',
    fundingDesc: '支持高级睡眠分期模型开发。',
    platforms: '系统生态',
    pcTitle: '桌面节点',
    pcDesc: '针对浏览器优化，最适合深度睡眠架构可视化。',
    mobileTitle: '移动节点',
    mobileDesc: '轻量级 PWA 支持，方便每日恢复监测。',
    faq: '常见问题',
    donateTitle: '贡献确认',
    donateSubtitle: '您的支持将推动神经恢复周期相关的高级研究。',
    backToLab: '返回实验室'
  },
  experiment: {
    title: '神经实验',
    subtitle: '协议合成引擎',
    synthesizing: '正在合成假设...',
    generate: '生成实验协议',
    noExperiment: '当前生物窗口内未发现活动实验协议。',
    activeHeader: '活动研究协议',
    hypothesis: '神经科学假设',
    protocol: '分步协议',
    impact: '预期恢复影响',
    commit: '提交到注册表'
  },
  feedback: {
    exitTitle: '会话终止',
    exitSubtitle: '断开连接前请提供恢复反馈。',
    success: '反馈已存档',
    commentPlaceholder: '记录您的睡眠质量...',
    submitAndLogout: '提交并退出',
    skipAndLogout: '跳过并退出'
  }
};

export const translations: Record<Language, any> = {
  en: commonEn,
  zh: commonZh,
  es: commonEn 
};