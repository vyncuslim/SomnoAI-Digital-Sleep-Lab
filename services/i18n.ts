export type Language = 'en' | 'zh';

export const translations: Record<Language, any> = {
  en: {
    auth: {
      loginTitle: 'Secure Access Portal',
      signupTitle: 'Create New Registry',
      otpMode: 'OTP Mode',
      passwordMode: 'Password Mode',
      fullName: 'Your Full Name',
      email: 'Email Address',
      password: 'Password',
      loginBtn: 'Login to Lab',
      signupBtn: 'Create Registry',
      toSignup: 'New to the Lab? Sign Up',
      toLogin: 'Already registered? Sign In',
      googleBtn: 'Continue with Google',
      appleWarning: 'Apple users cannot use this temporarily.',
      blocked: 'ACCOUNT BLOCKED due to multiple failed attempts or admin action. Please contact admin@sleepsomno.com',
      emailRequired: 'Email is required',
      emailInvalid: 'Invalid email format',
      nameRequired: 'Full name is required',
      passwordRequired: 'Password is required',
      passwordTooShort: 'Password must be at least 6 characters',
      captchaRequired: 'Please complete the verification'
    },
    dashboard: {
      status: 'Status',
      scoreStatus: 'Score Status',
      stagingTitle: 'Staging',
      stagingQuote: 'Staging Quote',
      syncTitle: 'Sync',
      syncDesc: 'Sync Desc',
      syncingButton: 'Syncing',
      syncButton: 'Sync',
      noData: 'No Data Available',
      void: 'Void'
    },
    settings: {
      title: 'Settings',
      language: 'Language',
      socialLabel: 'Social',
      coffee: 'Buy me a coffee',
      logout: 'Logout',
      age: 'Age',
      height: 'Height',
      weight: 'Weight',
      genderMale: 'Male',
      genderFemale: 'Female',
      genderOther: 'Other',
      genderNone: 'Prefer not to say',
      feedbackReport: 'Report',
      feedbackSuggestion: 'Suggestion',
      feedbackImprovement: 'Improvement'
    },
    registry: {
      identitySector: 'Identity Sector',
      identifier: 'Identifier',
      clearance: 'Clearance',
      callsign: 'Callsign',
      biometricSector: 'Biometric Sector',
      polarity: 'Polarity',
      error: 'Error',
      syncing: 'Syncing',
      success: 'Success',
      commit: 'Commit',
      sovereignty: 'Sovereignty',
      sovereigntyDesc: 'Sovereignty Desc'
    },
    experiment: {
      title: 'Experiment',
      synthesizing: 'Synthesizing',
      generate: 'Generate',
      noExperiment: 'No Experiment'
    },
    assistant: {
      title: 'AI Synthesis',
      intro: 'Neural link established. Chief Research Officer online.',
      placeholder: 'Command laboratory...'
    },
    voice: {
      title: 'Neural Voice Bridge',
      subtitle: 'PROTOCOL_V3.0_LIVE',
      statusIdle: 'IDLE',
      statusSyncing: 'SYNCING...',
      statusActive: 'ACTIVE',
      instruction: 'Speak naturally to interact with the Neural Core.',
      connect: 'Initialize Bridge',
      disconnect: 'Sever Link'
    },
    dreams: {
      title: 'Dream Visualizer',
      subtitle: 'Neural Imagery Synthesis'
    },
    feedback: {
      title: 'Feedback Hub',
      subtitle: 'Laboratory Signals'
    },
    landing: {
      ctaSecondary: 'Learn More',
      heroTitle: 'DIGITAL SLEEP LAB',
      heroSubtitle: 'Integrating physiological monitoring, AI deep insights, and health recommendations to provide users with a comprehensive digital sleep laboratory experience.',
      ctaPrimary: 'Start Analysis',
      stats: {
        analyzed: 'Hours Analyzed',
        accuracy: 'Sleep Accuracy',
        users: 'Active Users',
        encrypted: 'Data Encrypted'
      },
      nav: {
        science: 'Science',
        news: 'News',
        faq: 'FAQ',
        project: 'Project',
        signup: 'JOIN NOW',
        enter: 'LOGIN'
      },
      banner: 'Join SomnoAI Digital Sleep Lab Early Access — Limited Beta Access',
      features: {
        biometric: { title: 'Biometric Tracking', desc: 'Real-time heart rate and movement analysis during sleep cycles.' },
        neural: { title: 'Neural Insights', desc: 'AI-driven interpretation of sleep stages and quality metrics.' },
        recovery: { title: 'Recovery Optimization', desc: 'Personalized protocols to enhance deep sleep and recovery.' }
      },
      protocol: {
        step1: { title: 'Connect Device', desc: 'Sync with Apple Health, Google Fit, or Oura Ring in seconds.' },
        step2: { title: 'Neural Analysis', desc: 'Our AI engine processes 50+ biometric markers during your sleep.' },
        step3: { title: 'Receive Insights', desc: 'Wake up to actionable recovery protocols and energy forecasts.' }
      },
      footer: {
        about: 'About',
        mission: 'Our mission is to decode human sleep through neural interfaces and advanced AI telemetry.',
        links: 'Quick Links',
        legal: 'Legal',
        privacy: 'Privacy Policy',
        terms: 'Terms of Service',
        opensource: 'Open Source',
        rights: 'ALL RIGHTS RESERVED'
      }
    },
    about: {
      aiCoreTitle: 'AI Core Capabilities',
      appleNote: 'Apple Health integration requires manual sync via the iOS app.'
    },
    blog: {
      title: 'Blog',
      subtitle: 'Latest Updates',
      published: 'Published',
      readTime: 'Read Time',
      readMore: 'Read More',
      backToIndex: 'Back to Index',
      author: 'Author'
    },
    news: {
      title: 'News',
      subtitle: 'Research & Announcements',
      published: 'Published',
      readTime: 'Read Time',
      readMore: 'Read More',
      backToHub: 'Back to Hub',
      verified: 'Verified',
      author: 'Author'
    },
    support: {
      title: 'Support',
      subtitle: 'How can we help?'
    },
    legal: {
      title: 'Legal',
      opensource: 'Open Source'
    },
    changelog: {
      title: 'Changelog'
    },
    science: {
      title: 'Science'
    },
    admin: {
      title: 'Admin Console'
    }
  },
  zh: {
    auth: {
      loginTitle: '安全访问门户',
      signupTitle: '创建新注册',
      otpMode: '验证码模式',
      passwordMode: '密码模式',
      fullName: '您的全名',
      email: '电子邮件地址',
      password: '密码',
      loginBtn: '登录实验室',
      signupBtn: '创建注册',
      toSignup: '新用户？注册',
      toLogin: '已注册？登录',
      googleBtn: '使用 Google 继续',
      appleWarning: 'Apple 用户暂时无法使用。',
      blocked: '由于多次尝试失败或管理员操作，账户已被封禁。请联系 admin@sleepsomno.com',
      emailRequired: '请输入电子邮件',
      emailInvalid: '电子邮件格式无效',
      nameRequired: '请输入全名',
      passwordRequired: '请输入密码',
      passwordTooShort: '密码至少需要6个字符',
      captchaRequired: '请完成验证'
    },
    dashboard: {
      status: '状态',
      scoreStatus: '评分状态',
      stagingTitle: '分期',
      stagingQuote: '分期引用',
      syncTitle: '同步',
      syncDesc: '同步描述',
      syncingButton: '同步中',
      syncButton: '同步',
      noData: '暂无数据',
      void: '空'
    },
    settings: {
      title: '设置',
      language: '语言',
      socialLabel: '社交',
      coffee: '请我喝咖啡',
      logout: '登出',
      age: '年龄',
      height: '身高',
      weight: '体重',
      genderMale: '男',
      genderFemale: '女',
      genderOther: '其他',
      genderNone: '不愿透露',
      feedbackReport: '报告',
      feedbackSuggestion: '建议',
      feedbackImprovement: '改进'
    },
    registry: {
      identitySector: '身份区域',
      identifier: '标识符',
      clearance: '权限',
      callsign: '代号',
      biometricSector: '生物识别区域',
      polarity: '极性',
      error: '错误',
      syncing: '同步中',
      success: '成功',
      commit: '提交',
      sovereignty: '主权',
      sovereigntyDesc: '主权描述'
    },
    experiment: {
      title: '实验',
      synthesizing: '合成中',
      generate: '生成',
      noExperiment: '无实验'
    },
    assistant: {
      title: 'AI 综合分析',
      intro: '神经连接已建立。首席研究官在线。',
      placeholder: '指挥实验室...'
    },
    voice: {
      title: '神经语音桥接',
      subtitle: '协议_V3.0_实时',
      statusIdle: '空闲',
      statusSyncing: '同步中...',
      statusActive: '激活',
      instruction: '自然对话以与神经核心交互。',
      connect: '初始化桥接',
      disconnect: '切断连接'
    },
    dreams: {
      title: '梦境可视化',
      subtitle: '神经图像合成'
    },
    feedback: {
      title: '反馈中心',
      subtitle: '实验室信号'
    },
    landing: {
      ctaSecondary: '了解更多',
      heroTitle: '数字睡眠实验室',
      heroSubtitle: '整合生理监测、AI 深度洞察和健康建议，为用户提供全面的数字睡眠实验室体验。',
      ctaPrimary: '开始分析',
      stats: {
        analyzed: '已分析小时',
        accuracy: '睡眠准确度',
        users: '活跃用户',
        encrypted: '数据加密'
      },
      nav: {
        science: '科学',
        news: '新闻',
        faq: '常见问题',
        project: '关于项目',
        signup: '立即加入',
        enter: '登录'
      },
      banner: '加入 SomnoAI 数字睡眠实验室早期访问 — 限量测试访问',
      features: {
        biometric: { title: '生物识别追踪', desc: '睡眠周期内的实时心率和运动分析。' },
        neural: { title: '神经洞察', desc: 'AI 驱动的睡眠阶段和质量指标解读。' },
        recovery: { title: '恢复优化', desc: '增强深度睡眠和恢复的个性化方案。' }
      },
      protocol: {
        step1: { title: '连接设备', desc: '秒级同步 Apple Health、Google Fit 或 Oura Ring。' },
        step2: { title: '神经分析', desc: '我们的 AI 引擎在您睡眠期间处理 50 多个生物识别标记。' },
        step3: { title: '获取洞察', desc: '醒来即可获得可操作的恢复方案和能量预测。' }
      },
      footer: {
        about: '关于',
        mission: '我们的使命是通过神经接口和先进的 AI 遥测技术解码人类睡眠。',
        links: '快速链接',
        legal: '法律',
        privacy: '隐私政策',
        terms: '服务条款',
        opensource: '开源',
        rights: '保留所有权利'
      }
    },
    about: {
      aiCoreTitle: 'AI 核心能力',
      appleNote: 'Apple Health 集成需要通过 iOS 应用手动同步。'
    },
    blog: {
      title: '博客',
      subtitle: '最新动态',
      published: '发布于',
      readTime: '阅读时间',
      readMore: '阅读更多',
      backToIndex: '返回',
      author: '作者'
    },
    news: {
      title: '新闻',
      subtitle: '研究与公告',
      published: '发布于',
      readTime: '阅读时间',
      readMore: '阅读更多',
      backToHub: '返回',
      verified: '已验证',
      author: '作者'
    },
    support: {
      title: '支持',
      subtitle: '我们能帮您什么？'
    },
    legal: {
      title: '法律',
      opensource: '开源'
    },
    changelog: {
      title: '更新日志'
    },
    science: {
      title: '科学'
    },
    admin: {
      title: '管理控制台'
    }
  }
};

export const getTranslation = (lang: Language, section: string) => {
  return translations[lang]?.[section] || translations.en[section] || {};
};
