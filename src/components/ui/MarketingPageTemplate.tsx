import React from 'react';
import { PageLayout } from './PageLayout';
import { Hero, Section, Card, InlineCTA, GridBackground } from './Components';

interface MarketingPageTemplateProps {
  title: React.ReactNode;
  subtitle: string;
  ctaPrimary?: { text: string; link: string };
  ctaSecondary?: { text: string; link: string };
  ctaTertiary?: { text: string; link: string };
  children: React.ReactNode;
}

export const MarketingPageTemplate: React.FC<MarketingPageTemplateProps> = ({ title, subtitle, ctaPrimary, ctaSecondary, ctaTertiary, children }) => {
  return (
    <PageLayout>
      <div className="relative">
        <GridBackground />
        <Hero title={title} subtitle={subtitle} ctaPrimary={ctaPrimary} ctaSecondary={ctaSecondary} ctaTertiary={ctaTertiary} />
        <div className="space-y-24 pb-24 relative z-10">
          {children}
        </div>
      </div>
    </PageLayout>
  );
};
