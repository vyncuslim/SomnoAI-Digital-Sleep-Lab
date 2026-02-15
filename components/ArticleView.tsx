import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Calendar, User, ShieldCheck, Tag, Share2, Info, ArrowUpRight } from 'lucide-react';
import { GlassCard } from './GlassCard.tsx';
import { Article } from '../types.ts';
import { Language, translations } from '../services/i18n.ts';
import { updateMetadata } from '../services/navigation.ts';

const m = motion as any;

interface ArticleViewProps {
  article: Article;
  lang: Language;
  onBack: () => void;
}

export const ArticleView: React.FC<ArticleViewProps> = ({ article, lang, onBack }) => {
  const t = translations[lang].news;

  useEffect(() => {
    // 1. Dynamic Meta Update for SEO
    updateMetadata(article.title, article.excerpt);

    // 2. Advanced NewsArticle & Breadcrumb Schema
    const newsSchema = {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://sleepsomno.com/article/${article.slug}`
      },
      "headline": article.title,
      "description": article.excerpt,
      "image": ["https://sleepsomno.com/favicon.svg"],
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

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://sleepsomno.com/" },
        { "@type": "ListItem", "position": 2, "name": "Research Hub", "item": "https://sleepsomno.com/news" },
        { "@type": "ListItem", "position": 3, "name": article.title, "item": `https://sleepsomno.com/article/${article.slug}` }
      ]
    };

    const scriptNews = document.createElement('script');
    scriptNews.type = 'application/ld+json';
    scriptNews.id = `schema-news-${article.id}`;
    scriptNews.text = JSON.stringify(newsSchema);
    document.head.appendChild(scriptNews);

    const scriptBC = document.createElement('script');
    scriptBC.type = 'application/ld+json';
    scriptBC.id = `schema-bc-${article.id}`;
    scriptBC.text = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(scriptBC);

    return () => {
      document.getElementById(`schema-news-${article.id}`)?.remove();
      document.getElementById(`schema-bc-${article.id}`)?.remove();
    };
  }, [article]);

  return (
    <div className="min-h-screen bg-[#01040a] pt-10 pb-40 px-6 font-sans text-left selection:bg-indigo-500/30">
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

          <h1 className="text-5xl md:text-8xl font-black italic text-white uppercase tracking-tighter leading-none">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-10 border-y border-white/5 py-10">
             <div className="flex items-center gap-3">
                <address className="not-italic flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-white/5 shadow-inner">
                       <User size={24} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.author}</p>
                       <p className="text-lg font-black text-white italic leading-tight">{article.author.name}</p>
                       <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{article.author.role}</p>
                    </div>
                </address>
             </div>
             <div className="flex items-center gap-12">
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                     <Calendar size={12} /> {t.published}
                   </p>
                   <time dateTime={article.date} className="text-sm font-black text-slate-400 italic">
                     {new Date(article.date).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                   </time>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                     <Clock size={12} /> {t.readTime}
                   </p>
                   <p className="text-sm font-black text-slate-400 italic">{article.readTime}</p>
                </div>
             </div>
          </div>
        </header>

        <section className="prose prose-invert max-w-none">
           <div className="text-slate-300 text-xl md:text-2xl leading-relaxed italic font-medium space-y-12 whitespace-pre-wrap first-letter:text-5xl first-letter:font-black first-letter:text-indigo-400 first-letter:mr-3 first-letter:float-left">
              {article.content}
           </div>
        </section>

        <GlassCard className="p-12 rounded-[4rem] border-white/5 bg-slate-900/40 mt-32" intensity={1.1}>
           <div className="flex flex-col md:flex-row gap-12 items-start md:items-center">
              <div className="w-28 h-28 rounded-[3rem] bg-indigo-600 flex items-center justify-center text-white text-5xl font-black italic shadow-2xl shrink-0 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-indigo-700" />
                <span className="relative z-10">{article.author.name[0]}</span>
              </div>
              <div className="space-y-6 flex-1">
                 <div>
                    <h4 className="text-3xl font-black italic text-white uppercase tracking-tight">{article.author.name}</h4>
                    <p className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.4em]">{article.author.role}</p>
                 </div>
                 <p className="text-base text-slate-400 italic leading-relaxed font-medium">
                   {article.author.bio}
                 </p>
                 <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-white/5">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                      <ShieldCheck size={12} className="text-emerald-500" /> IDENTITY VERIFIED
                    </span>
                    <a href="/about" className="text-[10px] font-black text-indigo-500 hover:text-white uppercase tracking-widest flex items-center gap-2 transition-all">
                      EDITORIAL POLICY <ArrowUpRight size={12} />
                    </a>
                 </div>
              </div>
           </div>
        </GlassCard>

        <footer className="pt-24 flex flex-col items-center gap-12 border-t border-white/5">
           <div className="flex gap-6">
              <button className="p-6 bg-white/5 hover:bg-indigo-600/20 rounded-full text-slate-400 hover:text-indigo-400 transition-all border border-white/5">
                 <Share2 size={24} />
              </button>
           </div>
           <button onClick={() => window.scrollTo({top:0, behavior:'smooth'})} className="px-14 py-6 bg-white/5 border border-white/10 text-slate-500 hover:text-white rounded-full text-[11px] font-black uppercase tracking-[0.3em] italic transition-all">
             RE-SCAN TOP NODES
           </button>
        </footer>
      </article>
    </div>
  );
};
