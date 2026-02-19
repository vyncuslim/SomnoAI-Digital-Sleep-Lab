
export type Language = 'en' | 'zh' | 'es';

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
    heroTitle: "CODE IS THE RING. DATA IS THE SOUL.",
    heroSubtitle: "Transform your existing smartwatch into an elite biometric lab. SomnoAI bridges Health Connect data via our mobile link to deliver smart-ring depth analysis without the hardware cost.",
    ctaPrimary: "START OPTIMIZATION",
    ctaSecondary: "VIEW PHILOSOPHY",
    nav: {
      science: "PROTOCOL",
      faq: "LOGS FAQ",
      project: "PHILOSOPHY",
      support: "SUPPORT",
      enter: "ENTER LAB",
      news: "RESEARCH",
      blog: "BLOG"
    },
    pillars: {
      telemetry: { title: "HARDWARE NEUTRAL", desc: "No proprietary gear. From Apple to Garmin, if it syncs with Health Connect, SomnoAI empowers it." },
      synthesis: { title: "VIRTUAL RING", desc: "Our AI transforms ordinary sensor data into deep diagnostic insights previously exclusive to high-end smart rings." },
      protocols: { title: "MOBILE BRIDGE", desc: "Seamless integration: Device -> Health Connect -> Somno App -> Web Terminal. Encrypted & Secure." }
    }
  },
  dashboard: {
    status: "TERMINAL NOMINAL",
    scoreLabel: "Recovery Rating",
    scoreStatus: "Optimal Restoration",
    stagingTitle: "Neural Architecture",
    stagingQuote: "AI synthesis detects a robust circadian alignment, suggesting high-performance neurological recovery protocols are active.",
    syncTitle: "Cloud Ingress",
    syncDesc: "Retrieving telemetry from your Mobile App bridge.",
    syncButton: "SYNC FROM CLOUD",
    syncingButton: "PULLING DATA...",
  },
  settings: {
    title: "System Settings",
    language: "Terminal Language",
    socialLabel: "Network Presence",
    coffee: "Support the Research",
    logout: "Sever Neural Link",
    apiKeyLabel: "Neural Protocol Access Token",
    apiKeyPlaceholder: "Enter custom laboratory key...",
    apiKeySave: "COMMIT KEY",
    apiKeyNote: "Custom tokens override default laboratory synthesis nodes.",
    age: "Age",
    height: "Height",
    weight: "Weight",
    genderMale: "Male",
    genderFemale: "Female",
    genderOther: "Other",
    genderNone: "N/A",
    feedbackReport: "Report Anomaly",
    feedbackSuggestion: "Neural Proposal",
    feedbackImprovement: "Grid Optimization"
  },
  registry: {
    identitySector: "Identity Sector",
    identifier: "Node Identifier",
    callsign: "Subject Callsign",
    biometricSector: "Biometric Baseline",
    polarity: "Neural Polarity",
    commit: "COMMIT METRICS",
    syncing: "SYNCING...",
    success: "SYNC COMPLETE",
    sovereignty: "Biometric Sovereignty",
    sovereigntyDesc: "All biological telemetry is processed locally or via encrypted neural pipelines. SomnoAI does not persist raw biometric streams on external servers."
  },
  experiment: {
    title: "Clinical Trials",
    synthesizing: "SYNTHESIZING...",
    generate: "START EXPERIMENT",
    noExperiment: "Awaiting biological hypothesis..."
  },
  dreams: {
    title: "Dream Projection",
    subtitle: "Neural Visualization of Sleep Architecture",
    hqMode: "High Fidelity Synthesis",
    hqWarning: "Requires dedicated lab credits.",
    synthesizing: "ENCODING...",
    generate: "PROJECT DREAM",
    editTitle: "Architectural Mutation",
    uploadRoom: "UPLOAD BASELINE",
    editPlaceholder: "Instruction for neural modification...",
    noImage: "No projections active."
  },
  voice: {
    title: "Voice Bridge",
    subtitle: "Real-time Neural Sync",
    statusSyncing: "SYNCHRONIZING...",
    statusActive: "LINK ACTIVE",
    statusIdle: "LINK IDLE",
    instruction: "Protocol established. You may speak to the CRO.",
    connect: "INITIATE SYNC",
    disconnect: "SEVER LINK"
  },
  news: {
    title: "Research Hub",
    subtitle: "Latest findings in neural restoration",
    backToHub: "BACK TO HUB",
    readMore: "READ FULL STUDY",
    verified: "PEER REVIEWED",
    author: "PRINCIPAL INVESTIGATOR",
    published: "RELEASE DATE",
    readTime: "STUDY DEPTH"
  },
  blog: {
    title: "Laboratory Blog",
    subtitle: "Narratives from the edge of sleep science",
    backToIndex: "BACK TO BLOG",
    published: "LOG DATE",
    readTime: "READ DEPTH",
    readMore: "CONTINUE READING",
    author: "CONTRIBUTOR"
  },
  feedback: {
    exitTitle: "Lab Session Termination",
    exitSubtitle: "Biometric Feedback Required",
    success: "FEEDBACK ARCHIVED",
    commentPlaceholder: "Observations on system stability...",
    submitAndLogout: "COMMIT & TERMINATE",
    skipAndLogout: "TERMINATE SESSION"
  },
  about: {
    visionTitle: "OUR PHILOSOPHY",
    visionStatement: "To prove that the most powerful health tool isn't a new device—it's the AI code analyzing the data you already have.",
    missionLabel: "Project Narrative",
    compatibilityTitle: "Broad Compatibility",
    aiCoreTitle: "Core AI Analysis Capabilities",
    appleNote: "Note: Apple Watch users can sync directly. For Android, please use the SomnoAI Mobile App to bridge Health Connect data."
  },
  support: {
    title: "Lab Support",
    techSupport: "Technical Assistance",
    techDesc: "Resolve synchronization faults or account issues.",
    donateSubtitle: "Your support ensures continued synthesis of restoration protocols.",
    pcTitle: "Desktop Terminal",
    pcDesc: "Full administrative access and visualization.",
    mobileTitle: "Mobile Node",
    mobileDesc: "Real-time telemetry bridge for Android users."
  }
};

