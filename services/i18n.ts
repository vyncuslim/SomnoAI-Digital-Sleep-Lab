
export type Language = 'en' | 'zh' | 'es';

/**
 * SOMNO LAB NEURAL LINGUISTICS ENGINE v13.0
 * Optimized for Discipline, Research, and Performance Engineering.
 */

const BRAND_NAME = "SomnoAI Digital Sleep Lab";

const commonEn = {
  brand: {
    name: BRAND_NAME,
    sublabel: "Digital Sleep Lab"
  },
  landing: {
    heroTitle: "ENGINEER RECOVERY",
    heroSubtitle: "SomnoAI Digital Sleep Lab integrates physiological monitoring, AI deep insights, and health advice to provide users with a comprehensive digital sleep lab experience.",
    ctaPrimary: "START OPTIMIZATION",
    ctaSecondary: "ACCESS TERMINAL",
    nav: {
      science: "PROTOCOL",
      faq: "LOGS FAQ",
      project: "ABOUT",
      support: "SUPPORT",
      enter: "ENTER LAB",
      news: "RESEARCH"
    }
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
    steps: [
      { title: "TELEMETRY INGRESS", desc: "Sync raw metrics via Health Connect or Injection Terminal for manual biological calibration." },
      { title: "NEURAL SYNTHESIS", desc: "Leverage Gemini 2.5 Pro models to isolate micro-patterns in Deep and REM cycles." },
      { title: "RECOVERY PROTOCOL", desc: "Receive operative optimizations. Transform restoration windows into performance assets." }
    ]
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
    statusSyncing: "Establishing Handshake...",
    statusActive: "Neural Link: ACTIVE",
    instruction: "Speak clearly. The CRO is monitoring your biological telemetry."
  },
  experiment: {
    title: "Recovery Experiments",
    generate: "SYNTHESIZE PROTOCOL",
    synthesizing: "PROCESSING...",
    noExperiment: "Baseline identified. Awaiting synthesis trigger."
  },
  registry: {
    identitySector: "Identity Archive",
    biometricSector: "Biometric Baseline",
    identifier: "Node Identifier",
    callsign: "Subject Callsign",
    polarity: "Neural Polarity",
    syncing: "SYNCING...",
    success: "NODE UPDATED",
    commit: "COMMIT METRICS",
    sovereignty: "Data Sovereignty Active",
    sovereigntyDesc: "All biological telemetry is processed at the edge and purged upon session termination."
  },
  settings: {
    title: 'Lab Config',
    language: 'Protocol Language',
    coffee: 'Support Research',
    logout: 'Disconnect Link',
    age: 'Current Age',
    gender: 'Polarity',
    genderMale: 'Male',
    genderFemale: 'Female',
    genderOther: 'Non-Binary',
    genderNone: 'N/A',
    height: 'Stature (cm)',
    weight: 'Mass (kg)',
    feedbackReport: 'Report Anomaly',
    feedbackSuggestion: 'Optimization',
    feedbackImprovement: 'Feature Proposal'
  },
  news: {
    title: "Research Hub",
    subtitle: "Validated insights into sleep architecture & AI synthesis",
    readMore: "Access Publication",
    backToHub: "Return to Index",
    verified: "AI VERIFIED",
    published: "DATE",
    author: "LEAD",
    category: "DOMAIN",
    readTime: "SCAN"
  },
  support: {
    title: "Support Node",
    techSupport: "Technical Support",
    techDesc: "Neural link troubleshooting and protocol synchronization support.",
    funding: "Research Funding",
    fundingDesc: "Support the ongoing synthesis and laboratory infrastructure.",
    community: "Laboratory Blog",
    communityDesc: "Join our community blog and neural collective on Discord.",
    pcTitle: "Terminal Access",
    pcDesc: "Optimized for large-scale biometric visualization and command.",
    mobileTitle: "Edge Node",
    mobileDesc: "Thumb-optimized for immediate status checks and basic sync.",
    donateSubtitle: "Your contribution ensures the stability of the neural restoration grid."
  },
  feedback: {
    exitTitle: "Session Termination",
    exitSubtitle: "Please rate your laboratory experience before disconnect.",
    commentPlaceholder: "Log additional observation details...",
    submitAndLogout: "SUBMIT & DISCONNECT",
    skipAndLogout: "SKIP & DISCONNECT",
    success: "LOG RECEIVED"
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
    nav: {
      science: "科学协议",
      faq: "实验室 FAQ",
      project: "关于项目",
      support: "技术支持",
      enter: "进入实验室",
      news: "科研中心"
    }
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
    steps: [
      { title: "生物遥测录入", desc: "通过 Health Connect 或注入终端同步数据，建立生理基准。" },
      { title: "神经合成分析", desc: "利用 Gemini 2.5 Pro 模型识别深睡与 REM 周期的微观模式。" },
      { title: "恢复协议执行", desc: "获取定制化优化建议。将休息窗口转化为个人表现资产。" }
    ]
  },
  voice: {
    title: "神经语音链路",
    subtitle: "实时生物识别音频合成",
    connect: "启动网桥",
    disconnect: "切断链路",
    statusIdle: "等待连接",
    statusSyncing: "执行握手...",
    statusActive: "神经链路：已激活",
    instruction: "请清晰说话。首席研究官正在监测您的生物遥测数据。"
  },
  support: {
    title: "支持节点",
    techSupport: "技术支持",
    techDesc: "神经链路故障排除与协议同步支持。",
    funding: "科研资助",
    fundingDesc: "支持持续的神经合成研究与实验室基础设施建设。",
    community: "实验室博客",
    communityDesc: "加入 Discord 社区博客与神经集体，与其他受试者交流。",
    pcTitle: "桌面终端",
    pcDesc: "针对大规模生物指标可视化与指令输入进行了优化。",
    mobileTitle: "边缘节点",
    mobileDesc: "针对大拇指单手操作优化，适合快速查看状态与同步。",
    donateSubtitle: "您的贡献将确保神经修复网格的持续稳定运行。"
  },
  feedback: {
    exitTitle: "会话终止",
    exitSubtitle: "在断开连接前，请对本次实验室体验进行评价。",
    commentPlaceholder: "记录额外的观察细节...",
    submitAndLogout: "提交并断开连接",
    skipAndLogout: "跳过并断开连接",
    success: "日志已接收"
  }
};

export const translations: Record<Language, any> = {
  en: commonEn,
  zh: commonZh,
  es: commonEn 
};
