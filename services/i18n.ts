export type Language = 'en' | 'zh' | 'es';

/**
 * SOMNO LAB NEURAL LINGUISTICS ENGINE v12.6
 * Optimized for Premium Research Laboratory Experience
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
      science: "SCIENTIFIC PROTOCOL",
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
    readMore: "Read Full Publication",
    backToHub: "Return to Index",
    verified: "AI RESEARCH VERIFIED",
    published: "DATE PUBLISHED",
    author: "LEAD RESEARCHER",
    category: "DOMAIN",
    readTime: "READ TIME"
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
    heroSubtitle: "SomnoAI 将生理指标监控、AI 深度洞察与健康建议融为一体，利用 Google Gemini AI 模型重构您的修复窗口并优化个人表现。",
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
      news: "科研中心"
    }
  },
  news: {
    title: "神经科研中心",
    subtitle: "关于睡眠架构与 AI 合成的学术洞察",
    readMore: "阅读完整论文",
    backToHub: "返回索引",
    verified: "AI 科研专家验证",
    published: "发布日期",
    author: "首席研究员",
    category: "研究领域",
    readTime: "阅读耗时"
  }
};

export const translations: Record<Language, any> = {
  en: commonEn,
  zh: commonZh,
  es: commonEn 
};