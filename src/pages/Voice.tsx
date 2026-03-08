import React from 'react';
import { FeatureLayout } from '../components/FeatureLayout';
import { Language } from '../types';

interface VoiceProps {
  lang: Language;
  onBack: () => void;
}

export const Voice: React.FC<VoiceProps> = ({ lang, onBack }) => {
  return (
    <FeatureLayout title={lang === 'zh' ? '语音' : 'Voice'} onBack={onBack}>
      <div className="text-slate-400">
        <p>{lang === 'zh' ? '这里是睡眠语音分析中心。' : 'Welcome to the Voice Analysis Center.'}</p>
      </div>
    </FeatureLayout>
  );
};
