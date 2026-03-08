import React from 'react';
import { FeatureLayout } from '../components/FeatureLayout';
import { Language } from '../types';

interface DreamsProps {
  lang: Language;
  onBack: () => void;
}

export const Dreams: React.FC<DreamsProps> = ({ lang, onBack }) => {
  return (
    <FeatureLayout title={lang === 'zh' ? '投影' : 'Dreams'} onBack={onBack}>
      <div className="text-slate-400">
        <p>{lang === 'zh' ? '这里是睡眠投影中心。' : 'Welcome to the Dream Projection Center.'}</p>
      </div>
    </FeatureLayout>
  );
};
