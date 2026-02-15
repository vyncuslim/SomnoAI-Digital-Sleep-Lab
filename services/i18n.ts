export type Language = 'en' | 'zh' | 'es';

/**
 * SOMNO LAB NEURAL LINGUISTICS ENGINE v12.2
 */

const BRAND_NAME = "SomnoAI Digital Sleep Lab";

const commonEn = {
  brand: {
    name: BRAND_NAME,
    sublabel: "Digital Sleep Lab"
  },
  landing: {
    heroTitle: "ENGINEER RECOVERY",
    heroSubtitle: "Advanced sleep architecture analysis. SomnoAI integrates wearable telemetry with Google Gemini AI models to reconstruct your restoration window and optimize performance.",
    ctaPrimary: "START OPTIMIZATION",
    ctaSecondary: "ACCESS TERMINAL",
    dispatchTitle: "LABORATORY DISPATCH",
    dispatchSub: "Secure Communication Channels",
    nav: {
      science: "SCIENTIFIC SCIENCE",
      faq: "LAB FAQ",
      project: "ABOUT PROJECT",
      support: "TECH SUPPORT",
      enter: "ENTER LAB",
      news: "RESEARCH HUB"
    },
    latestResearch: "LATEST NEURAL INSIGHTS",
    features: [
      { title: "BUILT WITH GEMINI", desc: "Neural Synthesis" },
      { title: "PRIVACY FIRST", desc: "Secure Edge Processing" },
      { title: "EDGE COMPUTING", desc: "Real-time Telemetry" }
    ]
  },
  news: {
    title: "NEURAL RESEARCH HUB",
    subtitle: "Peer-reviewed insights into sleep architecture & AI synthesis",
    readMore: "Read Full Paper",
    backToHub: "Return to Hub",
    verified: "EXPERT VERIFIED",
    published: "PUBLISHED ON"
  },
  dashboard: {
    status: "Neural Sync: Connected",
    scoreLabel: "Recovery Score",
    scoreStatus: "Optimal Restoration",
    stagingTitle: "Neural Staging",
    stagingQuote: "Our AI models detect a robust Deep/REM rhythm, suggesting high-performance neurological recovery.",
    syncTitle: "Full Sync",
    syncDesc: "Synchronize all biological telemetry nodes.",
    syncButton: "EXECUTE SIGNAL",
    syncingButton: "SYNCING...",
    protocolTitle: "The Laboratory Protocol",
    protocolSub: "From Biometric Telemetry to Human Transformation",
    steps: [
      { id: "1.", title: "BIOMETRIC INGRESS", desc: "Sync wearable data via Health Connect or our Injection Terminal for manual biological logging." },
      { id: "2.", title: "NEURAL SYNTHESIS", desc: "Leverage Google Gemini AI neural models to identify sleep efficiency and REM rhythms." },
      { id: "3.", title: "PRECISION PROTOCOL", desc: "Receive tailored optimization protocols. Identify disruptions and transform every rest period." }
    ]
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
    sovereigntyDesc: "Your health telemetry is processed locally within our secure infrastructure. Data is never persisted on our cloud nodes."
  },
  settings: {
    title: 'Lab Config',
    language: 'Language',
    coffee: 'Support Research',
    logout: 'Disconnect Session',
    age: 'Current Age',
    gender: 'Gender',
    genderMale: 'Male',
    genderFemale: 'Female',
    genderOther: 'Non-Binary',
    genderNone: 'Confidential',
    height: 'Stature (cm)',
    weight: 'Mass (kg)'
  },
  support: {
    title: 'Support Matrix',
    subtitle: 'Laboratory Support Interface',
    techSupport: 'Technical Feedback',
    techDesc: 'Submit biometric anomalies.',
    funding: 'R&D Funding',
    fundingDesc: 'Support sleep staging models.',
    pcTitle: 'Desktop Node',
    pcDesc: 'Optimized for deep architecture visualization.',
    mobileTitle: 'Mobile Node',
    mobileDesc: 'Lightweight PWA support.',
    donateTitle: 'CONTRIBUTION ACKNOWLEDGED',
    donateSubtitle: 'Your support fuels advanced research.'
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
    heroSubtitle: "它将生理指标监控、AI 深度洞察与健康建议融为一体，为您提供全方位的数字化睡眠实验室体验。",
    ctaPrimary: "开始优化",
    ctaSecondary: "访问终端",
    dispatchTitle: "实验室联络矩阵",
    dispatchSub: "安全通信频道",
    latestResearch: "最新神经学洞察",
    nav: {
      science: "科学协议",
      faq: "实验室 FAQ",
      project: "关于项目",
      support: "技术支持",
      enter: "进入实验室",
      news: "研究中心"
    }
  },
  news: {
    title: "神经科研中心",
    subtitle: "关于睡眠架构与 AI 合成的深度洞察",
    readMore: "阅读全文",
    backToHub: "返回列表",
    verified: "专家验证",
    published: "发布于"
  },
  dashboard: {
    status: "神经同步：已连接",
    scoreLabel: "恢复评分",
    scoreStatus: "最佳恢复状态",
    stagingTitle: "神经分期",
    stagingQuote: "我们的 AI 模型检测到稳健的深睡/REM 节奏，表明神经系统恢复效率极高。",
    syncTitle: "全量同步",
    syncDesc: "同步所有生物遥测节点。",
    syncButton: "执行信号注入",
    syncingButton: "正在同步...",
    protocolTitle: "实验室协议",
    protocolSub: "从生物遥测到人类潜能转化",
    steps: [
      { id: "1.", title: "生物准入", desc: "通过 Health Connect 或手动注入终端同步佩戴设备数据。" },
      { id: "2.", title: "神经合成", desc: "利用 Google Gemini AI 模型识别睡眠效率与节律。" },
      { id: "3.", title: "精准协议", desc: "获取定制化的优化方案，转化每一次休憩。" }
    ]
  }
};

export const translations: Record<Language, any> = {
  en: commonEn,
  zh: commonZh,
  es: commonEn 
};
