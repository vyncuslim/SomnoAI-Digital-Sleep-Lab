export type Language = 'en' | 'zh' | 'es';

/**
 * SOMNO LAB NEURAL LINGUISTICS ENGINE v19.7
 */

const BRAND_NAME = "SomnoAI Digital Sleep Lab";

const commonEn = {
  brand: {
    name: BRAND_NAME,
    sublabel: "Digital Sleep Lab"
  },
  legal: {
    privacy: "Privacy",
    terms: "Terms",
    opensource: "Hybrid Architecture",
    license: "License Protocol"
  },
  landing: {
    heroTitle: "ENGINEER RECOVERY",
    heroSubtitle: "SomnoAI Digital Sleep Lab integrates physiological monitoring, AI deep insights, and health advice to provide users with a comprehensive digital sleep lab experience.",
    ctaPrimary: "START OPTIMIZATION",
    ctaSecondary: "WATCH PROTOCOL",
    nav: {
      science: "PROTOCOL",
      faq: "LOGS FAQ",
      project: "ABOUT",
      support: "SUPPORT",
      enter: "ENTER LAB",
      news: "RESEARCH",
      blog: "BLOG"
    },
    pillars: {
      telemetry: { title: "BIO TELEMETRY", desc: "Real-time synchronization of heart rate, HRV, and movement entropy." },
      synthesis: { title: "GEMINI SYNTHESIS", desc: "Advanced neural models decode complex recovery patterns." },
      protocols: { title: "RECOVERY PROTOCOLS", desc: "Tailored 3-day experiments for optimal neurological restoration." }
    }
  },
  about: {
    visionTitle: "CORE VISION",
    visionStatement: "SomnoAI Digital Sleep Lab integrates physiological monitoring, AI deep insights, and health advice to provide users with a comprehensive digital sleep lab experience.",
    missionLabel: "Project Mission"
  },
  dashboard: {
    status: "LINK NOMINAL",
    scoreLabel: "Recovery Rating",
    scoreStatus: "Optimal Restoration",
    stagingTitle: "Neural Architecture",
    stagingQuote: "AI synthesis detects a robust circadian alignment, suggesting high-performance neurological recovery protocols are active.",
    syncTitle: "Signal Sync",
    syncDesc: "Execute full biological telemetry handshake.",
    syncButton: "EXECUTE SIGNAL",
    syncingButton: "SYNCING...",
  },
  assistant: {
    intro: "Neural link established. Chief Research Officer online. How shall we optimize your recovery protocol today?",
    placeholder: "Input command to neural grid..."
  },
  voice: {
    title: "Neural Voice Link",
    subtitle: "Real-time Biometric Audio Synthesis",
    connect: "INITIATE BRIDGE",
    disconnect: "SEVER LINK",
    statusIdle: "Awaiting Connection",
    statusActive: "Neural Link: ACTIVE",
  },
  settings: {
    title: "System Configuration",
    language: "Linguistic Protocol",
    apiKeyLabel: "Neural Ingress Key",
    apiKeyPlaceholder: "Enter Gemini API Key...",
    apiKeyCommit: "COMMIT LINK",
    socialLabel: "Network Presence",
    coffee: "Support the Lab",
    logout: "Sever Neural Link",
    age: "Biological Age",
    height: "Metric Height",
    weight: "Metric Weight",
    genderMale: "Male",
    genderFemale: "Female",
    genderOther: "Other",
    genderNone: "N/A"
  },
  registry: {
    identitySector: "Identity Sector",
    biometricSector: "Biometric Baseline",
    identifier: "Node Identifier (Email)",
    callsign: "Subject Callsign (Full Name)",
    polarity: "Neural Polarity (Gender)",
    commit: "Commit Registry",
    syncing: "Synchronizing...",
    success: "Registry Synced",
    sovereignty: "Data Sovereignty",
    sovereigntyDesc: "Biometric telemetry is utilized exclusively for Neural Synthesis calibration within the SomnoAI Digital Sleep Lab."
  },
  news: {
    title: "Research Hub",
    subtitle: "Laboratory Archives & Neural Synthesis Logs",
    backToHub: "Return to Hub",
    published: "Published",
    readTime: "Read Time",
    author: "Author",
    verified: "Peer Verified",
    readMore: "View Full Protocol"
  },
  blog: {
    title: "Laboratory Stories",
    subtitle: "Narratives on Neural Restoration",
    backToIndex: "Return to Index",
    author: "Author",
    published: "Published",
    readTime: "Read Time",
    readMore: "Read More"
  },
  feedback: {
    exitTitle: "Terminal Session Exit",
    exitSubtitle: "Submit protocol feedback before severing link.",
    commentPlaceholder: "Enter laboratory observation...",
    submitAndLogout: "Submit & Sever Link",
    skipAndLogout: "Direct Severance",
    success: "Log Committed"
  },
  experiment: {
    title: "Restoration Trials",
    generate: "Synthesize Trial",
    synthesizing: "Processing Telemetry...",
    noExperiment: "No active protocol. Initialize synthesis."
  },
  support: {
    title: "Support Module",
    techSupport: "Technical Dispatch",
    techDesc: "Neural link troubleshooting and system reporting.",
    donateSubtitle: "Your support ensures the continued synthesis of neurological restoration protocols.",
    pcTitle: "Terminal Access",
    pcDesc: "Optimized for high-performance laboratory monitors.",
    mobileTitle: "Mobile Node",
    mobileDesc: "Real-time telemetry sync on the edge."
  }
};

