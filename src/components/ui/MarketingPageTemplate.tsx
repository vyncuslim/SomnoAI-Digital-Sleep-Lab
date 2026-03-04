import React from 'react';
import { PageLayout } from './PageLayout';
import { Hero, Section, Card, InlineCTA } from './Components';

interface MarketingPageTemplateProps {
  title: React.ReactNode;
  subtitle: string;
  ctaPrimary?: { text: string; link: string };
  ctaSecondary?: { text: string; link: string };
  children: React.ReactNode;
}

export const MarketingPageTemplate: React.FC<MarketingPageTemplateProps> = ({ title, subtitle, ctaPrimary, ctaSecondary, children }) => {
  return (
    <PageLayout>
      <Hero title={title} subtitle={subtitle} ctaPrimary={ctaPrimary} ctaSecondary={ctaSecondary} />
      <div className="space-y-24 pb-24">
        {children}
      </div>
    </PageLayout>
  );
};
