import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { INFO_CONTENT } from '../data/infoContent';
import { Language } from '../types';
import { MarketingPageTemplate } from '../components/ui/MarketingPageTemplate';
import { LegalPageTemplate } from '../components/ui/LegalPageTemplate';
import { Section, HardwareButton } from '../components/ui/Components';

interface DynamicPageProps {
  lang: Language;
  type?: string;
}

export const DynamicPage: React.FC<DynamicPageProps> = ({ lang, type }) => {
  const { type: paramType } = useParams<{ type: string }>();
  const activeType = type || paramType;
  // @ts-expect-error - activeType is dynamic
  const content = INFO_CONTENT[lang]?.[activeType] || INFO_CONTENT['en']?.[activeType];
  const navigate = useNavigate();

  if (!content) {
    return (
      <div className="min-h-screen bg-[#01040a] flex flex-col items-center justify-center text-white p-8">
        <h1 className="text-4xl font-black italic mb-4">404 - Page Not Found</h1>
        <HardwareButton onClick={() => navigate(-1)}>Return</HardwareButton>
      </div>
    );
  }

  const isLegalPage = [
    'privacy-policy', 'terms-of-service', 'cookies', 'security', 
    'acceptable-use', 'ai-disclaimer', 'medical-disclaimer', 
    'data-processing', 'abuse-policy', 'account-blocking', 
    'policy-framework', 'open-source', 'legal'
  ].includes(activeType as string);

  if (isLegalPage) {
    return (
      <LegalPageTemplate
        title={content.title}
        lastUpdated={new Date().toLocaleDateString()}
        breadcrumbs={[{ label: 'Legal', link: '/legal' }, { label: content.title }]}
      >
        <div className="whitespace-pre-wrap">{content.content}</div>
      </LegalPageTemplate>
    );
  }

  return (
    <MarketingPageTemplate
      title={content.title}
      subtitle={content.subtitle}
    >
      <Section>
        <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap text-lg leading-relaxed">
          {content.content}
        </div>
      </Section>
    </MarketingPageTemplate>
  );
};
