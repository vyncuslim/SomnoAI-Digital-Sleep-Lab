
import React from 'react';
import { ArrowLeft, BrainCircuit, Target, Cpu, FlaskConical, ShieldCheck, Binary, Globe, Shield, Activity, Lock, Smartphone, Database, Terminal, CheckCircle2, Info, Code2, ListTree, Timer, Layers, Zap, Download, Upload } from 'lucide-react';
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

  const handshakeSteps = [
    t.step1, t.step2, t.step3, t.step4, t.step5, t.step6, t.step7, t.step8
  ];

  const recordTypes = [
    { icon: Timer, title: t.sampleType, desc: t.sampleDesc, code: 'WeightRecord(weight: Mass, time: Instant, metadata: Metadata)' },
    { icon: ListTree, title: t.intervalType, desc: t.intervalDesc, code: 'StepsRecord(count: Long, startTime: Instant, endTime: Instant)' },
    { icon: Layers, title: t.seriesType, desc: t.seriesDesc, code: 'HeartRateRecord(samples: List<Sample>, startTime: Instant)' }
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
            Technical Implementation Protocol
          </p>
        </div>
      </header>

      <div className="space-y-8 max-w-2xl mx-auto px-2 text-slate-300">
        {/* Core Methodology */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <GlassCard className="p-8 space-y-4 border-indigo-500/20 bg-indigo-500/[0.02] rounded-[3rem]">
              <div className="flex items-center gap-3">
                <Target size={20} className="text-indigo-400" />
                <h2 className="text-sm font-black italic text-white uppercase tracking-tight">{t.mission}</h2>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">{t.missionText}</p>
           </GlassCard>
           <GlassCard className="p-8 space-y-4 border-white/5 bg-white/[0.01] rounded-[3rem]">
              <div className="flex items-center gap-3">
                <BrainCircuit size={20} className="text-emerald-400" />
                <h2 className="text-sm font-black italic text-white uppercase tracking-tight">{t.vision}</h2>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">{t.visionText}</p>
           </GlassCard>
        </div>

        {/* Feeding Logic */}
        <GlassCard className="p-10 space-y-8 border-indigo-500/20 bg-indigo-500/[0.02] rounded-[4rem]">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
                <Upload size={24} />
              </div>
              <h2 className="text-xl font-bold italic text-white uppercase tracking-tight">{t.feedingTitle}</h2>
           </div>
           
           <div className="space-y-4">
              {[t.feedingStep1, t.feedingStep2, t.feedingStep3].map((step, i) => (
                <div key={i} className="flex items-start gap-4 p-5 bg-slate-950/60 rounded-3xl border border-white/5">
                  <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500 shrink-0 shadow-[0_0_10px_rgba(79,70,229,0.8)]" />
                  <p className="text-xs font-bold text-slate-300 italic">{step}</p>
                </div>
              ))}
           </div>
           
           <div className="p-5 bg-black/40 border border-indigo-500/10 rounded-2xl font-mono text-[10px] text-indigo-400/80 leading-relaxed">
              <span className="text-slate-600">// Idempotency Mapping</span><br/>
              {`Metadata(clientRecordID = "APP_KEY_2026", clientRecordVersion = System.now())`}
           </div>
        </GlassCard>

        {/* Consuming Logic */}
        <GlassCard className="p-10 space-y-8 border-emerald-500/20 bg-emerald-500/[0.02] rounded-[4rem]">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400">
                <Download size={24} />
              </div>
              <h2 className="text-xl font-bold italic text-white uppercase tracking-tight">{t.consumingTitle}</h2>
           </div>
           
           <div className="space-y-4">
              {[t.consumingStep1, t.consumingStep2, t.consumingStep3].map((step, i) => (
                <div key={i} className="flex items-start gap-4 p-5 bg-slate-950/60 rounded-3xl border border-white/5">
                  <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                  <p className="text-xs font-bold text-slate-300 italic">{step}</p>
                </div>
              ))}
           </div>
           
           <div className="p-5 bg-black/40 border border-emerald-500/10 rounded-2xl font-mono text-[10px] text-emerald-400/80 leading-relaxed">
              <span className="text-slate-600">// Incremental Sync Cursor</span><br/>
              {`val token = client.getChangesToken(recordTypes = setOf(SleepSessionRecord::class))`}
           </div>
        </GlassCard>

        {/* Record Architecture */}
        <div className="space-y-6">
           <div className="flex items-center gap-3 px-2">
              <Database size={18} className="text-indigo-400" />
              <h2 className="text-lg font-black italic text-white uppercase tracking-tighter">{t.recordsTitle}</h2>
           </div>
           
           <div className="grid grid-cols-1 gap-4">
              {recordTypes.map((type, i) => (
                <GlassCard key={i} className="p-8 border-white/5 bg-slate-950/40 rounded-[3rem] space-y-4 group hover:border-indigo-500/20 transition-all">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-white/5 rounded-2xl text-slate-400 group-hover:text-indigo-400 transition-colors">
                        <type.icon size={20} />
                     </div>
                     <div>
                        <h3 className="text-xs font-black uppercase text-white tracking-widest">{type.title}</h3>
                        <p className="text-[10px] text-slate-500 font-medium italic">{type.desc}</p>
                     </div>
                  </div>
                  <div className="p-4 bg-black/40 border border-white/5 rounded-2xl font-mono text-[9px] text-indigo-300/80 overflow-x-auto whitespace-nowrap">
                     {type.code}
                  </div>
                </GlassCard>
              ))}
           </div>
        </div>

        {/* 8-Step Integration Protocol */}
        <GlassCard className="p-10 space-y-8 border-white/10 bg-white/[0.01] rounded-[4rem]">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-500/10 rounded-2xl text-slate-400">
                  <Terminal size={24} />
                </div>
                <h2 className="text-xl font-bold italic text-white uppercase tracking-tight">{t.protocolTitle}</h2>
              </div>
              <span className="text-[9px] font-mono text-slate-600 bg-white/5 px-3 py-1 rounded-full border border-white/5 tracking-widest uppercase font-black">SDK Logic v1.2</span>
           </div>

          <div className="grid grid-cols-1 gap-3">
            {handshakeSteps.map((step, idx) => (
              <m.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-4 p-4 bg-slate-950/60 rounded-2xl border border-white/5 group hover:border-indigo-500/30 transition-all duration-500"
              >
                <div className="flex flex-col items-center justify-center">
                  <span className="text-[10px] font-mono font-black text-slate-600 group-hover:text-indigo-400 transition-colors">STEP 0{idx + 1}</span>
                  <div className="h-4 w-[1px] bg-white/5 mt-1" />
                </div>
                <p className="text-[11px] font-bold text-slate-300 tracking-tight leading-relaxed">{step}</p>
                <CheckCircle2 size={12} className="ml-auto text-emerald-500/30 group-hover:text-emerald-500/80 transition-all" />
              </m.div>
            ))}
          </div>

          <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl flex gap-5 items-start">
             <div className="p-2 bg-indigo-500/10 rounded-xl">
               <Info size={18} className="text-indigo-400 shrink-0" />
             </div>
             <p className="text-[10px] text-slate-400 leading-relaxed italic font-medium">
                {isZh 
                  ? "连接认知升级：连接 = 检测可用 → 初始化客户端 → 请求权限 → 读写数据。无登录页，无 Token，由 Android 官方 Health Connect 托管授权。数据所有权始终属于用户，应用仅在“醒着”时获准查阅。" 
                  : "Cognitive Handshake: Connection = Detect -> Initialize Client -> Request Permission -> R/W. No login page, no tokens. Authorization is managed by Android Health Connect. Data ownership stays with the user."}
             </p>
          </div>
        </GlassCard>

        <footer className="pt-12 flex flex-col items-center gap-6 opacity-40">
           <div className="flex items-center gap-3">
             <FlaskConical size={14} className="text-indigo-400" />
             <span className="text-[9px] font-mono tracking-widest uppercase">Health Ecosystem Logic v1.2</span>
           </div>
           <div className="p-6 bg-slate-900/40 border border-white/5 rounded-[2.5rem] text-center max-w-sm">
             <p className="text-[9px] text-slate-500 font-bold italic leading-relaxed uppercase tracking-wider">
               {isZh ? "数据属于用户，授权由系统兜底" : "Data belongs to the user, Auth by System"}
             </p>
           </div>
        </footer>
      </div>
    </div>
  );
};
