
import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ArrowRight, Tag, Clock, Calendar, Sparkles, MessageCircle, PenTool } from 'lucide-react';
import { GlassCard } from './GlassCard.tsx';
import { Article } from '../types.ts';
import { Language, getTranslation } from '../services/i18n.ts';
import { BLOG_POSTS } from '../data/mockData.ts';

const m = motion as any;

interface BlogHubProps {
  lang: Language;
  onSelectPost: (post: Article) => void;
}

export const BlogHub: React.FC<BlogHubProps> = ({ lang, onSelectPost }) => {
  const t = getTranslation(lang, 'blog');

  return (
    <div className="min-h-screen bg-[#01040a] pt-10 pb-40 px-6 font-sans text-left">
      <div className="max-w-6xl mx-auto space-y-24">
        <header className="space-y-8">
           <div className="inline-flex items-center gap-4 px-6 py-2 bg-indigo-600/10 border border-indigo-500/20 rounded-full">
              <PenTool size={14} className="text-indigo-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400 italic">Laboratory Stories • Node Editorial</span>
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
          {BLOG_POSTS.map((post) => (
            <GlassCard 
              key={post.id} 
              onClick={() => onSelectPost(post)}
              className="p-12 rounded-[5rem] border-white/5 bg-slate-900/40 group cursor-pointer hover:border-indigo-500/30 transition-all flex flex-col justify-between"
              intensity={1.1}
            >
              <div className="space-y-10">
                 <div className="flex justify-between items-start">
                    <span className="px-5 py-2 bg-white/5 border border-white/10 text-slate-400 rounded-full text-[9px] font-black uppercase tracking-widest italic group-hover:text-indigo-400 transition-colors">
                      {post.category}
                    </span>
                    <div className="p-4 bg-slate-950 rounded-2xl text-slate-700 group-hover:text-indigo-400 transition-colors shadow-inner border border-white/5">
                      <BookOpen size={24} />
                    </div>
                 </div>
                 
                 <div className="space-y-6">
                    <h3 className="text-4xl font-black italic text-white uppercase tracking-tight leading-tight group-hover:translate-x-2 transition-transform duration-500">
                      {post.title}
                    </h3>
                    <p className="text-base text-slate-500 leading-relaxed italic font-medium line-clamp-4">
                      {post.excerpt}
                    </p>
                 </div>
              </div>

              <div className="pt-12 mt-12 border-t border-white/5 flex items-center justify-between">
                 <div className="flex items-center gap-10">
                    <div className="flex flex-col">
                       <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">{t.published}</p>
                       <time className="text-xs font-black text-slate-500 italic">{post.date}</time>
                    </div>
                    <div className="flex flex-col border-l border-white/5 pl-10">
                       <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">{t.readTime}</p>
                       <p className="text-xs font-black text-slate-500 italic">{post.readTime}</p>
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
              <MessageCircle size={20} />
              <p className="text-[11px] font-mono tracking-[0.5em] uppercase">SomnoAI Lab Blog • Narrative Thread</p>
           </div>
        </footer>
      </div>
    </div>
  );
};
