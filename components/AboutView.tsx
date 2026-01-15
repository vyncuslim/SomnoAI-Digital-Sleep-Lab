import React, { useState } from 'react';
import { ArrowLeft, BrainCircuit, Target, Cpu, FlaskConical, Binary, Activity, Lock, Smartphone, Database, Terminal, CheckCircle2, Info, Code2, ListTree, Timer, Layers, Zap, Download, Upload, BookOpen, Warehouse, LayoutList, Fingerprint, Network, Bookmark, History, RotateCcw, Filter, Boxes, PackageSearch, Pipette, Droplets, Watch, Hammer, Eye, ChevronRight, FileCode, ShieldCheck, Sparkles } from 'lucide-react';
import { Language, translations } from '../services/i18n.ts';
import { GlassCard } from './GlassCard.tsx';
import { motion, AnimatePresence } from 'framer-motion';

const m = motion as any;

interface AboutViewProps {
  lang: Language;
  onBack: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ lang, onBack }) => {
  const t = translations[lang].about;
  const isZh = lang === 'zh';
  const [activeProtocolStep, setActiveProtocolStep] = useState(0);

  const handshakeDetails = [
    { 
      title: 'getSdkStatus', 
      desc: t.step1, 
      code: 'val status = HealthConnectClient.getSdkStatus(context)\nif (status == SDK_UNAVAILABLE) return',
      icon: Smartphone 
    },
    { 
      title: 'getOrCreate', 
      desc: t.step2, 
      code: 'val client = HealthConnectClient.getOrCreate(context)',
      icon: Cpu 
    },
    { 
      title: 'Manifest', 
      desc: t.step3, 
      code: '<uses-permission android:name="android.permission.health.READ_SLEEP"/>\n<uses-permission android:name="android.permission.health.READ_HEART_RATE"/>',
      icon: FileCode 
    },
    { 
      title: 'Launcher', 
      desc: t.step4, 
      code: 'val requestPermissionLauncher = \n  registerForActivityResult(PermissionController.createRequestPermissionResultContract())',
      icon: Zap 
    },
    { 
      title: 'launch', 
      desc: t.step5, 
      code: 'requestPermissionLauncher.launch(setOf(SleepSessionRecord::class, HeartRateRecord::class))',
      icon: Terminal 
    },
    { 
      title: 'Verification', 
      desc: t.step6, 
      code: 'val granted = client.permissionController.getGrantedPermissions()',
      icon: ShieldCheck 
    },
    { 
      title: 'readRecords', 
      desc: t.step7, 
      code: 'val response = client.readRecords(ReadRecordsRequest(SleepSessionRecord::class, TimeRangeFilter.between(start, end)))',
      icon: Activity 
    },
    { 
      title: 'Sync Loop', 
      desc: t.step8, 
      code: 'val token = client.getChangesToken(recordTypes = setOf(SleepSessionRecord::class))\nval response = client.getChanges(token)',
      icon: RotateCcw 
    }
  ];

  const tokenSteps = [
    t.tokenInitial, t.tokenCycle, t.tokenStore, t.tokenExpire
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
          <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase leading-none">
            {t.title}
          </h1>
          <p className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-[0.3em] mt-1">
            Health Connect Engineering Specs
          </p>
        </div>
      </header>

      <div className="space-y-8 max-w-2xl mx-auto px-2 text-slate-300">
        
        {/* Lab Manifesto / Vision Card */}
        <GlassCard className="p-10 border-indigo-500/30 bg-indigo-600/[0.05] rounded-[4.5rem] relative overflow-hidden group">
          <m.div 
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.05, 1] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute -top-10 -right-10 bg-indigo-500/10 w-40 h-40 blur-[50px] rounded-full pointer-events-none"
          />
          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex items-center gap-3 text-indigo-400">
              <Sparkles size={20} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Laboratory Manifesto</span>
            </div>
            <p className="text-xl md:text-2xl font-black italic text-white tracking-tight leading-relaxed">
              "{t.manifesto}"
            </p>
            <div className="h-[1px] w-12 bg-indigo-500/50" />
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">
              Neural Integrity Protocol Alpha-0.1
            </p>
          </div>
        </GlassCard>
        
        {/* Interactive 8-Step Handshake Terminal */}
        <GlassCard className="p-10 space-y-10 border-indigo-500/20 bg-indigo-500/[0.01] rounded-[4rem]">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 shadow-[0_0_20px_rgba(79,70,229,0.2)]">
                  <Terminal size={24} />
                </div>
                <div>
                   <h2 className="text-xl font-black italic text-white uppercase tracking-tight leading-none">{t.protocolTitle}</h2>
                   <p className="text-[9px] font-bold text-indigo-400/60 uppercase tracking-widest mt-1">Android SDK v1.2 Implementation</p>
                </div>
              </div>
           </div>

           <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {handshakeDetails.map((_, i) => (
                <button 
                  key={i}
                  onClick={() => setActiveProtocolStep(i)}
                  className={`relative flex flex-col items-center gap-1 group transition-all duration-500 ${activeProtocolStep === i ? 'scale-110' : 'opacity-40 hover:opacity-100'}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-500 ${activeProtocolStep === i ? 'bg-indigo-600 border-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'bg-slate-900 border-white/5'}`}>
                    <span className="text-[10px] font-black text-white">0{i+1}</span>
                  </div>
                  <div className={`h-1 w-full rounded-full transition-all duration-700 ${activeProtocolStep === i ? 'bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.8)]' : 'bg-white/5'}`} />
                </button>
              ))}
           </div>

           <AnimatePresence mode="wait">
              <m.div 
                key={activeProtocolStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-start gap-5">
                   <div className="p-4 bg-white/5 rounded-3xl text-indigo-400 border border-white/5">
                      {React.createElement(handshakeDetails[activeProtocolStep].icon, { size: 28 })}
                   </div>
                   <div className="space-y-1">
                      <h3 className="text-lg font-black italic text-white uppercase tracking-tight">Step 0{activeProtocolStep + 1}: {handshakeDetails[activeProtocolStep].title}</h3>
                      <p className="text-[11px] font-medium text-slate-400 leading-relaxed italic">{handshakeDetails[activeProtocolStep].desc}</p>
                   </div>
                </div>

                <div className="bg-black/60 rounded-3xl border border-white/5 overflow-hidden group">
                   <div className="bg-white/5 px-6 py-2 flex items-center justify-between">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Logic Signature (Kotlin/SDK)</span>
                      <div className="flex gap-1">
                         <div className="w-1.5 h-1.5 rounded-full bg-rose-500/50" />
                         <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50" />
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                      </div>
                   </div>
                   <pre className="p-6 text-[10px] font-mono text-indigo-300/80 leading-relaxed overflow-x-auto scrollbar-hide">
                      {handshakeDetails[activeProtocolStep].code}
                   </pre>
                </div>
              </m.div>
           </AnimatePresence>

           <div className="pt-4 flex items-center justify-between border-t border-white/5">
              <div className="flex items-center gap-3">
                 <Binary size={14} className="text-indigo-500/40" />
                 <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Stateful Protocol Synchronization</span>
              </div>
              <button 
                onClick={() => setActiveProtocolStep((prev) => (prev + 1) % 8)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-full text-[9px] font-black text-indigo-400 uppercase tracking-widest transition-all"
              >
                Next Sequence <ChevronRight size={12} />
              </button>
           </div>
        </AboutView>

        {/* Plumbing Analogy Module */}
        <GlassCard className="p-10 space-y-6 border-blue-500/20 bg-blue-500/[0.03] rounded-[4rem] relative overflow-hidden">
           <div className="absolute -top-10 -right-10 opacity-[0.05]">
              <Droplets size={240} className="text-blue-500" />
           </div>
           <div className="flex items-center gap-4 relative z-10">
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                <Network size={28} />
              </div>
              <div>
                <h2 className="text-xl font-black italic text-white uppercase tracking-tight leading-none">{t.waterAnalogyTitle}</h2>
                <p className="text-[9px] font-bold text-blue-500/60 uppercase tracking-widest mt-1">Bio-Digital Plumbing Protocol</p>
              </div>
           </div>
           <p className="text-[12px] text-slate-300 leading-relaxed italic font-medium relative z-10 pr-10 border-l-2 border-blue-500/20 pl-6 py-2">
              {t.waterAnalogyDesc}
           </p>
        </GlassCard>

        {/* Development & Diagnostics Module */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <GlassCard className="p-8 space-y-4 border-amber-500/20 bg-amber-500/[0.02] rounded-[3rem]">
              <div className="flex items-center gap-3">
                <Hammer size={20} className="text-amber-400" />
                <h2 className="text-sm font-black italic text-white uppercase tracking-tight">{t.toolboxTitle}</h2>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">{t.toolboxDesc}</p>
           </GlassCard>
           <GlassCard className="p-8 space-y-4 border-emerald-500/20 bg-emerald-500/[0.02] rounded-[3rem]">
              <div className="flex items-center gap-3">
                <Watch size={20} className="text-emerald-400" />
                <h2 className="text-sm font-black italic text-white uppercase tracking-tight">{t.whsTitle}</h2>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">{t.whsDesc}</p>
           </GlassCard>
        </div>

        {/* Warehouse Analogy Card */}
        <GlassCard className="p-10 space-y-6 border-amber-500/20 bg-amber-500/[0.03] rounded-[4rem] relative overflow-hidden">
           <div className="absolute -top-10 -right-10 opacity-[0.05]">
              <Boxes size={240} className="text-amber-500" />
           </div>
           <div className="flex items-center gap-4 relative z-10">
              <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                <Warehouse size={28} />
              </div>
              <div>
                <h2 className="text-xl font-black italic text-white uppercase tracking-tight leading-none">{isZh ? '数字化自动化仓库' : 'Automated Bio-Warehouse'}</h2>
                <p className="text-[9px] font-bold text-amber-500/60 uppercase tracking-widest mt-1">Logic Analogy Protocol</p>
              </div>
           </div>
           <p className="text-[12px] text-slate-300 leading-relaxed italic font-medium relative z-10 pr-10 border-l-2 border-amber-500/20 pl-6 py-2">
              {isZh 
                ? "“InsertRecords 是入库单，通过 clientRecordId 确保货位唯一；Changes Sync API 是补货通知单，拿着存根（Token）去领，就能知道自你离开后谁搬走了货、谁换了包装。前提是：大门必须敞开（前台运行）。”"
                : "“InsertRecords acts as the packing slip, clientRecordId ensures cargo unique slots. Changes Sync API is the inventory report; use your receipt (Token) to see stock movements while you were away. Requires the warehouse door to be open (Foreground).”"}
           </p>
        </GlassCard>

        {/* Sync Token Cursor Lifecycle */}
        <GlassCard className="p-10 space-y-8 border-cyan-500/20 bg-cyan-500/[0.02] rounded-[4rem]">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                  <Bookmark size={24} />
                </div>
                <h2 className="text-xl font-bold italic text-white uppercase tracking-tight">{t.tokenTitle}</h2>
              </div>
              <History size={20} className="text-slate-800" />
           </div>

           <div className="p-6 bg-slate-900/60 rounded-3xl border border-white/5 space-y-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-40 transition-all duration-700">
                 <RotateCcw size={60} className="text-cyan-400" />
              </div>
              <p className="text-[12px] text-cyan-300 font-bold leading-relaxed italic pr-16 border-l-2 border-cyan-500/20 pl-6 py-2">
                 {isZh 
                   ? "“令牌类比：这就像是在追一部连载漫画。令牌就是你的‘阅读进度书签’。每当你读完最新章节，系统都会发给你一个标有新页码的新书签（新令牌）。但如果你超过 30 天没有翻阅（令牌过期），书签就会失效。”" 
                   : "“Analogy: Like a reading bookmark for a serial manga. Every time you read the latest chapter (Call API), the system gives you a new bookmark (Token) for the next session. If inactive for >30 days, the bookmark expires.”"}
              </p>
           </div>
           
           <div className="space-y-4">
              {tokenSteps.map((step, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-slate-950/60 rounded-2xl border border-white/5 group hover:border-cyan-500/40 transition-all duration-500">
                  <div className={`w-2 h-2 rounded-full shrink-0 shadow-[0_0_10px_rgba(34,211,238,0.8)] ${i === 3 ? 'bg-rose-500' : 'bg-cyan-500'}`} />
                  <p className="text-[11px] font-bold text-slate-300 italic">{step}</p>
                </div>
              ))}
           </div>
        </GlassCard>

        <footer className="pt-12 flex flex-col items-center gap-6 opacity-40">
           <div className="flex items-center gap-3">
             <FlaskConical size={14} className="text-indigo-400" />
             <span className="text-[9px] font-mono tracking-widest uppercase">Bio-Digital infrastructure v1.8</span>
           </div>
           <div className="p-6 bg-slate-900/40 border border-white/5 rounded-[2.5rem] text-center max-w-sm">
             <p className="text-[10px] text-slate-500 font-bold italic leading-relaxed uppercase tracking-[0.2em]">
               {isZh ? "数据属于用户，授权由系统管理" : "Data belongs to the user, Auth by System"}
             </p>
           </div>
        </footer>
      </div>
    </div>
  );
};