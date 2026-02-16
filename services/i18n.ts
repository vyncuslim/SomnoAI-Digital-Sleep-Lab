export type Language = 'en' | 'zh' | 'es';

/**
 * SOMNO LAB NEURAL LINGUISTICS ENGINE v12.8
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
    heroSubtitle: "Advanced biological telemetry synthesis. SomnoAI integrates wearable streams with Gemini 2.5 Pro neural models to decode restoration architecture and optimize human performance.",
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
    heroSubtitle: "SomnoAI 将生理指标监控、AI 深度洞察与健康建议融为一体，为用户提供全方位的数字化睡眠实验室体验。",
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
  }
};

export const translations: Record<Language, any> = {
  en: commonEn,
  zh: commonZh,
  es: commonEn 
};