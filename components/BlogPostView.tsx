
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Calendar, User, ShieldCheck, Tag, Share2, ArrowUpRight } from 'lucide-react';
import { GlassCard } from './GlassCard.tsx';
import { Article } from '../types.ts';
import { Language, translations } from '../services/i18n.ts';
import { updateMetadata } from '../services/navigation.ts';

const m = motion as any;

interface BlogPostViewProps {
  post: Article;
  lang: Language;
  onBack: () => void;
}

export const BlogPostView: React.FC<BlogPostViewProps> = ({ post, lang, onBack }) => {
  const t = translations[lang].blog;

  useEffect(() => {
    updateMetadata(post.title, post.excerpt);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [post]);

  return (
    <div className="min-h-screen bg-[#01040a] pt-10 pb-40 px-6 font-sans text-left selection:bg-indigo-500/30">
      <article className="max-w-4xl mx-auto space-y-12">
        <button 
          onClick={onBack}
          className="p-4 bg-white/5 hover:bg-white/10 rounded-3xl text-slate-400 hover:text-white transition-all border border-white/5 flex items-center gap-3 uppercase text-[10px] font-black tracking-widest italic"
        >
          <ArrowLeft size={16} /> {t.backToIndex}
        </button>

        <header className="space-y-8">
          <div className="flex flex-wrap items-center gap-4">
             <span className="px-4 py-1.5 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest italic flex items-center gap-2">
               <Tag size={12} /> {post.category}
             </span>
             <span className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest italic flex items-center gap-2">
               <ShieldCheck size={12} /> Story Verified
             </span>
          </div>

          <h1 className="text-5xl md:text-8xl font-black italic text-white uppercase tracking-tighter leading-none">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-10 border-y border-white/5 py-10">
             <div className="flex items-center gap-3">
                <address className="not-italic flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-white/5 shadow-inner">
                       <User size={24} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.author}</p>
                       <p className="text-lg font-black text-white italic leading-tight">{post.author.name}</p>
                    </div>
                </address>
             </div>
             <div className="flex items-center gap-12">
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                     <Calendar size={12} /> {t.published}
                   </p>
                   <time dateTime={post.date} className="text-sm font-black text-slate-400 italic">
                     {new Date(post.date).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                   </time>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                     <Clock size={12} /> {t.readTime}
                   </p>
                   <p className="text-sm font-black text-slate-400 italic">{post.readTime}</p>
                </div>
             </div>
          </div>
        </header>

        <section className="prose prose-invert max-w-none">
           <div className="text-slate-300 text-xl md:text-2xl leading-relaxed italic font-medium space-y-12 whitespace-pre-wrap first-letter:text-5xl first-letter:font-black first-letter:text-indigo-400 first-letter:mr-3 first-letter:float-left">
              {post.content}
           </div>
        </section>

        <GlassCard className="p-12 rounded-[4rem] border-white/5 bg-slate-900/40 mt-32" intensity={1.1}>
           <div className="flex flex-col md:flex-row gap-12 items-start md:items-center">
              <div className="w-28 h-28 rounded-[3rem] bg-indigo-600 flex items-center justify-center text-white text-5xl font-black italic shadow-2xl shrink-0 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-indigo-700" />
                <span className="relative z-10">{post.author.name[0]}</span>
              </div>
              <div className="space-y-6 flex-1">
                 <div>
                    <h4 className="text-3xl font-black italic text-white uppercase tracking-tight">{post.author.name}</h4>
                    <p className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.4em]">{post.author.role}</p>
                 </div>
                 <p className="text-base text-slate-400 italic leading-relaxed font-medium">
                   {post.author.bio}
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
      </article>
    </div>
  );
};
