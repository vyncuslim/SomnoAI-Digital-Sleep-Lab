
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowRight, BookOpen, Newspaper, Filter } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Language, getTranslation } from '../services/i18n';
import { updateMetadata } from '../services/navigation';
import { BLOG_POSTS, RESEARCH_ARTICLES } from '../data/mockData';

interface SearchHubProps {
  lang: Language;
}

export const SearchHub: React.FC<SearchHubProps> = ({ lang }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'blog' | 'research'>('all');
  const [localQuery, setLocalQuery] = useState(query);
  const t = getTranslation(lang, 'landing');

  useEffect(() => {
    setLocalQuery(query);
    updateMetadata(`Search: ${query}`, `Search results for ${query}`, `/search?q=${query}`);
    
    if (query) {
      const blogResults = BLOG_POSTS.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) || 
        item.excerpt.toLowerCase().includes(query.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      ).map(item => ({ ...item, type: 'blog' }));

      const researchResults = RESEARCH_ARTICLES.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) || 
        item.excerpt.toLowerCase().includes(query.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      ).map(item => ({ ...item, type: 'research' }));

      setResults([...blogResults, ...researchResults]);
    } else {
      setResults([]);
    }
  }, [query]);

  const filteredResults = results.filter(item => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  return (
    <div className="min-h-screen bg-[#01040a] pt-24 pb-40 px-6 font-sans text-left">
      <div className="max-w-5xl mx-auto space-y-12">
        <header className="space-y-6 border-b border-white/5 pb-12">
           <div className="flex items-center gap-4 text-indigo-400 mb-4">
              <Search size={24} />
              <span className="text-xs font-black uppercase tracking-[0.3em] italic">Search Database</span>
           </div>
           
           <div className="relative max-w-2xl">
              <input 
                type="text" 
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/search?q=${encodeURIComponent(localQuery)}`)}
                placeholder="Search articles, research, and insights..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                autoFocus
              />
              <button 
                onClick={() => navigate(`/search?q=${encodeURIComponent(localQuery)}`)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 rounded-xl text-white hover:bg-indigo-500 transition-colors"
              >
                <ArrowRight size={20} />
              </button>
           </div>

           <p className="text-slate-500 font-mono text-sm pt-4">
             {results.length} nodes found in neural network
           </p>
        </header>

        {/* Filters */}
        <div className="flex gap-4">
          {['all', 'blog', 'research'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                filter === f 
                  ? 'bg-indigo-600 text-white border-indigo-500' 
                  : 'bg-white/5 text-slate-500 border-white/5 hover:bg-white/10'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid gap-8">
          {filteredResults.length > 0 ? (
            filteredResults.map((item, i) => (
              <GlassCard 
                key={i}
                onClick={() => navigate(item.type === 'blog' ? `/blog/${item.slug}` : `/news/${item.slug}`)}
                className="p-8 rounded-[2rem] border-white/5 bg-slate-900/40 hover:border-indigo-500/30 cursor-pointer group transition-all"
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        item.type === 'blog' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {item.type === 'blog' ? 'Blog Post' : 'Research'}
                      </span>
                      <span className="text-slate-600 text-[10px] font-mono">{item.date}</span>
                    </div>
                    <h3 className="text-2xl font-black italic text-white uppercase tracking-tight group-hover:text-indigo-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
                      {item.excerpt}
                    </p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl text-slate-600 group-hover:text-white transition-colors">
                    <ArrowRight size={20} />
                  </div>
                </div>
              </GlassCard>
            ))
          ) : (
            <div className="py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-600">
                <Search size={32} />
              </div>
              <p className="text-slate-500 font-mono text-sm">No signals detected matching your query.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
