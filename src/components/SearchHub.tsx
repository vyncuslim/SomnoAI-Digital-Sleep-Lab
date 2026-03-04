
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { PageLayout } from './ui/PageLayout';
import { Section, Card } from './ui/Components';
import { Language } from '../types';
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
    <PageLayout>
      <Section>
        <div className="space-y-8">
          <div className="flex items-center gap-4 text-indigo-400">
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
              className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 text-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              autoFocus
            />
            <button 
              onClick={() => navigate(`/search?q=${encodeURIComponent(localQuery)}`)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 rounded-xl text-white hover:bg-indigo-500 transition-colors"
            >
              <ArrowRight size={20} />
            </button>
          </div>

          <p className="text-slate-500 font-mono text-sm">
            {results.length} nodes found in neural network
          </p>
        </div>
      </Section>

      <Section>
        <div className="flex gap-4 mb-8">
          {['all', 'blog', 'research'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                filter === f 
                  ? 'bg-indigo-600 text-white border-indigo-500' 
                  : 'bg-slate-900 text-slate-500 border-white/10 hover:bg-slate-800'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid gap-6">
          {filteredResults.length > 0 ? (
            filteredResults.map((item, i) => (
              <Card 
                key={i}
                title={item.title}
                description={item.excerpt}
                onClick={() => navigate(item.type === 'blog' ? `/blog/${item.slug}` : `/news/${item.slug}`)}
                className="cursor-pointer group"
              >
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      item.type === 'blog' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {item.type === 'blog' ? 'Blog Post' : 'Research'}
                    </span>
                    <span className="text-slate-600 text-[10px] font-mono">{item.date}</span>
                  </div>
                  <ArrowRight size={16} className="text-slate-600 group-hover:text-white transition-colors" />
                </div>
              </Card>
            ))
          ) : (
            <div className="py-20 text-center space-y-4 bg-slate-900/30 rounded-3xl border border-white/5">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-600">
                <Search size={32} />
              </div>
              <p className="text-slate-500 font-mono text-sm">No signals detected matching your query.</p>
            </div>
          )}
        </div>
      </Section>
    </PageLayout>
  );
};
