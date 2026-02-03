export type Language = 'en' | 'zh' | 'es';

/**
 * SOMNO LAB NEURAL LINGUISTICS ENGINE v4.8
 */

const commonEn = {
  dashboard: {
    manifesto: "The architecture of sleep is the blueprint of human potential."
  },
  assistant: {
    title: "Neural Assistant",
    intro: "Welcome to the Somno Lab terminal. How can I assist your biological optimization today?",
    placeholder: "Transmit query to Neural Core..."
  },
  registry: {
    title: "Neural Registry",
    subtitle: "Biological Identity & Baseline Calibration",
    syncing: "Synchronizing Registry...",
    success: "Signal Optimized",
    failure: "Sync Link Failure",
    commit: "Commit Neural Registry",
    identitySector: "Access Credentials",
    biometricSector: "Biological Metrics",
    callsign: "Callsign (Full Name)",
    identifier: "Email Identifier",
    polarity: "Neural Polarity",
    sovereignty: "Biometric Sovereignty Protocol",
    sovereigntyDesc: "Your laboratory profile is processed at the edge. Physiological baselines are used exclusively for synthetic analysis and circadian shift simulation. Data remains sovereign to this node."
  },
  settings: {
    title: 'Configuration',
    language: 'Language',
    coffee: 'Support Research',
    logout: 'Disconnect & Reload',
    apiKey: 'Neural Bridge API Key',
    apiKeyPlaceholder: 'Enter Gemini API Key...',
    age: 'Age',
    gender: 'Gender',
    genderMale: 'Male',
    genderFemale: 'Female',
    genderOther: 'Other',
    genderNone: 'N/A',
    height: 'Height',
    weight: 'Weight'
  },
  support: {
    title: 'Support Hub',
    subtitle: 'Laboratory Assistance & Research Funding',
    techSupport: 'Technical Help',
    techDesc: 'Resolve 403 Forbidden, sync errors, or report neural anomalies.',
    funding: 'Support Research',
    fundingDesc: 'Fuel processing power and the development of neural algorithms.',
    faq: 'System FAQ',
    contact: 'Direct Link',
    donateTitle: 'Contribution Protocol',
    donateSubtitle: 'Your support fuels global lab processing.',
    copySuccess: 'Identifier Copied',
    backToLab: 'Back to Terminal',
    platforms: 'Multi-Device Support',
    pcTitle: 'PC / Desktop',
    pcDesc: 'Full Command Bridge experience. Recommended for detailed analysis.',
    mobileTitle: 'Mobile / PWA',
    mobileDesc: 'Add to Home Screen for a native biometric tracking experience.'
  },
  feedback: {
    exitTitle: 'Session Termination',
    exitSubtitle: 'Please rate your Laboratory Experience',
    stars: 'Neural Link Quality',
    commentPlaceholder: 'Optional feedback for the Neural Grid...',
    submitAndLogout: 'Submit & Disconnect',
    skipAndLogout: 'Skip & Disconnect',
    success: 'Feedback Logged. Link Severed.',
    feedbackReport: 'Report Anomaly',
    feedbackSuggestion: 'Proposal',
    feedbackImprovement: 'Optimization'
  },
  experiment: {
    title: 'Neural Experimentation',
    subtitle: 'Simulate Circadian Shifts',
    synthesizing: 'Synthesizing Protocol...',
    generate: 'Generate Protocol',
    noExperiment: 'No active protocol. Initialize synthesis to begin biological simulation.',
    activeHeader: 'Active Laboratory Protocol',
    hypothesis: 'Hypothesis',
    protocol: 'Step-by-Step Protocol',
    impact: 'Expected Impact',
    commit: 'Commit to Registry'
  }
};

const commonZh = {
  dashboard: {
    manifesto: "睡眠的架构是人类潜能的蓝图。"
  },
  assistant: {
    title: "神经助手",
    intro: "欢迎来到 Somno 实验室。今天我能如何协助您的生物优化？",
    placeholder: "向神经核心传输查询..."
  },
  registry: {
    title: "神经注册表",
    subtitle: "生物身份与基准校准",
    syncing: "正在同步注册表...",
    success: "信号已优化",
    failure: "同步链路故障",
    commit: "提交神经注册表",
    identitySector: "访问凭据",
    biometricSector: "生物特征指标",
    callsign: "代号 (全名)",
    identifier: "电子邮件标识符",
    polarity: "神经极性",
    sovereignty: "生物识别主权协议",
    sovereigntyDesc: "您的实验室个人资料在边缘进行处理。生理基准仅用于合成分析和昼夜节律偏移模拟。数据主权仍归此节点所有。"
  },
  settings: {
    title: '配置',
    language: '语言',
    coffee: '支持研究',
    logout: '断开并重载',
    apiKey: '神经桥 API 密钥',
    apiKeyPlaceholder: '输入 Gemini API 密钥...',
    age: '年龄',
    gender: '性别',
    genderMale: '男',
    genderFemale: '女',
    genderOther: '其他',
    genderNone: '无',
    height: '身高',
    weight: '体重'
  },
  support: {
    title: '支持中心',
    subtitle: '实验室协助与研究资助',
    techSupport: '技术求助',
    techDesc: '解决 403 权限问题、同步错误 or 报告系统异常。',
    funding: '赞助研究',
    fundingDesc: '资助算力成本及神经算法的持续开发。',
    faq: '常见问题',
    contact: '直接联系',
    donateTitle: '贡献协议',
    donateSubtitle: '您的支持是实验室持续运行的动力。',
    copySuccess: '标识符已复制',
    backToLab: '返回实验室',
    platforms: '多端适配支持',
    pcTitle: '电脑 / 桌面端',
    pcDesc: '完整控制桥体验。推荐用于深度数据分析与实验。',
    mobileTitle: '手机 / PWA',
    mobileDesc: '点击“添加到主屏幕”即可获得类原生应用的生理追踪体验。'
  },
  feedback: {
    exitTitle: '会话终止确认',
    exitSubtitle: '请对本次实验室体验进行评分',
    stars: '神经链路质量',
    commentPlaceholder: '可选：对神经网格的改进建议...',
    submitAndLogout: '提交并断开',
    skipAndLogout: '跳过并断开',
    success: '反馈已记录。链接已切断。',
    feedbackReport: '报告异常',
    feedbackSuggestion: '功能建议',
    feedbackImprovement: '优化方案'
  },
  experiment: {
    title: '神经实验',
    subtitle: '模拟昼夜节律偏移',
    synthesizing: '正在合成方案...',
    generate: '生成实验方案',
    noExperiment: '暂无活跃方案。初始化合成以开始生物模拟。',
    activeHeader: '活跃实验室协议',
    hypothesis: '假设',
    protocol: '详细步骤协议',
    impact: '预期影响',
    commit: '提交至注册表'
  }
};

