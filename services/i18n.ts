export type Language = 'en' | 'zh' | 'es';

/**
 * SOMNO LAB NEURAL LINGUISTICS ENGINE v19.6
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
    logout: "Sever Neural Link"
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
    logout: "切断神经链路"
  }
};

export const translations: Record<Language, any> = {
  en: commonEn,
  zh: commonZh,
  es: commonEn 
};