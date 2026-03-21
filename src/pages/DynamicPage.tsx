import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { INFO_CONTENT } from '../data/infoContent';
import { Language } from '../types';
import { MarketingPageTemplate } from '../components/ui/MarketingPageTemplate';
import { LegalPageTemplate } from '../components/ui/LegalPageTemplate';
import { ProtectedView } from '../components/ProtectedView';
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

  if (content.protected) {
    return (
      <ProtectedView
        title={content.title}
        subtitle={content.subtitle}
        paragraphs={content.paragraphs || []}
        badge={lang === 'zh' ? '机密数据' : 'CONFIDENTIAL DATA'}
      />
    );
  }

  const isLegalPage = [
    'privacy-policy', 'terms-of-service', 'cookies', 'security', 
    'acceptable-use', 'ai-disclaimer', 'medical-disclaimer', 
    'data-handling', 'abuse-policy', 'account-blocking', 
    'policy-framework', 'open-source', 'legal', 'cookie-policy',
    'pricing-and-billing', 'refund-and-cancellation', 'vulnerability-disclosure',
    'appeals-and-complaints', 'intellectual-property', 'subprocessors', 'dpa',
    'children-privacy'
  ].includes(activeType as string);

  if (isLegalPage) {
    return (
      <LegalPageTemplate
        title={content.title}
        lastUpdated="March 20, 2026"
        breadcrumbs={[{ label: lang === 'zh' ? '法律' : 'Legal', link: '/legal' }, { label: content.title }]}
      >
        <div className="markdown-body text-slate-300 leading-relaxed">
          <ReactMarkdown>{content.content}</ReactMarkdown>
        </div>
      </LegalPageTemplate>
    );
  }

  return (
    <MarketingPageTemplate
      title={content.title}
      subtitle={content.subtitle}
    >
      <Section>
        <div className="markdown-body prose prose-invert max-w-none text-slate-300 text-lg leading-relaxed">
          <ReactMarkdown>{content.content}</ReactMarkdown>
        </div>
      </Section>
    </MarketingPageTemplate>
  );
};
