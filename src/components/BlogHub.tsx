import React from 'react';
import { ChevronLeft, Newspaper, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Language } from '../types.ts';
import { BLOG_POSTS } from '../data/mockData.ts';

interface BlogHubProps {
  lang: Language;
  onSelectPost: (post: any) => void;
}

export const BlogHub: React.FC<BlogHubProps> = ({ lang, onSelectPost }) => {
  return (
    <div className="min-h-screen bg-[#01040a] text-slate-300 font-sans selection:bg-indigo-500/30">
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#01040a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="p-2 -ml-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white group">
            <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
          </a>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Blog & Updates
          </span>
          <div className="w-8" />
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 pt-32 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <Newspaper className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">
                Blog & Updates
              </h1>
              <p className="text-sm text-slate-500 font-mono uppercase tracking-wider">
                Insights & Developments
              </p>
            </div>
          </div>

          <div className="prose prose-invert prose-lg max-w-none mb-12">
            <p className="text-slate-300 leading-relaxed">
              This section provides articles, updates, and insights related to sleep science, technology, and platform developments.
            </p>
          </div>

          <div className="space-y-6">
            {BLOG_POSTS && BLOG_POSTS.length > 0 ? (
              BLOG_POSTS.map((post: any) => (
                <div 
                  key={post.id}
                  onClick={() => onSelectPost(post)}
                  className="group p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl cursor-pointer transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-2 py-1 rounded">
                      {post.category}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      {post.date}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-slate-400 text-sm line-clamp-2 mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-white transition-colors">
                    Read Article <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl">
                <p className="text-slate-500">No articles available yet.</p>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};
