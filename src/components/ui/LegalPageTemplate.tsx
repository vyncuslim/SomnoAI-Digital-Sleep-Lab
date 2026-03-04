import React from 'react';
import { PageLayout } from './PageLayout';
import { Hero, LastUpdated, Breadcrumbs, AlertBanner, InlineCTA } from './Components';

interface LegalPageTemplateProps {
  title: string;
  lastUpdated: string;
  version?: string;
  breadcrumbs: { label: string; link?: string }[];
  children: React.ReactNode;
  toc?: { id: string; label: string }[];
}

export const LegalPageTemplate: React.FC<LegalPageTemplateProps> = ({ title, lastUpdated, version, breadcrumbs, children, toc }) => {
  const sidebar = toc ? (
    <div className="space-y-6">
      <h4 className="text-sm font-bold text-white uppercase tracking-wider">Contents</h4>
      <nav className="flex flex-col gap-3 text-sm text-slate-400">
        {toc.map(item => (
          <a key={item.id} href={`#${item.id}`} className="hover:text-indigo-400 transition-colors">{item.label}</a>
        ))}
      </nav>
      <div className="pt-6 border-t border-white/5">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Need Help?</h4>
        <InlineCTA text="Contact Support" link="/support" />
      </div>
    </div>
  ) : undefined;

  return (
    <PageLayout sidebar={sidebar}>
      <Breadcrumbs items={breadcrumbs} />
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">{title}</h1>
        <LastUpdated date={lastUpdated} version={version} />
      </div>
      <div className="prose prose-invert prose-slate max-w-none prose-headings:text-white prose-a:text-indigo-400 hover:prose-a:text-indigo-300 prose-strong:text-white">
        {children}
      </div>
    </PageLayout>
  );
};
