
import React from 'react';
import { ArrowLeft, BrainCircuit, Target, Cpu, FlaskConical, ShieldCheck, Binary, Globe, Shield, Activity, Lock, Smartphone, Database } from 'lucide-react';
import { Language, translations } from '../services/i18n.ts';
import { GlassCard } from './GlassCard.tsx';

interface AboutViewProps {
  lang: Language;
  onBack: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ lang, onBack }) => {
  const t = translations[lang].about;
  const isZh = lang === 'zh';

  const GOOGLE_CLIENT_ID = "1083641396596-7vqbum157qd03asbmare5gmrmlr020go.apps.googleusercontent.com";
  const ACTIVE_SCOPES = [
    "fitness.sleep.read",
    "fitness.heart_rate.read",
    "fitness.activity.read",
    "fitness.body.read",
    "openid",
    "profile",
    "email"
  ];

  return (
    <div className="min-h-screen pt-4 pb-32 animate-in fade-in slide-in-from-right-4 duration-500">
      <header className="flex items-center gap-4 mb-10 px-2">
        <button 
          onClick={onBack}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all border border-white/5 shadow-lg"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase">
            {t.title}
          </h1>
          <p className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-[0.3em] mt-0.5">
            Neural Laboratory Documentation
          </p>
        </div>
      </header>

      <div className="space-y-8 max-w-2xl mx-auto">
        <GlassCard className="p-8 space-y-6 border-indigo-500/30 bg-indigo-500/[0.02] rounded-[3.5rem]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
              <Target size={24} />
            </div>
            <h2 className="text-xl font-bold italic text-white uppercase tracking-tight">{t.mission}</h2>
          </div>
          <p className="text-slate-300 leading-relaxed font-medium">
            {t.missionText}
          </p>
        </GlassCard>

        <GlassCard className="p-8 space-y-8 border-white/10 bg-white/[0.01] rounded-[3.5rem]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-500/10 rounded-2xl text-slate-400">
                <ShieldCheck size={24} />
              </div>
              <h2 className="text-xl font-bold italic text-white uppercase tracking-tight">{isZh ? '系统验证' : 'System Verification'}</h2>
            </div>
            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 text-[8px] font-black rounded-full border border-indigo-500/20 uppercase tracking-widest">
              Reviewer Info
            </span>
          </div>

          <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-slate-950/60 rounded-3xl border border-white/5 flex items-center gap-4">
                   <Smartphone className="text-indigo-400" size={20} />
                   <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Source</p>
                      <p className="text-xs font-bold text-white uppercase tracking-tight">Android Health Connect</p>
                   </div>
                </div>
                <div className="p-5 bg-slate-950/60 rounded-3xl border border-white/5 flex items-center gap-4">
                   <Database className="text-emerald-400" size={20} />
                   <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Bridge</p>
                      <p className="text-xs font-bold text-white uppercase tracking-tight">Secure Cloud Sync</p>
                   </div>
                </div>
             </div>

            <div className="space-y-2">
              <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                <Globe size={10} /> OAuth Client ID
              </p>
              <div className="p-4 bg-slate-950/60 rounded-2xl border border-white/5 font-mono text-[10px] text-slate-400 break-all leading-relaxed">
                {GOOGLE_CLIENT_ID}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                <Lock size={10} /> {isZh ? '活动范围 (Health Connect 桥接)' : 'Active Scopes (Health Connect Bridge)'}
              </p>
              <div className="flex flex-wrap gap-2">
                {ACTIVE_SCOPES.map(scope => (
                  <span key={scope} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-mono text-indigo-300">
                    {scope.replace('https://www.googleapis.com/auth/', '')}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-5 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl">
              <p className="text-[11px] text-slate-400 italic leading-relaxed">
                {isZh 
                  ? 'Somno Lab 遵守 Google API 数据安全与有限使用政策。生理数据通过 Android Health Connect 同步并在客户端使用 Google Gemini 模型进行加密处理，绝不存储在持久化后端服务器上。' 
                  : 'Somno Lab complies with high-security data safety policies. Physiological data is synchronized via Android Health Connect and processed in the client context using Google Gemini models, never stored on a persistent backend server.'}
              </p>
            </div>
          </div>
        </GlassCard>

        <footer className="pt-12 flex flex-col items-center gap-6 opacity-40">
           <div className="flex items-center gap-3">
             <FlaskConical size={14} className="text-indigo-400" />
             <span className="text-[9px] font-mono tracking-widest uppercase">Bio-Digital Lab v3.6</span>
           </div>
           <div className="p-6 bg-slate-900/40 border border-white/5 rounded-[2.5rem] text-center max-w-sm">
             <p className="text-[10px] text-slate-500 font-medium italic leading-relaxed">
               "Synthesizing the modern health ecosystem with high-fidelity neural analysis."
             </p>
           </div>
        </footer>
      </div>
    </div>
  );
};
