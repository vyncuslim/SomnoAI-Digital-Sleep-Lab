
import React, { useState, useEffect } from 'react';
import { Book, PenTool, Trash2, Calendar, Sparkles, Send, Loader2, BookOpen, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard.tsx';
import { diaryApi } from '../services/supabaseService.ts';
import { DiaryEntry, Language } from '../types.ts';
import { translations } from '../services/i18n.ts';
import { notificationService } from '../services/notificationService.ts';

const m = motion as any;

export const DiaryView: React.FC<{ lang: Language }> = ({ lang }) => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('Neutral');
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const data = await diaryApi.getEntries();
        setEntries(data as DiaryEntry[]);
      } catch (e) {
        console.error("Diary Fetch Error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchEntries();
  }, []);

  const handleSave = async () => {
    if (!content.trim() || isSaving) return;
    setIsSaving(true);
    try {
      const newEntry = await diaryApi.saveEntry(content, mood);
      setEntries([newEntry as DiaryEntry, ...entries]);
      
      // Browser Local Feedback
      notificationService.sendNotification("Diary Saved", `Mood: ${mood} • Your biological log has been archived.`);
      
      // NOTE: Multi-channel Admin Alerting (Email/TG) is now handled 
      // automatically by diaryApi.saveEntry -> logAuditLog internally.

      setContent('');
      setMood('Neutral');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error("Diary Save Error:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this entry from the grid?")) return;
    try {
      await diaryApi.deleteEntry(id);
      setEntries(entries.filter(e => e.id !== id));
      notificationService.sendNotification("Entry Expunged", "Data has been removed from the neural archive.");
    } catch (e) {
      console.error("Diary Delete Error:", e);
    }
  };

  return (
    <div className="space-y-10 pb-40 max-w-2xl mx-auto px-4 text-left">
      <header className="pt-8">
        <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter leading-none">
          Sleep <span className="text-indigo-400">Diary</span>
        </h1>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2 italic">Chronological Recovery Logs</p>
      </header>

      <GlassCard className="p-8 rounded-[3rem] border-indigo-500/20 bg-indigo-500/[0.02]">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <PenTool size={18} className="text-indigo-400" />
               <span className="text-[11px] font-black uppercase text-white tracking-widest">New Entry</span>
            </div>
            <AnimatePresence>
              {saveSuccess && (
                <m.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                  <CheckCircle2 size={14} /> Commit Verified
                </m.div>
              )}
            </AnimatePresence>
          </div>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Log your biological flow today..."
            className="w-full bg-slate-950/60 border border-white/5 rounded-[2rem] p-6 text-sm text-slate-300 outline-none focus:border-indigo-500/30 transition-all min-h-[140px] italic"
          />
          <div className="flex flex-wrap gap-2">
            {['Great', 'Neutral', 'Tired', 'Restless'].map(mOption => (
              <button 
                key={mOption}
                onClick={() => setMood(mOption)}
                className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${mood === mOption ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-500 hover:text-white'}`}
              >
                {mOption}
              </button>
            ))}
          </div>
          <button 
            onClick={handleSave}
            disabled={!content.trim() || isSaving}
            className={`w-full py-4 rounded-full font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-30 ${saveSuccess ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white'}`}
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : saveSuccess ? <CheckCircle2 size={16} /> : <Send size={16} />}
            {saveSuccess ? 'ENTRY LOGGED' : 'COMMIT ENTRY'}
          </button>
        </div>
      </GlassCard>

      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
           <BookOpen size={18} className="text-slate-600" />
           <span className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Archive</span>
        </div>
        
        <AnimatePresence>
          {loading ? (
            <div className="flex justify-center py-12">
               <Loader2 className="animate-spin text-slate-700" size={24} />
            </div>
          ) : entries.length === 0 ? (
            <div className="py-20 text-center opacity-20">
              <Book size={48} className="mx-auto mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest">Registry Empty</p>
            </div>
          ) : entries.map((entry) => (
            <m.div 
              key={entry.id} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <GlassCard className="p-8 rounded-[2.5rem] border-white/5 group">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <Calendar size={12} className="text-indigo-400" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[8px] font-black text-indigo-300 uppercase">
                        {entry.mood}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleDelete(entry.id)}
                      className="p-2 text-slate-800 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed italic">{entry.content}</p>
                </div>
              </GlassCard>
            </m.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