const commonEs = {
  dashboard: {
    manifesto: "La arquitectura del sueño es el plano del potencial humano."
  },
  assistant: {
    title: "Asistente Neural",
    intro: "Bienvenido a la terminal de Somno Lab. ¿Cómo puedo asistir su optimización biológica hoy?",
    placeholder: "Transmitir consulta al Núcleo Neural..."
  },
  registry: {
    title: "Registro Neural",
    subtitle: "Identidad Biológica y Calibración de Base",
    syncing: "Sincronizando Registro...",
    success: "Señal Optimizada",
    failure: "Fallo de Enlace de Sincronización",
    commit: "Comprometer Registro Neural",
    identitySector: "Credenciales de Acceso",
    biometricSector: "Métricas Biológicas",
    callsign: "Nombre de Usuario (Nombre Completo)",
    identifier: "Identificador de Correo",
    polarity: "Polaridad Neural",
    sovereignty: "Protocolo de Soberanía Biométrica",
    sovereigntyDesc: "Su perfil de laboratorio se procesa en el borde. Las líneas de base fisiológicas se utilizan exclusivamente para análisis sintéticos y simulación de cambios circadianos. Los datos permanecen soberanos en este nodo."
  },
  settings: {
    title: 'Configuración',
    language: 'Idioma',
    coffee: 'Apoyar Investigación',
    logout: 'Desconectar y Recargar',
    apiKey: 'Clave API de Puente Neural',
    apiKeyPlaceholder: 'Ingrese clave API de Gemini...',
    age: 'Edad',
    gender: 'Género',
    genderMale: 'Masculino',
    genderFemale: 'Femenino',
    genderOther: 'Otro',
    genderNone: 'N/A',
    height: 'Altura',
    weight: 'Peso'
  },
  support: {
    title: 'Centro de Soporte',
    subtitle: 'Asistencia de Laboratorio y Financiación',
    techSupport: 'Ayuda Técnica',
    techDesc: 'Resolver 403 Prohibido, errores de sincronización o anomalías.',
    funding: 'Apoyar Investigación',
    fundingDesc: 'Impulsar el poder de procesamiento y algoritmos neurales.',
    faq: 'Preguntas Frecuentes',
    contact: 'Contacto Directo',
    donateTitle: 'Protocolo de Contribución',
    donateSubtitle: 'Su apoyo impulsa el procesamiento global.',
    copySuccess: 'Identificador Copiado',
    backToLab: 'Volver a la Terminal',
    platforms: 'Soporte Multidispositivo',
    pcTitle: 'PC / Escritorio',
    pcDesc: 'Experiencia completa de puente de mando. Recomendado para análisis detallado.',
    mobileTitle: 'Móvil / PWA',
    mobileDesc: 'Añadir a la pantalla de inicio para una experiencia nativa.'
  },
  feedback: {
    exitTitle: 'Terminación de Sesión',
    exitSubtitle: 'Por favor califique su experiencia',
    stars: 'Calidad del Enlace Neural',
    commentPlaceholder: 'Comentarios opcionales...',
    submitAndLogout: 'Enviar y Desconectar',
    skipAndLogout: 'Omitir y Desconectar',
    success: 'Comentarios registrados.',
    feedbackReport: 'Reportar Anomalía',
    feedbackSuggestion: 'Propuesta',
    feedbackImprovement: 'Optimización'
  },
  experiment: {
    title: 'Experimentación Neural',
    subtitle: 'Simular Cambios Circadianos',
    synthesizing: 'Sintetizando Protocolo...',
    generate: 'Generar Protocolo',
    noExperiment: 'No hay protocolo activo. Inicie la síntesis para comenzar la simulación biológica.',
    activeHeader: 'Protocolo de Laboratorio Activo',
    hypothesis: 'Hipótesis',
    protocol: 'Protocolo Paso a Paso',
    impact: 'Impacto Esperado',
    commit: 'Comprometer al Registro'
  }
};

export const translations: Record<Language, any> = {
  en: { ...commonEn },
  zh: { ...commonZh },
  es: { ...commonEs }
};