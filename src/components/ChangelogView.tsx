import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, GitCommit } from 'lucide-react';
import { Logo } from './Logo';
import { supabase } from '../services/supabaseService';
import { useLanguage } from '../context/useLanguage';

interface ChangelogEntry {
  id: string;
  version: string;
  date: string;
  description: string;
}

export const ChangelogView: React.FC = () => {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChangelog = async () => {
      const { data, error } = await supabase.from('changelog').select('*').order('date', { ascending: false });
      if (data) setEntries(data);
      setLoading(false);
    };
    fetchChangelog();
  }, []);

  return (
    <div className="min-h-screen bg-[#01040a] text-white p-6">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <Logo showText={false} className="w-10 h-10" />
        <h1 className="text-3xl font-bold">{lang === 'zh' ? '更新日志' : 'Changelog'}</h1>
      </div>
      
      {loading ? (
        <p className="text-slate-500">{lang === 'zh' ? '加载中...' : 'Loading...'}</p>
      ) : (
        <div className="space-y-6 max-w-2xl">
          {entries.map(entry => (
            <div key={entry.id} className="bg-black/40 border border-white/5 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <GitCommit className="text-indigo-500" size={20} />
                <h2 className="text-xl font-bold">{entry.version}</h2>
                <span className="text-sm text-slate-500">{new Date(entry.date).toLocaleDateString()}</span>
              </div>
              <p className="text-slate-300">{entry.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
