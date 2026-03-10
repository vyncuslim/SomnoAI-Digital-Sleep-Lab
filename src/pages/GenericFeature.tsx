import React from 'react';
import { FeatureLayout } from '../components/FeatureLayout';
import { Language } from '../types';

interface GenericFeatureProps {
  lang: Language;
  onBack: () => void;
  title: string;
  description: string;
}

export const GenericFeature: React.FC<GenericFeatureProps> = ({ lang, onBack, title, description }) => {
  return (
    <FeatureLayout title={title} onBack={onBack}>
      <div className="text-slate-400">
        <p>{description}</p>
      </div>
    </FeatureLayout>
  );
};
