import { Language } from '../types.ts';
export type { Language };

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
      blocked: 'You have violated the terms. If you have any questions, please contact admin@sleepsomno.com',
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
      heroTitle: 'SomnoAI Digital Sleep Lab',
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
        founder: 'Founder',
        signup: 'JOIN NOW',
        enter: 'SIGN IN'
      },
      founder: {
        title: "Meet the Founder",
        subtitle: "Visionary Leadership",
        readMore: "Read Founder's Vision"
      },
      newsletter: {
        title: "Stay Updated",
        subtitle: "Join our newsletter for the latest sleep science and AI updates.",
        placeholder: "Enter your email",
        button: "Subscribe",
        success: "Subscribed successfully!",
        error: "Failed to subscribe. Please try again."
      },
      search: {
        placeholder: "Search articles...",
        noResults: "No results found.",
        resultsFound: "Results found"
      },
      banner: 'Join SomnoAI Digital Sleep Lab Early Access — Limited Beta Access',
      techSpecs: {
        title: 'Technical Specifications',
        subtitle: 'The underlying architecture and telemetry metrics of SomnoAI Lab.',
        modelVersion: 'MODEL_VERSION',
        latency: 'LATENCY_MS',
        encryption: 'ENCRYPTION',
        uptime: 'UPTIME',
        samplingRate: 'SAMPLING_RATE',
        neuralLayers: 'NEURAL_LAYERS',
        dataPoints: 'DATA_POINTS',
        recoveryIndex: 'RECOVERY_INDEX'
      },
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
        mission: 'Our mission is to decode human sleep through neural interfaces and advanced AI telemetry at the SomnoAI Digital Sleep Lab.',
        links: 'Quick Links',
        legal: 'Legal',
        privacy: 'Privacy Policy',
        terms: 'Terms of Service',
        policy: 'Policy Framework',
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
      title: 'Admin Console',
      superOwner: 'Super Owner Access',
      owner: 'Owner Access',
      admin: 'Admin Access',
      tabs: {
        overview: 'Overview',
        registry: 'Registry',
        signals: 'Signals',
        system: 'System',
        feedback: 'Feedback',
        analytics: 'GA4 Telemetry',
        communications: 'Comms Center',
        reviews: 'Reviews',
        logins: 'Logins',
        errors: 'Error Logs'
      }
    },
    policy: {
      title: 'Legal & Policy Framework',
      subtitle: 'Official Policy Document',
      security: {
        title: '🔐 Security Policy',
        intro: 'SomnoAI Digital Sleep Lab is committed to maintaining the confidentiality, integrity, and availability of its systems and user data.',
        safeguardsTitle: 'We implement industry-standard technical and organizational safeguards, including but not limited to:',
        safeguards: [
          'Encrypted communications (HTTPS/TLS)',
          'Secure authentication and access control mechanisms',
          'Automated threat detection and response systems',
          'Network and infrastructure hardening',
          'Continuous monitoring and logging',
          'Principle of least privilege for administrative access',
          'Regular security assessments and vulnerability mitigation'
        ],
        prohibitionsTitle: 'Users are strictly prohibited from attempting to:',
        prohibitions: [
          'Circumvent or disable security measures',
          'Probe, scan, or test system vulnerabilities',
          'Access data not intended for them',
          'Interfere with service availability or performance',
          'Deploy malicious code or exploits',
          'Reverse engineer proprietary systems'
        ],
        footer: 'Any detected threat to platform security may result in immediate suspension or termination of access without prior notice.'
      },
      acceptableUse: {
        title: '⚖️ Acceptable Use Policy',
        intro: 'Users agree to use the platform in a lawful, ethical, and responsible manner.',
        prohibitionsTitle: 'The following activities are prohibited:',
        prohibitions: [
          'Violating any applicable laws or regulations',
          'Uploading malware, harmful code, or malicious content',
          'Attempting unauthorized access to accounts, systems, or data',
          'Impersonating individuals or organizations',
          'Using automated tools to overload or disrupt services',
          'Engaging in harassment, abuse, or harmful conduct',
          'Exploiting the platform for illegal surveillance or activities',
          'Using the service in a manner that may damage infrastructure or other users'
        ],
        footer: 'SomnoAI Digital Sleep Lab reserves the right to suspend or terminate accounts that violate this policy.'
      },
      aiDisclaimer: {
        title: '🤖 AI Usage Disclaimer',
        intro: 'The platform utilizes artificial intelligence to analyze data and generate insights.',
        outputsTitle: 'AI-generated outputs:',
        outputs: [
          'May be incomplete, inaccurate, or outdated',
          'Are probabilistic and not deterministic',
          'Do not constitute verified facts',
          'Should not be relied upon as sole decision-making guidance',
          'Are provided for informational and research purposes only'
        ],
        responsibility: 'Users are responsible for independently evaluating AI-generated information.',
        footer: 'SomnoAI Digital Sleep Lab makes no guarantees regarding the accuracy, reliability, or suitability of AI outputs for any specific purpose.'
      },
      medicalDisclaimer: {
        title: '🩺 Medical Disclaimer',
        intro: 'SomnoAI Digital Sleep Lab does not provide medical advice, diagnosis, or treatment.',
        recommendationsTitle: 'Any information, analysis, or recommendations provided:',
        recommendations: [
          'Are not a substitute for professional medical consultation',
          'Should not be used for clinical or emergency decisions',
          'Do not establish a doctor-patient relationship',
          'Are intended for informational, wellness, or research purposes only'
        ],
        consult: 'If you have a medical condition or concern, consult a qualified healthcare professional.',
        footer: 'Use of the platform is at your own risk.'
      },
      dataProcessing: {
        title: '🧾 Data Processing Statement',
        intro: 'SomnoAI Digital Sleep Lab processes personal and technical data to provide, maintain, and improve its services.',
        typesTitle: 'Types of data processed may include:',
        types: [
          'Account and contact information',
          'Device and usage data',
          'Health-related metrics voluntarily provided by users',
          'System logs and performance data',
          'Authentication and security information'
        ],
        purposesTitle: 'Processing purposes include:',
        purposes: [
          'Service delivery and functionality',
          'Security monitoring and fraud prevention',
          'Performance optimization',
          'Research and development',
          'Legal and regulatory compliance'
        ],
        safeguards: 'We implement appropriate safeguards to protect data confidentiality, integrity, and availability.',
        retention: 'Data is retained only for as long as necessary to fulfill operational or legal obligations.'
      },
      cookie: {
        title: '🍪 Cookie Policy',
        intro: 'SomnoAI Digital Sleep Lab uses cookies and similar technologies to enhance functionality and user experience.',
        purposesTitle: 'Cookies may be used for:',
        purposes: [
          'Authentication and session management',
          'Security and fraud detection',
          'Performance monitoring',
          'Preference storage',
          'Analytics and usage insights'
        ],
        control: 'Users may control cookie settings through their browser.',
        footer: 'Disabling cookies may reduce platform functionality or prevent certain features from operating properly.'
      },
      abuse: {
        title: '🚨 Abuse Reporting Policy',
        intro: 'We take abuse, misuse, and security concerns seriously.',
        reportTitle: 'Users may report suspected abuse, including:',
        reports: [
          'Unauthorized access attempts',
          'Harassment or harmful behavior',
          'Fraudulent or deceptive activity',
          'Security vulnerabilities',
          'Violations of platform policies'
        ],
        detail: 'Reports should include sufficient detail to allow investigation.',
        actionsTitle: 'SomnoAI Digital Sleep Lab reserves the right to investigate and take appropriate action, including:',
        actions: [
          'Account suspension or termination',
          'Access restrictions',
          'Content removal',
          'Reporting to relevant authorities when required by law'
        ]
      },
      blocking: {
        title: '🛡️ Account Blocking Policy',
        intro: 'SomnoAI Digital Sleep Lab reserves the right to ban accounts for reasons including:',
        reasons: [
          'Security violations or suspicious activity.',
          'Violation of our Terms of Service or Acceptable Use Policy.',
          'Actions that threaten the stability of our infrastructure.'
        ],
        notification: 'Banned users will be notified via their registered email.',
        footer: ''
      }
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
      blocked: '你违反了条款。如有问题，请联系 admin@sleepsomno.com',
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
      heroTitle: 'SomnoAI Digital Sleep Lab',
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
        founder: '创始人',
        signup: '立即加入',
        enter: '登录'
      },
      founder: {
        title: "认识创始人",
        subtitle: "富有远见的领导力",
        readMore: "阅读创始人愿景"
      },
      newsletter: {
        title: "保持更新",
        subtitle: "订阅我们的通讯，获取最新的睡眠科学和 AI 更新。",
        placeholder: "输入您的电子邮件",
        button: "订阅",
        success: "订阅成功！",
        error: "订阅失败，请重试。"
      },
      search: {
        placeholder: "搜索文章...",
        noResults: "未找到结果。",
        resultsFound: "找到结果"
      },
      banner: '加入 SomnoAI Digital Sleep Lab 早期访问 — 限量测试访问',
      techSpecs: {
        title: '技术规格',
        subtitle: 'SomnoAI 实验室的底层架构与遥测指标。',
        modelVersion: '模型版本',
        latency: '延迟 (MS)',
        encryption: '加密协议',
        uptime: '运行时间',
        samplingRate: '采样率',
        neuralLayers: '神经层',
        dataPoints: '数据点',
        recoveryIndex: '恢复指数'
      },
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
        mission: '我们的使命是在 SomnoAI Digital Sleep Lab 通过神经接口和先进... AI 遥测技术解码人类睡眠。',
        links: '快速链接',
        legal: '法律',
        privacy: '隐私政策',
        terms: '服务条款',
        policy: '政策与法律框架',
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
      title: '管理控制台',
      superOwner: '超级所有者权限',
      owner: '所有者权限',
      admin: '管理员权限',
      tabs: {
        overview: '概览',
        registry: '注册表',
        signals: '信号',
        system: '系统',
        feedback: '反馈',
        analytics: 'GA4 遥测',
        communications: '通讯中心',
        reviews: '评论',
        logins: '登录记录',
        errors: '错误日志'
      }
    },
    policy: {
      title: '法律与政策框架',
      subtitle: '官方政策文件',
      security: {
        title: '🔐 安全政策',
        intro: 'SomnoAI Digital Sleep Lab 致力于维护其系统和用户数据的机密性、完整性和可用性。',
        safeguardsTitle: '我们实施行业标准的技术和组织保障措施，包括但不限于：',
        safeguards: [
          '加密通信 (HTTPS/TLS)',
          '安全的身份验证和访问控制机制',
          '自动威胁检测和响应系统',
          '网络和基础设施加固',
          '持续监控和日志记录',
          '管理访问的最小权限原则',
          '定期安全评估和漏洞缓解'
        ],
        prohibitionsTitle: '严禁用户尝试：',
        prohibitions: [
          '规避或禁用安全措施',
          '探测、扫描或测试系统漏洞',
          '访问非预定给他们的数据',
          '干扰服务可用性或性能',
          '部署恶意代码或攻击',
          '对专有系统进行逆向工程'
        ],
        footer: '任何检测到的对平台安全的威胁都可能导致在不事先通知的情况下立即暂停或终止访问。'
      },
      acceptableUse: {
        title: '⚖️ 可接受使用政策',
        intro: '用户同意以合法、道德和负责任的方式使用平台。',
        prohibitionsTitle: '禁止以下活动：',
        prohibitions: [
          '违反任何适用的法律或法规',
          '上传恶意软件、有害代码或恶意内容',
          '尝试未经授权访问账户、系统或数据',
          '冒充个人或组织',
          '使用自动化工具使服务过载或中断',
          '参与骚扰、虐待或有害行为',
          '利用平台进行非法监视或活动',
          '以可能损害基础设施或其他用户的方式使用服务'
        ],
        footer: 'SomnoAI Digital Sleep Lab 保留暂停或终止违反此政策的账户的权利。'
      },
      aiDisclaimer: {
        title: '🤖 AI 使用免责声明',
        intro: '平台利用人工智能分析数据并生成见解。',
        outputsTitle: 'AI 生成的输出：',
        outputs: [
          '可能不完整、不准确或过时',
          '是概率性的而非确定性的',
          '不构成经过验证的事实',
          '不应被视为唯一的决策依据',
          '仅供参考和研究之用'
        ],
        responsibility: '用户负责独立评估 AI 生成的信息。',
        footer: 'SomnoAI Digital Sleep Lab 不对 AI 输出针对任何特定目的的准确性、可靠性或适用性作任何保证。'
      },
      medicalDisclaimer: {
        title: '🩺 医疗免责声明',
        intro: 'SomnoAI Digital Sleep Lab 不提供医疗建议、诊断或治疗。',
        recommendationsTitle: '提供的任何信息、分析或建议：',
        recommendations: [
          '不能替代专业的医疗咨询',
          '不应用于临床或紧急决策',
          '不建立医患关系',
          '仅用于信息、健康或研究目的'
        ],
        consult: '如果您有医疗状况或疑虑，请咨询合格的医疗保健专业人员。',
        footer: '使用平台的风险由您自行承担。'
      },
      dataProcessing: {
        title: '🧾 数据处理声明',
        intro: 'SomnoAI Digital Sleep Lab 处理个人和技术数据，以提供、维护和改进其服务。',
        typesTitle: '处理的数据类型可能包括：',
        types: [
          '账户和联系信息',
          '设备和使用数据',
          '用户自愿提供的健康相关指标',
          '系统日志和性能数据',
          '身份验证和安全信息'
        ],
        purposesTitle: '处理目的包括：',
        purposes: [
          '服务交付和功能',
          '安全监控和欺诈预防',
          '性能优化',
          '研究与开发',
          '法律和监管合规'
        ],
        safeguards: '我们实施适当的保障措施来保护数据的机密性、完整性和可用性。',
        retention: '数据仅在履行运营或法律义务所需的时间内保留。'
      },
      cookie: {
        title: '🍪 Cookie 政策',
        intro: 'SomnoAI Digital Sleep Lab 使用 Cookie 和类似技术来增强功能和用户体验。',
        purposesTitle: 'Cookie 可用于：',
        purposes: [
          '身份验证和会话管理',
          '安全和欺诈检测',
          '性能监控',
          '偏好存储',
          '分析和使用洞察'
        ],
        control: '用户可以通过浏览器控制 Cookie 设置。',
        footer: '禁用 Cookie 可能会降低平台功能或阻止某些功能正常运行。'
      },
      abuse: {
        title: '🚨 滥用举报政策',
        intro: '我们严肃对待滥用、误用和安全问题。',
        reportTitle: '用户可以举报可疑的滥用行为，包括：',
        reports: [
          '未经授权的访问尝试',
          '骚扰或有害行为',
          '欺诈或欺骗活动',
          '安全漏洞',
          '违反平台政策'
        ],
        detail: '举报应包含足够的细节以便调查。',
        actionsTitle: 'SomnoAI Digital Sleep Lab 保留调查并采取适当行动的权利，包括：',
        actions: [
          '账户暂停或终止',
          '访问限制',
          '内容移除',
          '在法律要求时向相关部门报告'
        ]
      },
      blocking: {
        title: '🛡️ 账户封禁政策',
        intro: 'SomnoAI Digital Sleep Lab 保留封禁账户的权利，原因包括：',
        reasons: [
          '安全违规或可疑活动。',
          '违反我们的服务条款或可接受使用政策。',
          '威胁我们基础设施稳定性的行为。'
        ],
        notification: '被封禁的用户将通过其注册邮箱收到通知。',
        footer: ''
      }
    }
  }
};

export const getTranslation = (lang: Language, section: string) => {
  return translations[lang]?.[section] || translations.en[section] || {};
};
