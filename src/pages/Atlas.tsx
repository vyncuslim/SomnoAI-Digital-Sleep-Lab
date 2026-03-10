import React from 'react';
import { FeatureLayout } from '../components/FeatureLayout';
import { Language } from '../types';

interface AtlasProps {
  lang: Language;
  onBack: () => void;
}

export const Atlas: React.FC<AtlasProps> = ({ lang, onBack }) => {
  return (
    <FeatureLayout title={lang === 'zh' ? '分析' : 'Atlas'} onBack={onBack}>
      <div className="text-slate-400">
        <p>{lang === 'zh' ? '这里是睡眠分析图谱。' : 'Welcome to the Sleep Atlas.'}</p>
      </div>
    </FeatureLayout>
  );
};
