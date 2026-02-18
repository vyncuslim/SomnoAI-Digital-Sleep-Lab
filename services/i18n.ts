export type Language = 'en' | 'zh' | 'es';

/**
 * SOMNO LAB NEURAL LINGUISTICS ENGINE v21.0
 * Core Philosophy: Zero Hardware. AI Transformation. Mobile-to-Web Sync.
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
    opensource: "Architecture",
    license: "License Protocol"
  },
  landing: {
    heroTitle: "ZERO HARDWARE. ELITE INTELLIGENCE.",
    heroSubtitle: "Transform your existing smartwatch into a high-performance biometric lab. We use Health Connect and Gemini AI to give your gear the power of a professional smart ring.",
    ctaPrimary: "START OPTIMIZATION",
    ctaSecondary: "VIEW ARCHITECTURE",
    nav: {
      science: "SCIENCE",
      faq: "LOGS FAQ",
      project: "PHILOSOPHY",
      support: "SUPPORT",
      enter: "ENTER LAB",
      news: "RESEARCH",
      blog: "BLOG"
    },
    pillars: {
      telemetry: { title: "HARDWARE NEUTRAL", desc: "No specific trackers required. Use your existing Apple or Android wearables via Health Connect." },
      synthesis: { title: "VIRTUAL RING ENGINE", desc: "Our AI transforms standard sensor data into the diagnostic depth of a smart ring." },
      protocols: { title: "MOBILE-TO-WEB BRIDGE", desc: "Local telemetry is aggregated via our mobile app and synced to your web dashboard." }
    }
  },
  about: {
    visionTitle: "OUR PHILOSOPHY",
    visionStatement: "To democratize elite health diagnostics by proving that the most powerful ring is the AI code running behind your existing watch.",
    missionLabel: "Project Mission"
  },
  dashboard: {
    status: "NODE NOMINAL",
    scoreLabel: "Recovery Rating",
    scoreStatus: "Optimal Restoration",
    stagingTitle: "Neural Architecture",
    stagingQuote: "AI synthesis detects a robust circadian alignment, suggesting high-performance neurological recovery protocols are active.",
    syncTitle: "Mobile Sync",
    syncDesc: "Pulling telemetry from your Mobile App bridge.",
    syncButton: "SYNC FROM MOBILE NODE",
    syncingButton: "PULLING DATA...",
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
    opensource: "架构体系",
    license: "许可证协议"
  },
  landing: {
    heroTitle: "零成本硬件。纯 AI 洞察。",
    heroSubtitle: "将您现有的智能手表转化为高性能生物实验室。利用 Health Connect 与 Gemini AI，赋予您的设备以专业智能戒指般的分析能力。",
    ctaPrimary: "开始优化",
    ctaSecondary: "查看架构",
    nav: {
      science: "科学架构",
      faq: "实验室 FAQ",
      project: "品牌哲学",
      support: "技术支持",
      enter: "进入实验室",
      news: "科研中心",
      blog: "实验室博客"
    },
    pillars: {
      telemetry: { title: "硬件中立性", desc: "无需购买特定设备。支持 Apple 或 Android（通过 Health Connect）现有的各种可穿戴设备。" },
      synthesis: { title: "数字戒指引擎", desc: "AI 算法赋予您的手表以顶级智能戒指（如 Oura）般的诊断深度。" },
      protocols: { title: "移动-Web 桥接", desc: "通过移动 App 聚合 Health Connect 数据，并无缝同步至您的 Web 控制台。" }
    }
  },
  about: {
    visionTitle: "品牌哲学",
    visionStatement: "让精英级健康诊断普适化。我们相信最强大的“戒指”是运行在您手表背后的 AI 代码。",
    missionLabel: "项目概述"
  },
  dashboard: {
    status: "节点正常",
    scoreLabel: "恢复评分",
    scoreStatus: "最佳修复状态",
    stagingTitle: "神经架构",
    stagingQuote: "AI 模型检测到强劲的昼夜节律对齐，显示高水平的神经系统恢复效率。",
    syncTitle: "移动同步",
    syncDesc: "从移动 App 桥接器获取遥测数据。",
    syncButton: "从移动节点同步",
    syncingButton: "正在拉取数据...",
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