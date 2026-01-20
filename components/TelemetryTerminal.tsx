
import React, { useState } from 'react';
import { GlassCard } from './GlassCard.tsx';
import { 
  Terminal, Zap, Upload, Copy, Check, ShieldCheck, 
  Activity, ArrowLeft, Network, FileCode, Server,
  ChevronRight, Database, Code2, Globe, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language } from '../services/i18n.ts';
import { healthDataApi } from '../services/supabaseService.ts';

const m = motion as any;

interface TelemetryTerminalProps {
  lang: Language;
  onBack: () => void;
}

export const TelemetryTerminal: React.FC<TelemetryTerminalProps> = ({ lang, onBack }) => {
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [logs, setLogs] = useState<string[]>([]);

  const API_ENDPOINT = "https://ojcvvtyaebdodmegwqan.supabase.co/functions/v1/bright-responder";

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 5));
  };

  const handlePulseTest = async () => {
    setStatus('testing');
    addLog("Initiating pulse handshake with Edge Node...");
    try {
      // 模拟一个简单的测试调用
      const result = await healthDataApi.uploadTelemetry({ 
        source: 'manual_test', 
        heart_rate: 0, 
        steps: 0, 
        weight: 0 
      });
      
      if (result.success) {
        setStatus('success');
        addLog("Pulse verified. Link integrity 100%.");
      } else {
        throw new Error("Handshake timeout");
      }
    } catch (e) {
      setStatus('error');
      addLog("Node unreachable. Check infrastructure logs.");
    }
    setTimeout(() => setStatus('idle'), 2000);
  };

  const copyEndpoint = () => {
    navigator.clipboard.writeText(API_ENDPOINT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-10 pb-40 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto px-4 text-left">
      <header className="flex items-center gap-6">
        <button onClick={onBack} className="p-4 bg-white/5 hover:bg-white/10 rounded-3xl text-slate-400 hover:text-white transition-all border border-white/5 shadow-lg active:scale-95">
          <ArrowLeft size={20} />
        </button>
        <div>
           <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter leading-none">
             Telemetry <span className="text-indigo-400">Bridge</span>
           </h1>
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2">API Control & Ingress Hub</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 左侧：文档与配置 */}
        <div className="lg:col-span-7 space-y-8">
          <GlassCard className="p-10 rounded-[4rem] border-white/5" intensity={1.1}>
            <div className="flex items-center gap-4 mb-8">
               <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
                 <Globe size={24} />
               </div>
               <h2 className="text-lg font-black italic text-white uppercase tracking-tight">Active Endpoint</h2>
            </div>

            <div className="space-y-6">
              <div className="bg-black/40 rounded-[2rem] border border-white/5 p-6 space-y-3 relative group">
                <div className="flex justify-between items-center text-[9px] font-black text-slate-600 uppercase tracking-widest px-2">
                  <span>POST / HTTPS</span>
                  <div className="flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-emerald-500">Live</span>
                  </div>
                </div>
                <div className="text-[13px] font-mono text-indigo-300 break-all px-2 font-bold select-all">
                  {API_ENDPOINT}
                </div>
                <button 
                  onClick={copyEndpoint}
                  className="absolute right-4 bottom-4 p-3 bg-indigo-600/20 text-indigo-400 rounded-xl hover:bg-indigo-600/40 transition-all"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-2">
                    <div className="flex items-center gap-2 text-slate-500">
                       <Lock size={12} />
                       <span className="text-[9px] font-black uppercase tracking-widest">Auth Method</span>
                    </div>
                    <p className="text-xs font-bold text-white uppercase italic">Bearer Token / Anon</p>
                 </div>
                 <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-2">
                    <div className="flex items-center gap-2 text-slate-500">
                       <FileCode size={12} />
                       <span className="text-[9px] font-black uppercase tracking-widest">Payload Type</span>
                    </div>
                    <p className="text-xs font-bold text-white uppercase italic">Application/JSON</p>
                 </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-10 rounded-[4rem] border-white/5" intensity={0.5}>
            <div className="flex items-center gap-4 mb-8">
               <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
                 <Code2 size={24} />
               </div>
               <h2 className="text-lg font-black italic text-white uppercase tracking-tight">Request Schema</h2>
            </div>
            <pre className="p-6 bg-black/60 rounded-3xl border border-white/5 text-[10px] font-mono text-indigo-300/80 leading-relaxed overflow-x-auto scrollbar-hide">
{`{
  "steps": number,
  "heart_rate": number,
  "weight": number,
  "recorded_at": "ISO8601_TIMESTAMP",
  "source": "string_identifier",
  "payload": object // Optional raw data
}`}
            </pre>
          </GlassCard>
        </div>

        {/* 右侧：交互控制 */}
        <div className="lg:col-span-5 space-y-8">
          <GlassCard className="p-10 rounded-[4rem] border-indigo-500/20 bg-indigo-500/[0.01]" intensity={1.5}>
            <div className="flex items-center justify-between mb-10">
               <div className="flex items-center gap-3">
                 <Activity size={20} className="text-indigo-400" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Interface Diagnostic</span>
               </div>
            </div>

            <button 
              onClick={handlePulseTest}
              disabled={status === 'testing'}
              className={`w-full py-6 rounded-full font-black text-[12px] uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95 italic overflow-hidden relative ${
                status === 'success' ? 'bg-emerald-600' : 
                status === 'error' ? 'bg-rose-600' : 
                'bg-indigo-600 hover:bg-indigo-500'
              }`}
            >
              {status === 'testing' ? <Zap size={18} className="animate-pulse" /> : <Network size={18} />}
              {status === 'testing' ? 'TESTING LINK...' : 'EXECUTE PULSE TEST'}
              
              {status === 'testing' && (
                <m.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute inset-0 bg-white/20"
                />
              )}
            </button>

            <div className="mt-10 space-y-4">
              <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-600 tracking-widest border-b border-white/5 pb-2">
                <Terminal size={12} /> Live Ingestion Log
              </div>
              <div className="min-h-[140px] font-mono text-[10px] space-y-3">
                <AnimatePresence>
                  {logs.length > 0 ? logs.map((log, i) => (
                    <m.div 
                      key={log} 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      className={`italic ${log.includes('INTEGRITY') ? 'text-emerald-400' : log.includes('ERR') ? 'text-rose-400' : 'text-slate-500'}`}
                    >
                      {log}
                    </m.div>
                  )) : (
                    <div className="text-slate-800 italic">Standby for data telemetry...</div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </GlassCard>

          <div className="p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-[3rem] space-y-4 group hover:bg-indigo-500/10 transition-all cursor-pointer">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Database size={18} className="text-indigo-400" />
                  <span className="text-[11px] font-black uppercase text-white italic">Import Data Stream</span>
                </div>
                <ChevronRight size={16} className="text-indigo-400 group-hover:translate-x-1 transition-transform" />
             </div>
             <p className="text-[10px] text-slate-500 italic leading-relaxed">
               Drop a compliant JSON file to perform bulk ingestion into the Somno Lab primary ledger.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};
