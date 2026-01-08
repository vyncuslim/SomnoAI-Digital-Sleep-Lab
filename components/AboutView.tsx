
import React from 'react';
import { ArrowLeft, BrainCircuit, Target, Cpu, FlaskConical, ShieldCheck, Binary, Globe, Shield, Activity, Lock, Smartphone, Database, Terminal, CheckCircle2, Info } from 'lucide-react';
import { Language, translations } from '../services/i18n.ts';
import { GlassCard } from './GlassCard.tsx';
import { motion } from 'framer-motion';

const m = motion as any;

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

  const protocolSteps = [
    t.step1, t.step2, t.step3, t.step4, t.step5, t.step6, t.step7, t.step8
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

      <div className="space-y-8 max-w-2xl mx-auto px-2">
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
           <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400">
              <Terminal size={24} />
            </div>
            <h2 className="text-xl font-bold italic text-white uppercase tracking-tight">{t.protocolTitle}</h2>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {protocolSteps.map((step, idx) => (
              <m.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-4 p-4 bg-slate-950/60 rounded-2xl border border-white/5 group"
              >
                <span className="text-[10px] font-mono font-black text-slate-600 group-hover:text-indigo-400 transition-colors">0{idx + 1}</span>
                <p className="text-xs font-bold text-slate-300 tracking-tight">{step}</p>
                <CheckCircle2 size={12} className="ml-auto text-emerald-500/30" />
              </m.div>
            ))}
          </div>
          
          <div className="p-5 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl flex gap-4 items-start">
             <Info size={18} className="text-indigo-400 shrink-0 mt-1" />
             <p className="text-[11px] text-slate-400 leading-relaxed italic">
                {isZh 
                  ? "SomnoAI 官方 Android 客户端严格遵循 Google 推荐的 8 步集成协议。通过 Health Connect Client SDK，应用直接在 OS 层面请求授权，绕过已淘汰的旧版 API 限制，实现极低延迟且合规的睡眠分段读取。" 
                  : "The official SomnoAI Android client strictly follows the 8-step integration protocol recommended by Google. Using the Health Connect Client SDK, the app requests authorization directly at the OS level, ensuring high-fidelity sleep stage retrieval while maintaining full regulatory compliance."}
             </p>
          </div>
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
                      <p className="text-xs font-bold text-white uppercase tracking-tight">Health Connect SDK v1.1.0</p>
                   </div>
                </div>
                <div className="p-5 bg-slate-950/60 rounded-3xl border border-white/5 flex items-center gap-4">
                   <Database className="text-emerald-400" size={20} />
                   <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sync</p>
                      <p className="text-xs font-bold text-white uppercase tracking-tight">Android 9+ Native Integration</p>
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
                <Lock size={10} /> {isZh ? '活动范围 (Health Permission Set)' : 'Active Scopes (Health Permission Set)'}
              </p>
              <div className="flex flex-wrap gap-2">
                {ACTIVE_SCOPES.map(scope => (
                  <span key={scope} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-mono text-indigo-300">
                    {scope.replace('https://www.googleapis.com/auth/', '')}
                  </span>
                ))}
              </div>
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
