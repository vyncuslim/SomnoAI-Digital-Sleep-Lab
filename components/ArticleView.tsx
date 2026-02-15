import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Calendar, User, ShieldCheck, Tag, Share2, Info } from 'lucide-react';
import { GlassCard } from './GlassCard.tsx';
import { Article } from '../types.ts';
import { Language, translations } from '../services/i18n.ts';

const m = motion as any;

interface ArticleViewProps {
  article: Article;
  lang: Language;
  onBack: () => void;
}

export const ArticleView: React.FC<ArticleViewProps> = ({ article, lang, onBack }) => {
  const t = translations[lang].news;

  useEffect(() => {
    // Advanced NewsArticle Schema for 2026 Google News compliance
    const schema = {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://sleepsomno.com/article/${article.slug}`
      },
      "headline": article.title,
      "description": article.excerpt,
      "image": [
        "https://sleepsomno.com/favicon.svg" 
      ],
      "datePublished": `${article.date}T10:00:00+08:00`,
      "dateModified": `${article.date}T10:00:00+08:00`,
      "author": {
        "@type": "Person",
        "name": article.author.name,
        "jobTitle": article.author.role,
        "url": "https://sleepsomno.com/about"
      },
      "publisher": {
        "@type": "Organization",
        "name": "SomnoAI Digital Sleep Lab",
        "logo": {
          "@type": "ImageObject",
          "url": "https://sleepsomno.com/favicon.svg"
        }
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = `schema-news-${article.id}`;
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      const existing = document.getElementById(`schema-news-${article.id}`);
      if (existing) existing.remove();
    };
  }, [article]);

  return (
    <div className="min-h-screen bg-[#01040a] pt-10 pb-40 px-6 font-sans text-left">
      <article className="max-w-4xl mx-auto space-y-12">
        <button 
          onClick={onBack}
          className="p-4 bg-white/5 hover:bg-white/10 rounded-3xl text-slate-400 hover:text-white transition-all border border-white/5 flex items-center gap-3 uppercase text-[10px] font-black tracking-widest italic"
        >
          <ArrowLeft size={16} /> {t.backToHub}
        </button>

        <header className="space-y-8">
          <div className="flex flex-wrap items-center gap-4">
             <span className="px-4 py-1.5 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest italic flex items-center gap-2">
               <Tag size={12} /> {article.category}
             </span>
             <span className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest italic flex items-center gap-2">
               <ShieldCheck size={12} /> {t.verified}
             </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black italic text-white uppercase tracking-tighter leading-none">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-10 border-y border-white/5 py-8">
             <div className="flex items-center gap-3">
                <address className="not-italic flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-white/5 shadow-inner">
                       <User size={20} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{article.author.role}</p>
                       <p className="text-base font-black text-white italic">{article.author.name}</p>
                    </div>
                </address>
             </div>
             <div className="flex items-center gap-8">
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                     <Calendar size={12} /> {t.published}
                   </p>
                   <time dateTime={article.date} className="text-sm font-bold text-slate-400 italic">
                     {new Date(article.date).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                   </time>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                     <Clock size={12} /> READ TIME
                   </p>
                   <p className="text-sm font-bold text-slate-400 italic">{article.readTime}</p>
                </div>
             </div>
          </div>
        </header>

        <section className="prose prose-invert max-w-none">
           <div className="text-slate-300 text-lg md:text-xl leading-relaxed italic font-medium space-y-10 whitespace-pre-wrap">
              {article.content}
           </div>
        </section>

        {/* Author Bio Card for E-E-A-T - Authoritativeness */}
        <GlassCard className="p-10 rounded-[3rem] border-white/5 bg-slate-900/40 mt-20" intensity={1.1}>
           <div className="flex flex-col md:flex-row gap-10 items-start md:items-center">
              <div className="w-24 h-24 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white text-4xl font-black italic shadow-2xl shrink-0">
                {article.author.name[0]}
              </div>
              <div className="space-y-4">
                 <div>
                    <h4 className="text-2xl font-black italic text-white uppercase tracking-tight">{article.author.name}</h4>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{article.author.role}</p>
                 </div>
                 <p className="text-sm text-slate-500 italic leading-relaxed font-medium">
                   {article.author.bio}
                 </p>
                 <div className="flex items-center gap-4 pt-2">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                      <ShieldCheck size={12} className="text-emerald-500" /> IDENTITY VERIFIED
                    </span>
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                      <Info size={12} className="text-indigo-500" /> SOMNO LAB CORE TEAM
                    </span>
                 </div>
              </div>
           </div>
        </GlassCard>

        <footer className="pt-20 flex flex-col items-center gap-8 border-t border-white/5">
           <div className="flex gap-4">
              <button className="p-4 bg-white/5 hover:bg-indigo-600/20 rounded-full text-slate-400 hover:text-indigo-400 transition-all border border-white/5">
                 <Share2 size={20} />
              </button>
           </div>
           <button onClick={() => window.scrollTo({top:0, behavior:'smooth'})} className="px-10 py-5 bg-white/5 border border-white/10 text-slate-500 hover:text-white rounded-full text-[10px] font-black uppercase tracking-widest italic transition-all">
             Back to Top
           </button>
        </footer>
      </article>
    </div>
  );
};