const commonZh = {
  ...commonEn,
  brand: {
    name: BRAND_NAME,
    sublabel: "数字化睡眠实验室"
  },
  landing: {
    heroTitle: "代码即戒指。数据即灵魂。",
    heroSubtitle: "将您现有的智能手表转化为顶级生物监测站。SomnoAI 通过移动端 App 桥接 Health Connect 数据，为您提供无需购买额外硬件的智能戒指级深度分析。",
    ctaPrimary: "开始优化",
    ctaSecondary: "品牌哲学",
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
      telemetry: { title: "硬件中立性", desc: "无需专用追踪器。只要能同步 Health Connect，SomnoAI 就能为您现有设备赋能。" },
      synthesis: { title: "虚拟智能戒指", desc: "我们的 AI 将普通的传感器数据转化为深层诊断洞察，让手表具备以往只有昂贵智能戒指才有的能力。" },
      protocols: { title: "移动端网桥", desc: "无缝集成链路：手表 -> Health Connect -> 移动应用 -> 网页终端。全程加密安全。" }
    }
  },
  dashboard: {
    status: "控制台状态正常",
    scoreLabel: "恢复评分",
    scoreStatus: "最佳修复状态",
    stagingTitle: "神经架构",
    stagingQuote: "AI 模型检测到强劲的昼夜节律对齐，显示高水平的神经系统恢复效率。",
    syncTitle: "云端接入",
    syncDesc: "正在从您的移动端 App 桥接器获取遥测数据。",
    syncButton: "从云端同步",
    syncingButton: "正在拉取数据...",
  },
  settings: {
    ...commonEn.settings,
    title: "系统设置",
    language: "终端语言",
    socialLabel: "网络节点",
    coffee: "支持实验室研究",
    logout: "切断神经链路",
    apiKeyLabel: "神经协议访问令牌",
    apiKeyPlaceholder: "输入自定义实验室密钥...",
    apiKeySave: "提交密钥",
    apiKeyNote: "自定义令牌将覆盖实验室默认的神经合成节点。"
  },
  registry: {
    ...commonEn.registry,
    identitySector: "身份板块",
    identifier: "节点标识",
    callsign: "受试者代号",
    biometricSector: "生物基准",
    polarity: "神经极性",
    commit: "提交指标",
    syncing: "正在同步...",
    success: "同步完成",
    sovereignty: "生物主权",
    sovereigntyDesc: "所有生物遥测数据均通过加密神经管道处理。SomnoAI 不会在外部服务器上持久化存储原始生物流。"
  },
  experiment: {
    ...commonEn.experiment,
    title: "临床实验",
    synthesizing: "正在合成...",
    generate: "开始实验",
    noExperiment: "等待生物假设..."
  },
  dreams: {
    ...commonEn.dreams,
    title: "梦境投影",
    subtitle: "睡眠架构的神经可视化",
    hqMode: "高保真合成",
    hqWarning: "需要专用的实验室积分。",
    synthesizing: "正在编码...",
    generate: "投影梦境",
    editTitle: "架构突变",
    uploadRoom: "上传基准",
    editPlaceholder: "神经修改指令...",
    noImage: "尚无投影。"
  },
  voice: {
    ...commonEn.voice,
    title: "语音桥接",
    subtitle: "实时神经同步",
    statusSyncing: "正在同步...",
    statusActive: "链路激活",
    statusIdle: "链路闲置",
    instruction: "协议已建立。您可以与 CRO 通话。",
    connect: "启动同步",
    disconnect: "切断链路"
  },
  news: {
    ...commonEn.news,
    title: "科研中心",
    subtitle: "神经修复领域的最新发现",
    backToHub: "返回中心",
    readMore: "阅读全文",
    verified: "同行评审",
    author: "首席研究员",
    published: "发布日期",
    readTime: "研究深度"
  },
  blog: {
    ...commonEn.blog,
    title: "实验室博客",
    subtitle: "来自睡眠科学前沿的故事",
    backToIndex: "返回博客",
    published: "记录日期",
    readTime: "阅读深度",
    readMore: "继续阅读",
    author: "撰稿人"
  },
  feedback: {
    ...commonEn.feedback,
    exitTitle: "实验室会话终止",
    exitSubtitle: "需要生物反馈",
    success: "反馈已存档",
    commentPlaceholder: "关于系统稳定性的观察...",
    submitAndLogout: "提交并终止",
    skipAndLogout: "终止会话"
  }
};

export const translations: Record<Language, any> = {
  en: commonEn,
  zh: commonZh,
  es: commonEn 
};
