import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, User, Loader2, Trash2, Moon, ExternalLink, Cpu, LayoutGrid, Zap, Globe, Sparkles, ShieldCheck, Terminal as TerminalIcon, 
  Layers, AlertCircle, RefreshCw, Database
} from 'lucide-react';
import { GlassCard } from './GlassCard.tsx';
import { ChatMessage, SleepRecord } from '../types.ts';
import { chatWithCoach } from '../services/geminiService.ts';
import { hfService } from '../services/hfService.ts';
import { vertexService } from '../services/vertexService.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { Language, translations } from '../services/i18n.ts';
import { Logo } from './Logo.tsx';

const m = motion as any;

const CROAvatar = ({ isProcessing = false, size = 32, theme = 'indigo' }: { isProcessing?: boolean, size?: number, theme?: 'indigo' | 'amber' | 'emerald' }) => (
  <m.div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
    <div className="absolute inset-0 bg-slate-900 rounded-2xl border border-white/5 shadow-inner" />
    <Logo size={size * 0.7} animated={isProcessing} className={theme === 'amber' ? 'grayscale brightness-150' : theme === 'emerald' ? 'hue-rotate-90' : ''} />
    {isProcessing && (
       <m.div 
         animate={{ scale: [1, 1.4, 1], opacity: [0, 0.2, 0] }}
         transition={{ duration: 2, repeat: Infinity }}
         className={`absolute inset-0 rounded-full blur-2xl ${theme === 'amber' ? 'bg-amber-500' : theme === 'emerald' ? 'bg-emerald-500' : 'bg-indigo-500'}`}
       />
    )}
  </m.div>
);

interface AIAssistantProps {
  lang: Language;
  data: SleepRecord | null;
  onNavigate?: (view: any) => void;
  isSandbox?: boolean;
}

type ProtocolType = 'core' | 'vertex' | 'external' | 'legacy';