const commonZh = {
  ...commonEn,
  brand: {
    name: BRAND_NAME,
    sublabel: "数字化睡眠实验室"
  },
  legal: {
    privacy: "隐私政策",
    terms: "服务条款",
    opensource: "混合架构隔离",
    license: "许可证协议"
  },
  landing: {
    heroTitle: "工程级 恢复方案",
    heroSubtitle: "SomnoAI Digital Sleep Lab 将生理指标监控、AI 深度洞察与健康建议融为一体，为用户提供全方位的数字化睡眠实验室体验。",
    ctaPrimary: "开始优化",
    ctaSecondary: "科学协议",
    nav: {
      science: "科学协议",
      faq: "实验室 FAQ",
      project: "关于项目",
      support: "技术支持",
      enter: "进入实验室",
      news: "科研中心",
      blog: "实验室博客"
    },
    pillars: {
      telemetry: { title: "生物遥测", desc: "实时同步心率、HRV 与体动熵值。" },
      synthesis: { title: "神经合成", desc: "通过 Gemini 高级模型解码复杂的恢复模式。" },
      protocols: { title: "恢复协议", desc: "定制化的 3 日实验方案，实现最佳神经系统修复。" }
    }
  },
  about: {
    visionTitle: "核心愿景",
    visionStatement: "SomnoAI Digital Sleep Lab 将生理指标监控、AI 深度洞察与健康建议融为一体，为用户提供全方位的数字化睡眠实验室体验。",
    missionLabel: "项目概述"
  },
  dashboard: {
    status: "神经链路已连接",
    scoreLabel: "恢复评分",
    scoreStatus: "最佳修复状态",
    stagingTitle: "神经架构",
    stagingQuote: "AI 模型检测到强劲的深睡/REM 节奏，显示高水平的神经系统恢复效率。",
    syncTitle: "全域同步",
    syncDesc: "执行完整的生物指标握手协议。",
    syncButton: "执行同步",
    syncingButton: "同步中...",
  },
  voice: {
    title: "神经语音链路",
    subtitle: "实时生物识别音频合成",
    connect: "启动网桥",
    disconnect: "切断链路",
    statusIdle: "等待连接",
    statusActive: "神经链路：已激活",
  },
  settings: {
    title: "系统配置",
    language: "语言协议",
    apiKeyLabel: "神经准入密钥",
    apiKeyPlaceholder: "输入 Gemini API Key...",
    apiKeyCommit: "建立链路",
    socialLabel: "网络节点",
    coffee: "支持实验室",
    logout: "切断神经链路",
    age: "生理年龄",
    height: "公制身高",
    weight: "公制体重",
    genderMale: "男性",
    genderFemale: "女性",
    genderOther: "其他",
    genderNone: "不便透露"
  },
  registry: {
    identitySector: "身份扇区",
    biometricSector: "生物特征基准",
    identifier: "节点标识符 (Email)",
    callsign: "受试者呼号 (姓名)",
    polarity: "神经极性 (性别)",
    commit: "提交注册",
    syncing: "正在同步...",
    success: "注册已同步",
    sovereignty: "数据主权",
    sovereigntyDesc: "生物遥测数据仅用于 SomnoAI 数字化睡眠实验室内的神经合成校准。"
  },
  news: {
    title: "科研中心",
    subtitle: "实验室档案与神经合成日志",
    backToHub: "返回中心",
    published: "发布时间",
    readTime: "阅读时长",
    author: "作者",
    verified: "同行评审已验证",
    readMore: "查看完整协议"
  },
  blog: {
    title: "实验室博文",
    subtitle: "关于神经系统修复的叙事",
    backToIndex: "返回列表",
    author: "作者",
    published: "发布时间",
    readTime: "阅读时长",
    readMore: "阅读更多"
  },
  feedback: {
    exitTitle: "终断会话",
    exitSubtitle: "在切断链路前提交您的实验反馈。",
    commentPlaceholder: "输入实验室观察结论...",
    submitAndLogout: "提交并切断链路",
    skipAndLogout: "直接退出",
    success: "日志已记录"
  },
  experiment: {
    title: "恢复实验",
    generate: "合成实验方案",
    synthesizing: "正在处理遥测...",
    noExperiment: "尚无激活协议。请初始化合成。"
  },
  support: {
    title: "支持中心",
    techSupport: "技术派遣",
    techDesc: "处理神经链路故障与系统报告。",
    donateSubtitle: "您的支持将确保神经系统恢复协议的持续合成。",
    pcTitle: "终端访问",
    pcDesc: "已为高性能实验室显示器优化。",
    mobileTitle: "移动节点",
    mobileDesc: "实时边缘遥测同步。"
  }
};

export const translations: Record<Language, any> = {
  en: commonEn,
  zh: commonZh,
  es: commonEn 
};