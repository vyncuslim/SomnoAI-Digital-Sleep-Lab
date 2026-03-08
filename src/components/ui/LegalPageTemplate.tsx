import React from 'react';
import { PageLayout } from './PageLayout';
import { LastUpdated, Breadcrumbs, InlineCTA } from './Components';

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
    <div className="space-y-8 hardware-panel p-6 bg-white/[0.02]">
      <div className="hardware-label">DOCUMENT_INDEX</div>
      <nav className="flex flex-col gap-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider italic">
        {toc.map(item => (
          <a key={item.id} href={`#${item.id}`} className="hover:text-indigo-400 transition-colors flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-indigo-500/30" />
            {item.label}
          </a>
        ))}
      </nav>
      <div className="pt-8 border-t border-white/5">
        <div className="hardware-label mb-4">SUPPORT_CHANNEL</div>
        <InlineCTA text="Contact Support" link="/support" />
      </div>
    </div>
  ) : undefined;

  return (
    <PageLayout sidebar={sidebar}>
      <div className="relative">
        <Breadcrumbs items={breadcrumbs} />
        <div className="mb-16 mt-8">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight uppercase italic leading-none">{title}</h1>
          <div className="flex items-center gap-4">
            <LastUpdated date={lastUpdated} version={version} />
            <div className="h-px flex-1 bg-white/5" />
            <div className="text-[10px] text-slate-600 font-mono">DOC_ID: {title.toUpperCase().replace(/\s+/g, '_')}_v1</div>
          </div>
        </div>
        <div className="prose prose-invert prose-slate max-w-none prose-headings:text-white prose-headings:font-black prose-headings:uppercase prose-headings:italic prose-headings:tracking-tight prose-a:text-indigo-400 hover:prose-a:text-indigo-300 prose-strong:text-white pb-24 font-medium leading-relaxed text-slate-400">
          {children}
        </div>
        
        <div className="text-center pt-16 border-t border-white/5">
          <div className="flex items-center justify-center gap-8">
            <InlineCTA text="Contact Legal" link="/contact" />
            <div className="w-px h-4 bg-white/10" />
            <InlineCTA text="Support" link="/support" />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};
