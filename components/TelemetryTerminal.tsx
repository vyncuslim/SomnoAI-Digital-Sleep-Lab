
import React, { useState } from 'react';
import { GlassCard } from './GlassCard.tsx';
import { 
  Terminal, Zap, Upload, Copy, Check, ShieldCheck, 
  Activity, ArrowLeft, Network, FileCode, Server,
  ChevronRight, Database, Code2, Globe, Lock, Cpu,
  ExternalLink, Command, RefreshCw, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language } from '../services/i18n.ts';
import { supabase } from '../services/supabaseService.ts';

const m = motion as any;

interface TelemetryTerminalProps {
  lang: Language;
  onBack: () => void;
}

export const TelemetryTerminal: React.FC<TelemetryTerminalProps> = ({ lang, onBack }) => {
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'info' | 'curl' | 'js'>('info');

  const PUBLIC_API = "https://sleepsomno.com/api/health-upload";
  const LOCAL_PROXY = "/api/health-upload"; // Use relative path to test Vercel rewrite

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 5));
  };

  const handlePulseTest = async () => {
    setStatus('testing');
    addLog(`Gateway: Testing proxy link ${PUBLIC_API}...`);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const apiKey = (supabase as any).supabaseKey; // The anon key

      // DIRECT FETCH TO PROXY URL
      const response = await fetch(LOCAL_PROXY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          source: 'gateway_test_pulse',
          heart_rate: 72,
          steps: 100,
          recorded_at: new Date().toISOString()
        })
      });

      if (response.ok) {
        setStatus('success');
        addLog("Gateway: 200 OK. Public route fully operational.");
      } else {
        const errData = await response.text();
        addLog(`Gateway: Error ${response.status}. ${errData.slice(0, 20)}...`);
        throw new Error();
      }
    } catch (e) {
      setStatus('error');
      addLog("Gateway: Handshake failed. Check Vercel rewrites.");
    }
    setTimeout(() => setStatus('idle'), 3000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const curlCode = `curl -X POST ${PUBLIC_API} \\
  -H "Authorization: Bearer YOUR_ANON_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "heart_rate": 68,
    "steps": 5420,
    "source": "wearable_node_01"
  }'`;

  const jsCode = `// SomnoAI Telemetry Ingress Example
const uploadData = async (metrics) => {
  const response = await fetch('${PUBLIC_API}', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_ANON_KEY'
    },
    body: JSON.stringify(metrics)
  });
  return await response.json();
};`;

  return (
    <div className="space-y-10 pb-40 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto px-4 text-left">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-4 bg-white/5 hover:bg-white/10 rounded-3xl text-slate-400 hover:text-white transition-all border border-white/5 shadow-lg active:scale-95">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter leading-none">
              API <span className="text-indigo-400">Gateway</span>
            </h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2">External Telemetry Ingress</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-indigo-500/10 px-6 py-3 rounded-2xl border border-indigo-500/20">
           <Cpu size={16} className="text-indigo-400" />
           <span className="text-[10px] font-black text-white uppercase tracking-widest">Edge Proxy v1.1</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-8">
          <GlassCard className="p-10 rounded-[4rem] border-white/5" intensity={1.1}>
            <div className="flex justify-between items-center mb-8">
               <div className="flex items-center gap-4">
                 <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
                   <Globe size={24} />
                 </div>
                 <h2 className="text-lg font-black italic text-white uppercase tracking-tight">Public Endpoint</h2>
               </div>
               <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-widest rounded-full animate-pulse">SSL Protected</span>
            </div>

            <div className="space-y-6">
              <div className="bg-black/40 rounded-[2rem] border border-white/5 p-6 space-y-3 relative group">
                <div className="flex justify-between items-center text-[9px] font-black text-slate-600 uppercase tracking-widest px-2">
                  <span>URL PATH</span>
                  <div className="flex items-center gap-2">
                     <span className="text-indigo-400">GATEWAY ACTIVE</span>
                  </div>
                </div>
                <div className="text-sm font-mono text-indigo-300 break-all px-2 font-bold select-all">
                  {PUBLIC_API}
                </div>
                <button 
                  onClick={() => copyToClipboard(PUBLIC_API)}
                  className="absolute right-4 bottom-4 p-3 bg-indigo-600/20 text-indigo-400 rounded-xl hover:bg-indigo-600/40 transition-all"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>

              <div className="flex gap-2 bg-slate-900/60 p-1.5 rounded-full border border-white/5 self-start w-fit">
                {['info', 'curl', 'js'].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.15em] transition-all ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="bg-black/60 rounded-[2rem] border border-white/5 overflow-hidden">
                <AnimatePresence mode="wait">
                  {activeTab === 'info' ? (
                    <m.div key="info" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 space-y-4">
                       <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-600 uppercase">Method</p>
                            <p className="text-xs font-bold text-white uppercase italic">POST</p>
                         </div>
                         <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-600 uppercase">Auth</p>
                            <p className="text-xs font-bold text-white uppercase italic">Bearer Token</p>
                         </div>
                       </div>
                       <p className="text-[10px] text-slate-500 italic leading-relaxed pt-2 border-t border-white/5">
                         Use this endpoint for automated wearable synchronization. The request must include your project's ANON_KEY for authentication.
                       </p>
                    </m.div>
                  ) : (
                    <m.div key="code" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative group">
                       <pre className="p-6 text-[10px] font-mono text-indigo-300/80 leading-relaxed overflow-x-auto scrollbar-hide max-h-[300px]">
                          {activeTab === 'curl' ? curlCode : jsCode}
                       </pre>
                       <button onClick={() => copyToClipboard(activeTab === 'curl' ? curlCode : jsCode)} className="absolute right-4 top-4 p-2 bg-white/5 text-slate-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                         <Copy size={14} />
                       </button>
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="lg:col-span-5 space-y-8">
          <GlassCard className="p-10 rounded-[4rem] border-indigo-500/20 bg-indigo-500/[0.01]" intensity={1.5}>
            <div className="flex items-center justify-between mb-10">
               <div className="flex items-center gap-3">
                 <Activity size={20} className="text-indigo-400" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Integration Test</span>
               </div>
            </div>

            <button 
              onClick={handlePulseTest}
              disabled={status === 'testing'}
              className={`w-full py-6 rounded-full font-black text-[12px] uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95 italic overflow-hidden relative ${
                status === 'success' ? 'bg-emerald-600 shadow-emerald-500/20' : 
                status === 'error' ? 'bg-rose-600 shadow-rose-500/20' : 
                'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'
              }`}
            >
              {status === 'testing' ? <RefreshCw size={18} className="animate-spin" /> : <Command size={18} />}
              {status === 'testing' ? 'VERIFYING PROXY...' : 'TEST PUBLIC URL'}
              
              {status === 'testing' && (
                <m.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 bg-white/10"
                />
              )}
            </button>

            <div className="mt-10 space-y-4">
              <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-600 tracking-widest border-b border-white/5 pb-2">
                <Terminal size={12} /> Gateway logs
              </div>
              <div className="min-h-[140px] font-mono text-[10px] space-y-3">
                <AnimatePresence>
                  {logs.length > 0 ? logs.map((log, i) => (
                    <m.div 
                      key={log} 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      className={`italic ${log.includes('operational') || log.includes('confirmed') ? 'text-emerald-400' : log.includes('failed') || log.includes('Error') ? 'text-rose-400' : 'text-slate-500'}`}
                    >
                      {log}
                    </m.div>
                  )) : (
                    <div className="text-slate-800 italic">Ready for integrated diagnostic...</div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </GlassCard>

          <div className="p-8 bg-slate-900/40 border border-white/5 rounded-[3rem] space-y-4 group">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock size={18} className="text-indigo-400" />
                  <span className="text-[11px] font-black uppercase text-white italic">CORS Authorization</span>
                </div>
             </div>
             <p className="text-[10px] text-slate-500 italic leading-relaxed">
               The gateway is configured to accept requests from any origin, provided a valid <span className="text-white">Authorization</span> header is present.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};
