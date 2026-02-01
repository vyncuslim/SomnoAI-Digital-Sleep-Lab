
export type Language = 'en' | 'zh' | 'es';

/**
 * SOMNO LAB NEURAL LINGUISTICS ENGINE v4.2
 * Consolidates all localized strings for subject terminals and administrative bridges.
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

// Fixed: Explicitly defining the translation map to satisfy component dependencies and TS checks
export const translations: Record<Language, any> = {
  en: { ...commonEn },
  zh: { ...commonZh },
  es: { ...commonEs }
};
