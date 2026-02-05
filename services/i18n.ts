export type Language = 'en' | 'zh' | 'es';

/**
 * SOMNO LAB NEURAL LINGUISTICS ENGINE v10.0
 * Standardized for SomnoAI Digital Sleep Lab branding.
 */

const BRAND_NAME = "SomnoAI Digital Sleep Lab";

const commonEn = {
  brand: {
    name: BRAND_NAME,
    sublabel: "Digital Sleep Lab"
  },
  dashboard: {
    manifesto: "High-performance recovery is the blueprint for high-performance living."
  },
  assistant: {
    title: "Neural Assistant",
    intro: `Welcome back to the ${BRAND_NAME}. I have synchronized with your latest biometric telemetry. How can I optimize your restoration today?`,
    placeholder: "Ask about your sleep architecture, diet, or recovery window..."
  },
  registry: {
    title: "Profile Settings",
    subtitle: "Personal Health Calibration",
    syncing: "Synchronizing data...",
    success: "Profile Calibrated",
    failure: "Update Failed",
    commit: "Commit Changes",
    identitySector: "Account Identity",
    biometricSector: "Physiological Metrics",
    callsign: "Subject Display Name",
    identifier: "Registry Email",
    polarity: "Gender",
    sovereignty: "Privacy Sovereignty",
    sovereigntyDesc: `Your health telemetry is processed locally within our secure digital infrastructure. ${BRAND_NAME} utilizes physiological baselines exclusively for AI synthesis. Data is never persisted on our cloud nodes.`
  },
  settings: {
    title: 'Lab Config',
    language: 'Interface Language',
    coffee: 'Support Research',
    logout: 'Disconnect Session',
    apiKey: 'AI Engine Status',
    apiKeyPlaceholder: 'Input Gemini API Key...',
    age: 'Current Age',
    gender: 'Gender Identity',
    genderMale: 'Male',
    genderFemale: 'Female',
    genderOther: 'Non-Binary',
    genderNone: 'Confidential',
    height: 'Stature (cm)',
    weight: 'Mass (kg)',
    feedbackReport: 'Report Anomaly',
    feedbackSuggestion: 'System Proposal',
    feedbackImprovement: 'Feature Request'
  },
  support: {
    title: 'Support Matrix',
    subtitle: 'Laboratory Diagnostic Channels',
    techSupport: 'Technical Feedback',
    techDesc: 'Submit biometric anomalies or reporting bugs encountered in the neural link.',
    funding: 'Research Funding',
    fundingDesc: 'Support the development of advanced sleep staging models and platform scaling.',
    platforms: 'System Ecosystem',
    pcTitle: 'Desktop Node',
    pcDesc: 'Optimized for Chrome & Safari. Best for deep architecture visualization.',
    mobileTitle: 'Mobile Node',
    mobileDesc: 'Lightweight PWA support for daily recovery monitoring.',
    faq: 'System FAQ',
    donateTitle: 'CONTRIBUTION ACKNOWLEDGED',
    donateSubtitle: 'Your support fuels advanced research into neural restoration cycles.',
    backToLab: 'Return to Console'
  },
  experiment: {
    title: 'Neural Experiment',
    subtitle: 'Protocol Synthesis Engine',
    synthesizing: 'Synthesizing Hypothesis...',
    generate: 'Generate Protocol',
    noExperiment: 'No active experiment protocol found for current biometric window.',
    activeHeader: 'Active Research Protocol',
    hypothesis: 'Neural Hypothesis',
    protocol: 'Step-by-step Protocol',
    impact: 'Expected Recovery Impact',
    commit: 'Commit to Registry'
  },
  feedback: {
    exitTitle: 'Session Termination',
    exitSubtitle: 'Provide recovery feedback before disconnecting.',
    success: 'Feedback Archived',
    commentPlaceholder: 'Notes on your sleep quality or system performance...',
    submitAndLogout: 'Submit & Disconnect',
    skipAndLogout: 'Skip & Disconnect'
  }
};

const commonZh = {
  brand: {
    name: BRAND_NAME,
    sublabel: "数字化睡眠实验室"
  },
  dashboard: {
    manifesto: "优质的睡眠恢复，是高效生活的基石。"
  },
  assistant: {
    title: "AI 睡眠教练",
    intro: `欢迎回到 ${BRAND_NAME}。我已分析完您最新的生理指标，今天我能如何协助您优化恢复质量？`,
    placeholder: "询问关于您睡眠质量、饮食或恢复建议的任何问题..."
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
    sovereigntyDesc: `您的健康数据仅在浏览器本地处理。${BRAND_NAME} 生理基准数据仅用于 AI 洞察，原始数据绝不上传云端，您拥有数据的绝对控制权。`
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
    techDesc: '提交您在神经连接中遇到的生物测定异常或系统漏洞。',
    funding: '研发资助',
    fundingDesc: '支持高级睡眠分期模型开发与平台全球部署。',
    platforms: '系统生态',
    pcTitle: '桌面节点',
    pcDesc: '针对 Chrome 和 Safari 优化，最适合深度睡眠架构可视化。',
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
    success: 'Feedback Archived',
    commentPlaceholder: '记录您的睡眠质量或系统性能...',
    submitAndLogout: '提交并退出',
    skipAndLogout: '跳过并退出'
  }
};

export const translations: Record<Language, any> = {
  en: { ...commonEn },
  zh: { ...commonZh },
  es: { ...commonEn } 
};