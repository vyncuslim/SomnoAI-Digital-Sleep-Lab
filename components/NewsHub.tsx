import React from 'react';
import { motion } from 'framer-motion';
import { Microscope, ArrowRight, Tag, Clock, Calendar, Sparkles, Newspaper, Landmark } from 'lucide-react';
import { GlassCard } from './GlassCard.tsx';
import { Article } from '../types.ts';
import { Language, translations } from '../services/i18n.ts';

const m = motion as any;

const MOCK_RESEARCH: Article[] = [
  {
    id: 'art-001',
    slug: 'ai-driven-sleep-optimization-2026',
    title: 'How AI Helps Improve Deep Sleep? 2026 Latest Research',
    excerpt: 'A comprehensive breakthrough study on how multi-modal biological telemetry synthesized via Gemini AI models is revolutionizing restorative window detection.',
    content: `The paradigm of sleep monitoring has shifted from passive observation to active neural engineering. In early 2026, the SomnoAI research team successfully implemented the Gemini 2.5 Pro synthesis engine, capable of processing heart rate variability (HRV) and motion entropy with 94% alignment with clinical polysomnography.\n\n### The Neural Bridge\nBy utilizing cross-attention layers, our models identify the precise moment of transition between Light and REM sleep stages. This allows for the normalization of recovery scores against a subject's metabolic load, ensuring that sleep advice is not just accurate, but contextual.\n\n### Implications for Longevity\nUnderstanding the restoration window is critical for cognitive maintenance. Our latest cohort studies suggest that AI-timed recovery interventions can reduce neurological inflammation by up to 18% over a 30-day cycle.`,
    date: '2026-02-15',
    author: {
      name: 'Vyncuslim',
      role: 'Lead Researcher & CRO',
      bio: 'Independent researcher specializing in neural engineering and biological telemetry. Founder of the SomnoAI Digital Sleep Lab initiative. Lead architect of the 2026 recovery synthesis protocol.'
    },
    category: 'AI',
    readTime: '8 min'
  },
  {
    id: 'art-002',
    slug: 'decoded-neural-restoration-2026',
    title: 'SomnoAI Lab: Decoding the 2026 Neural Restoration Protocol',
    excerpt: 'Analyzing the intersection of biological telemetry and algorithmic intervention for elite cognitive recovery.',
    content: `For high-performance individuals, the trade-off between physical restoration (Deep Sleep) and cognitive synthesis (REM) is a constant challenge. New telemetry data from the Somno Lab suggests that technical workers benefit more from extended REM phases during high-stress development cycles.\n\n### Biological Findings\nDuring deep sleep, the glymphatic system clears metabolic waste. However, REM sleep is where complex problem-solving patterns are solidified. Our AI diagnostics indicate that subjects with higher REM ratios performed 22% better on cognitive mapping tasks the following day.\n\n### Protocol Adjustments\nTo optimize for REM, the lab suggests lower core body temperatures (18.5°C) and consistent wake windows, allowing the natural crescendo of REM phases to occur in the final hours of the cycle.`,
    date: '2026-02-10',
    author: {
      name: 'SomnoAI Team',
      role: 'Laboratory Analytics',
      bio: 'Collective research unit focused on biometric data synthesis and algorithmic sleep staging within the Digital Sleep Lab ecosystem.'
    },
    category: 'Science',
    readTime: '5 min'
  }
];

interface NewsHubProps {
  lang: Language;
  onSelectArticle: (article: Article) => void;
}

export const NewsHub: React.FC<NewsHubProps> = ({ lang, onSelectArticle }) => {
  const t = translations[lang].news;

  return (
    <div className="min-h-screen bg-[#01040a] pt-10 pb-40 px-6 font-sans text-left">
      <div className="max-w-6xl mx-auto space-y-24">
        <header className="space-y-8">
           <div className="inline-flex items-center gap-4 px-6 py-2 bg-indigo-600/10 border border-indigo-500/20 rounded-full">
              <Newspaper size={14} className="text-indigo-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400 italic">Journal of Neural Recovery • Vol 4.2</span>
           </div>
           <div className="space-y-4">
              <h1 className="text-6xl md:text-9xl font-black italic text-white uppercase tracking-tighter leading-none">
                {t.title}
              </h1>
              <p className="text-[12px] md:text-[14px] text-slate-500 font-mono font-bold uppercase tracking-[0.6em] italic">
                {t.subtitle}
              </p>
           </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {MOCK_RESEARCH.map((article) => (
            <GlassCard 
              key={article.id} 
              onClick={() => onSelectArticle(article)}
              className="p-12 rounded-[5rem] border-white/5 bg-slate-900/40 group cursor-pointer hover:border-indigo-500/30 transition-all flex flex-col justify-between"
              intensity={1.2}
            >
              <div className="space-y-10">
                 <div className="flex justify-between items-start">
                    <span className="px-5 py-2 bg-white/5 border border-white/10 text-slate-400 rounded-full text-[9px] font-black uppercase tracking-widest italic group-hover:text-indigo-400 transition-colors">
                      {article.category}
                    </span>
                    <div className="p-4 bg-slate-950 rounded-2xl text-slate-700 group-hover:text-indigo-400 transition-colors shadow-inner border border-white/5">
                      <Microscope size={24} />
                    </div>
                 </div>
                 
                 <div className="space-y-6">
                    <h3 className="text-4xl font-black italic text-white uppercase tracking-tight leading-tight group-hover:translate-x-2 transition-transform duration-500">
                      {article.title}
                    </h3>
                    <p className="text-base text-slate-500 leading-relaxed italic font-medium line-clamp-4">
                      {article.excerpt}
                    </p>
                 </div>
              </div>

              <div className="pt-12 mt-12 border-t border-white/5 flex items-center justify-between">
                 <div className="flex items-center gap-10">
                    <div className="flex flex-col">
                       <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">{t.published}</p>
                       <time className="text-xs font-black text-slate-500 italic">{article.date}</time>
                    </div>
                    <div className="flex flex-col border-l border-white/5 pl-10">
                       <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">{t.readTime}</p>
                       <p className="text-xs font-black text-slate-500 italic">{article.readTime}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3 text-[11px] font-black text-indigo-400 uppercase tracking-widest group-hover:gap-6 transition-all italic">
                    {t.readMore} <ArrowRight size={16} />
                 </div>
              </div>
            </GlassCard>
          ))}
        </div>

        <footer className="pt-32 border-t border-white/5 opacity-30 text-center flex flex-col items-center gap-6">
           <div className="flex items-center gap-4 text-slate-600">
              <Landmark size={20} />
              <p className="text-[11px] font-mono tracking-[0.5em] uppercase">SomnoAI Research Hub • SECURE_LOG_STABLE</p>
           </div>
           <div className="flex gap-12">
              <a href="/rss.xml" target="_blank" className="text-[10px] font-black uppercase text-indigo-500 hover:text-white transition-colors tracking-widest">XML FEED</a>
              <a href="/sitemap.xml" target="_blank" className="text-[10px] font-black uppercase text-indigo-500 hover:text-white transition-colors tracking-widest">NEWS SITEMAP</a>
           </div>
        </footer>
      </div>
    </div>
  );
};
