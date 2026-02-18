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
  about: {
    visionTitle: "OUR PHILOSOPHY",
    visionStatement: "To prove that the most powerful health tool isn't a new device—it's the AI code analyzing the data you already have.",
    missionLabel: "Project Narrative",
    compatibilityTitle: "Broad Compatibility",
    aiCoreTitle: "Core AI Analysis Capabilities",
    appleNote: "Note: Apple Watch users can sync directly. For Android, please use the SomnoAI Mobile App to bridge Health Connect data."
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
  }
};

export const translations: Record<Language, any> = {
  en: commonEn,
  zh: commonZh,
  es: commonEn 
};