export type Language = 'en' | 'zh';

export const translations: Record<Language, any> = {
  en: {
    dashboard: {
      status: 'Status',
      scoreStatus: 'Score Status',
      stagingTitle: 'Staging',
      stagingQuote: 'Staging Quote',
      syncTitle: 'Sync',
      syncDesc: 'Sync Desc',
      syncingButton: 'Syncing',
      syncButton: 'Sync'
    },
    settings: {
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
      intro: 'Intro',
      placeholder: 'Placeholder'
    },
    landing: {
      ctaSecondary: 'Secondary CTA'
    }
  },
  zh: {
    dashboard: {
      status: '状态',
      scoreStatus: '评分状态',
      stagingTitle: '分期',
      stagingQuote: '分期引用',
      syncTitle: '同步',
      syncDesc: '同步描述',
      syncingButton: '同步中',
      syncButton: '同步'
    },
    settings: {
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
      intro: '介绍',
      placeholder: '占位符'
    },
    landing: {
      ctaSecondary: '次要 CTA'
    }
  }
};
