import React from 'react';
import { FeatureLayout } from '../components/FeatureLayout';
import { Language } from '../types';

interface TrialsProps {
  lang: Language;
  onBack: () => void;
}

export const Trials: React.FC<TrialsProps> = ({ lang, onBack }) => {
  return (
    <FeatureLayout title={lang === 'zh' ? '实验' : 'Trials'} onBack={onBack}>
      <div className="text-slate-400">
        <p>{lang === 'zh' ? '这里是睡眠实验中心。' : 'Welcome to the Sleep Experiment Center.'}</p>
      </div>
    </FeatureLayout>
  );
};