export const AIAssistant: React.FC<AIAssistantProps> = ({ lang, data }) => {
  const t = translations[lang].assistant;
  const [messages, setMessages] = useState<(ChatMessage & { sources?: any[] })[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [protocol, setProtocol] = useState<ProtocolType>('core');
  const [iframeLoading, setIframeLoading] = useState(true);
  const [fallbackActive, setFallbackActive] = useState(false);
  
  useEffect(() => {
    if (messages.length === 0) {
      const welcome = data 
        ? `${t.intro}\n\nI see your current sleep score is ${data.score}/100.`
        : t.intro;
      setMessages([{ role: 'assistant', content: welcome, timestamp: new Date() }]);
    }
  }, [data, t.intro]);

  const handleSend = async () => {
    const textToSend = input.trim();
    if (!textToSend || isTyping) return;
    
    const userMsg: ChatMessage = { role: 'user', content: textToSend, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setFallbackActive(false);
    
    try {
      if (protocol === 'core') {
        const response = await chatWithCoach(messages.concat(userMsg).map(m => ({ role: m.role, content: m.content })), lang, data);
        if (response) {
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: response.text || "Handshake Timeout", 
            sources: response.sources, 
            timestamp: new Date() 
          }]);
        }
      } else if (protocol === 'vertex') {
        const response = await vertexService.analyze(textToSend);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: response || "Vertex node returned empty signal.", 
          timestamp: new Date() 
        }]);
      } else if (protocol === 'external') {
        const response = await hfService.chat(textToSend);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: response || "External node returned empty signal.", 
          timestamp: new Date() 
        }]);
      }
    } catch (err: any) {
      const errMsg = err.message || "";
      const isQuotaError = errMsg.includes("QUOTA") || errMsg.includes("429");
      const isNotFoundError = errMsg.includes("NODE_NOT_FOUND") || errMsg.includes("404");
      
      let errorMsg = protocol === 'core' 
        ? "Neural Bridge unavailable. Switching to external node protocol might assist." 
        : protocol === 'vertex'
        ? "Vertex Node access restricted. Ensure GCP_PROJECT_ID and credentials are set."
        : "External Node sync failure. Connection to the HF hub was severed.";
      
      if (isQuotaError) {
        errorMsg = "Neural Core (Pro) quota reached. System has successfully engaged Flash fallback protocol for this session.";
        setFallbackActive(true);
      } else if (isNotFoundError && protocol === 'external') {
        errorMsg = "The External HF Space is currently unreachable (404). Please utilize the Neural Core (Gemini) instead.";
      }
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: errorMsg, 
        timestamp: new Date() 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] max-w-4xl mx-auto font-sans relative">
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 px-4 pt-10">
        <div className="flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center shadow-inner relative">
            <Logo size={24} animated={true} />
            <div className="absolute -top-1 -right-1">
               <Moon size={12} className="text-indigo-400 fill-indigo-400/20" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-black italic text-white uppercase leading-none">{t.title}</h1>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1 italic">
              Active Node: {
                protocol === 'core' ? (fallbackActive ? 'Neural core (FLASH_FALLBACK)' : 'Neural Core V2.5') : 
                protocol === 'vertex' ? 'Vertex Secure Bridge' :
                protocol === 'external' ? 'HF External Node (API)' : 
                'Legacy Sandbox (Iframe)'
              }
            </p>
          </div>
        </div>

        <div className="flex bg-slate-950/80 p-1.5 rounded-full border border-white/5 shadow-xl overflow-x-auto no-scrollbar max-w-full">
           <button onClick={() => setProtocol('core')} className={`px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${protocol === 'core' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}>
             <Zap size={10} fill={protocol === 'core' ? "currentColor" : "none"} /> Core
           </button>
           <button onClick={() => setProtocol('vertex')} className={`px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${protocol === 'vertex' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-500 hover:text-slate-300'}`}>
             <Database size={10} /> Vertex
           </button>
           <button onClick={() => setProtocol('external')} className={`px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${protocol === 'external' ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' : 'text-slate-500 hover:text-slate-300'}`}>
             <Globe size={10} /> HF
           </button>
           <button onClick={() => setProtocol('legacy')} className={`px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${protocol === 'legacy' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
             <Layers size={10} /> Legacy
           </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden px-2 mb-4">
        <AnimatePresence mode="wait">
          {protocol !== 'legacy' ? (
            <m.div key="chat" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-6 px-4 mb-6 scrollbar-hide">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className="mt-1">
                          {msg.role === 'assistant' ? (
                            <CROAvatar theme={protocol === 'external' ? 'amber' : protocol === 'vertex' ? 'emerald' : 'indigo'} />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-500"><User size={14}/></div>
                          )}
                        </div>
                        <div className={`p-5 rounded-[2rem] text-sm leading-relaxed shadow-xl text-left relative overflow-hidden ${
                          msg.role === 'assistant' 
                            ? (protocol === 'external' ? 'bg-amber-950/20 border border-amber-500/20 text-amber-200' : protocol === 'vertex' ? 'bg-emerald-950/20 border border-emerald-500/20 text-emerald-200' : 'bg-slate-900/60 border border-white/5 text-slate-300') 
                            : 'bg-indigo-600 text-white'
                        }`}>
                          <div className="whitespace-pre-wrap italic">{msg.content}</div>
                          {msg.sources && msg.sources.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-2">
                              {msg.sources.map((chunk, sIdx) => (
                                <a key={sIdx} href={chunk.web?.uri || chunk.maps?.uri} target="_blank" className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[9px] font-bold text-indigo-300 flex items-center gap-1.5 transition-all hover:bg-indigo-500/20"><ExternalLink size={10} /> {chunk.web?.title || "Signal Source"}</a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start gap-3">
                    <CROAvatar isProcessing={true} theme={protocol === 'external' ? 'amber' : protocol === 'vertex' ? 'emerald' : 'indigo'} />
                    <div className={`px-6 py-4 rounded-full border flex items-center gap-3 ${protocol === 'external' ? 'bg-amber-950/20 border-amber-500/20' : protocol === 'vertex' ? 'bg-emerald-950/20 border-emerald-500/20' : 'bg-slate-900/40 border-white/5'}`}>
                      <m.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className={`w-1.5 h-1.5 rounded-full ${protocol === 'external' ? 'bg-amber-500' : protocol === 'vertex' ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                      <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest italic">Synthesizing...</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="px-4">
                <GlassCard className={`p-1.5 rounded-full flex items-center gap-2 border-white/10 ${protocol === 'external' ? 'border-amber-500/20' : protocol === 'vertex' ? 'border-emerald-500/20' : ''}`}>
                  <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder={t.placeholder} className="flex-1 bg-transparent outline-none px-6 py-3 text-sm text-slate-200 placeholder:text-slate-700 font-medium italic" />
                  <button onClick={handleSend} disabled={!input.trim() || isTyping} className={`w-12 h-12 flex items-center justify-center rounded-full text-white shadow-lg active:scale-90 transition-all disabled:bg-slate-800 disabled:text-slate-600 ${protocol === 'external' ? 'bg-amber-600 hover:bg-amber-500' : protocol === 'vertex' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-500'}`}>
                    <Send size={18} />
                  </button>
                </GlassCard>
              </div>
            </m.div>
          ) : (
            <m.div key="sandbox" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="h-full flex flex-col bg-black/40 rounded-[3rem] border border-white/5 relative overflow-hidden group">
               <div className="absolute inset-0 pointer-events-none z-20 mix-blend-overlay opacity-20 bg-gradient-to-tr from-indigo-500/20 via-transparent to-amber-500/20" />
               
               <div className="p-4 bg-slate-900/40 border-b border-white/5 flex items-center justify-between relative z-30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500"><Globe size={14} /></div>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Legacy HF Sandbox (Iframe Protocol)</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                    <ShieldCheck size={10} className="text-emerald-400" />
                    <span className="text-[8px] font-black text-emerald-400 uppercase">External Frame</span>
                  </div>
               </div>
               
               <div className="flex-1 relative z-10 overflow-hidden">
                 {iframeLoading && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#020617] gap-4">
                      <Loader2 className="animate-spin text-amber-500" size={32} />
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Initializing Remote Frame...</p>
                   </div>
                 )}
                 <iframe 
                   src="https://hf.space/embed/nomic-ai/gpt4all-j"
                   className={`w-full h-full border-none rounded-b-[3rem] transition-opacity duration-1000 ${iframeLoading ? 'opacity-0' : 'opacity-100'} grayscale invert hue-rotate-180 opacity-90 contrast-125 brightness-110`}
                   title="Sandbox AI Interface"
                   onLoad={() => setIframeLoading(false)}
                 />
               </div>

               <div className="absolute bottom-4 left-0 right-0 px-8 flex justify-center z-30 opacity-0 group-hover:opacity-40 transition-opacity">
                  <p className="text-[8px] font-bold text-slate-400 italic">IFRAME PERSISTENCE: Best for when API calls are rate-limited.</p>
               </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-center pb-6 opacity-30">
        <p className="text-[8px] font-mono uppercase tracking-[0.5em] text-slate-500 italic flex items-center gap-4">
          <TerminalIcon size={10} /> {protocol === 'core' ? 'NEURAL_LINK_ENCRYPTED' : 'EXTERNAL_SIGNAL_ACTIVE'} • REV: 2026.2
        </p>
      </div>
    </div>
  );
};