
import React, { useState } from 'react';
import { 
  ArrowLeft, BrainCircuit, Target, Cpu, FlaskConical, Binary, 
  Activity, Lock, Smartphone, Database, Terminal, CheckCircle2, 
  Info, Code2, ListTree, Timer, Layers, Zap, Download, 
  Upload, BookOpen, Warehouse, LayoutList, Fingerprint, 
  Network, Bookmark, History, RotateCcw, Filter, Boxes, 
  PackageSearch, Pipette, Droplets, Watch, Hammer, Eye, 
  ChevronRight, FileCode, ShieldCheck, Sparkles, HelpCircle,
  Clock, Map
} from 'lucide-react';
import { Language, translations } from '../services/i18n.ts';
import { GlassCard } from './GlassCard.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo.tsx';

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

  const roadmap = [
    { stage: 'ALPHA', module: 'Telemetry Core', status: 'Active', icon: Zap, desc: 'Health Connect integration & Neural Lullaby v1.0' },
    { stage: 'BETA', module: 'Wearable Mesh', status: 'Pending', icon: Watch, desc: 'Direct Oura, Whoop, and Garmin Cloud Bridge' },
    { stage: 'GAMMA', module: 'Deep Neuro', status: 'Concept', icon: BrainCircuit, desc: 'EEG Raw Data analysis & Lucid Dreaming protocols' }
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
        <div className="flex items-center gap-3">
          <Logo size={48} animated={true} />
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase leading-none">
              {t.title}
            </h1>
            <p className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-[0.3em] mt-1">
              Biological Infrastructure v2.0
            </p>
          </div>
        </div>
      </header>

      <div className="space-y-8 max-w-2xl mx-auto px-2 text-slate-300">
        
        {/* Laboratory Roadmap */}
        <GlassCard className="p-10 border-indigo-500/20 bg-indigo-500/[0.01] rounded-[4rem]">
           <div className="flex items-center gap-4 mb-10">
              <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
                <Map size={24} />
              </div>
              <div>
                 <h2 className="text-xl font-black italic text-white uppercase tracking-tight leading-none">Laboratory Roadmap</h2>
                 <p className="text-[9px] font-bold text-indigo-400/60 uppercase tracking-widest mt-1">Strategic Evolution Protocol</p>
              </div>
           </div>

           <div className="space-y-12 relative">
              <div className="absolute left-[27px] top-4 bottom-4 w-px bg-white/5" />
              {roadmap.map((item, idx) => (
                <div key={idx} className="flex gap-8 group">
                   <div className={`w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center border transition-all duration-500 ${item.status === 'Active' ? 'bg-indigo-600 border-indigo-400 shadow-[0_0_20px_rgba(79,70,229,0.3)]' : 'bg-slate-900 border-white/5 opacity-40'}`}>
                      <item.icon size={22} className={item.status === 'Active' ? 'text-white' : 'text-slate-500'} />
                   </div>
                   <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${item.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500 border border-white/5'}`}>{item.stage}</span>
                        <h3 className="text-sm font-black italic text-white uppercase tracking-wider">{item.module}</h3>
                      </div>
                      <p className="text-[11px] font-medium text-slate-500 leading-relaxed italic">{item.desc}</p>
                   </div>
                </div>
              ))}
           </div>
        </GlassCard>

        {/* Handshake Terminal Module */}
        <GlassCard className="p-10 space-y-10 border-indigo-500/20 bg-indigo-500/[0.01] rounded-[4rem]">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 shadow-[0_0_20px_rgba(79,70,229,0.2)]">
                <Terminal size={24} />
              </div>
              <div>
                 <h2 className="text-xl font-black italic text-white uppercase tracking-tight leading-none">{t.protocolTitle}</h2>
                 <p className="text-[9px] font-bold text-indigo-400/60 uppercase tracking-widest mt-1">Android SDK Implementation</p>
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
                   <pre className="p-6 text-[10px] font-mono text-indigo-300/80 leading-relaxed overflow-x-auto scrollbar-hide">
                      {handshakeDetails[activeProtocolStep].code}
                   </pre>
                </div>
              </m.div>
           </AnimatePresence>
        </GlassCard>

        <footer className="pt-12 flex flex-col items-center gap-6 opacity-40">
           <div className="flex items-center gap-3">
             <FlaskConical size={14} className="text-indigo-400" />
             <span className="text-[9px] font-mono tracking-widest uppercase">SomnoAI Lab • Secure Infrastructure v2.5</span>
           </div>
        </footer>
      </div>
    </div>
  );
};
