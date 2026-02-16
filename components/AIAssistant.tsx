import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, User, Loader2, Sparkles, BrainCircuit, 
  Terminal as TerminalIcon, Globe, Cpu, History,
  Activity, BarChart3, ChevronRight, Zap, ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { GlassCard } from './GlassCard.tsx';
import { ChatMessage, SleepRecord } from '../types.ts';
import { startContextualCoach } from '../services/geminiService.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { Language, translations } from '../services/i18n.ts';
import { Logo } from './Logo.tsx';

const m = motion as any;

const NeuralPulse = () => (
  <div className="flex gap-1.5 h-3 items-end">
    {[0.2, 0.5, 0.3, 0.8, 0.4].map((h, i) => (
      <m.div 
        key={i}
        animate={{ height: ['20%', '100%', '20%'] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
        className="w-1 bg-indigo-500/60 rounded-full"
      />
    ))}
  </div>
);

export const AIAssistant: React.FC<{ lang: Language; data: SleepRecord | null; history?: SleepRecord[] }> = ({ lang, data, history = [] }) => {
  const t = translations[lang].assistant;
  const [messages, setMessages] = useState<(ChatMessage & { sources?: any[] })[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ role: 'assistant', content: String(t.intro || 'Initializing neural link... Reporting status: NOMINAL.'), timestamp: new Date() }]);
    }
  }, [t.intro]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  const handleSend = async (overrideInput?: string) => {
    const text = overrideInput || input;
    if (!text.trim() || isTyping) return;
    
    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    
    let aiContent = "";
    let aiSources: any[] = [];
    
    setMessages(prev => [...prev, { role: 'assistant', content: "", timestamp: new Date() }]);

    try {
      const stream = await startContextualCoach(
        messages.concat(userMsg).map(m => ({ role: m.role, content: String(m.content) })),
        history.length > 0 ? history : (data ? [data] : []),
        lang
      );

      for await (const chunk of stream) {
        const chunkText = chunk.text;
        const sources = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        if (chunkText) {
          aiContent += chunkText;
          if (sources.length > 0) aiSources = [...aiSources, ...sources];
          setMessages(prev => {
            const newMsgs = [...prev];
            const last = newMsgs[newMsgs.length - 1];
            last.content = String(aiContent);
            last.sources = aiSources;
            return newMsgs;
          });
        }
      }
    } catch (err) {
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1].content = "Handshake protocol failure. Neural link severed. Please retry connection.";
        return newMsgs;
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-w-5xl mx-auto font-sans animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 px-4 gap-6">
        <div className="flex items-center gap-6 text-left">
          <div className="p-4 bg-slate-900 border border-indigo-500/20 rounded-[1.8rem] text-indigo-400 shadow-2xl relative">
            <BrainCircuit size={28} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#01040a] animate-pulse" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black italic text-white uppercase tracking-tight">AI Synthesis Coach</h1>
            <div className="flex items-center gap-4">
               <NeuralPulse />
               <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest italic">Core Neural Grid Active</span>
            </div>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-4 px-6 py-3 bg-white/[0.02] border border-white/5 rounded-2xl">
           <ShieldCheck size={16} className="text-indigo-500" />
           <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Privacy Protocol: Edge_v2</span>
        </div>
      </header>

      <GlassCard className="flex-1 flex flex-col mb-8 overflow-hidden rounded-[4rem] border-white/5 bg-black/60 shadow-[0_80px_160px_-40px_rgba(0,0,0,1)]" intensity={0.2}>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-12 space-y-12 scrollbar-hide">
          {messages.map((msg, idx) => (
            <m.div 
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-8 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-2xl ${
                msg.role === 'assistant' 
                  ? 'bg-slate-900 border-indigo-500/30 text-indigo-400' 
                  : 'bg-indigo-600 border-white/20 text-white'
              }`}>
                {msg.role === 'assistant' ? <Logo size={32} animated={isTyping && idx === messages.length - 1} /> : <User size={28} />}
              </div>
              
              <div className={`space-y-3 max-w-[85%] ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`p-10 rounded-[3rem] text-base leading-relaxed shadow-inner transition-all duration-500 ${
                  msg.role === 'assistant' 
                    ? 'bg-slate-900/60 border border-white/5 text-slate-200 backdrop-blur-3xl' 
                    : 'bg-indigo-600 text-white border border-indigo-500 shadow-2xl'
                }`}>
                  <div className="whitespace-pre-wrap italic font-medium">{String(msg.content || (isTyping && idx === messages.length - 1 ? "Synthesizing biological telemetry..." : "Signal silent..."))}</div>
                  
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-white/10 flex flex-wrap gap-3">
                      {msg.sources.map((src, sIdx) => (
                        <a key={sIdx} href={String(src.web?.uri || '')} target="_blank" className="px-5 py-2.5 bg-black/40 hover:bg-white/10 border border-white/10 rounded-full text-[9px] font-black text-indigo-400 flex items-center gap-3 transition-all italic shadow-lg">
                          <Globe size={12} /> {String(src.web?.title || 'Journal_Ref').toUpperCase()}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-[8px] font-black text-slate-800 uppercase tracking-widest px-4">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • NODE_RELAY_SYNC
                </p>
              </div>
            </m.div>
          ))}
          {isTyping && messages[messages.length-1].content === "" && (
             <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-8">
               <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-indigo-500/20 flex items-center justify-center text-indigo-400"><RefreshCw className="animate-spin" size={24} /></div>
               <div className="p-10 rounded-[3rem] bg-slate-900/40 border border-white/5 text-slate-600 text-sm font-black italic tracking-widest uppercase">Initializing neural synthesis...</div>
             </m.div>
          )}
        </div>

        {/* Neural Input Sector */}
        <div className="p-10 bg-slate-950/80 border-t border-white/5">
          <div className="relative group max-w-4xl mx-auto">
            <div className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-500 transition-colors">
              <TerminalIcon size={20} />
            </div>
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={String(t.placeholder || 'Command neural grid...')}
              className="w-full bg-[#050a1f] border border-white/10 rounded-full pl-20 pr-24 py-8 text-sm text-white focus:border-indigo-500/60 focus:bg-black outline-none transition-all italic font-bold placeholder:text-slate-800 shadow-2xl"
            />
            <m.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-5 bg-indigo-600 text-white rounded-full hover:bg-indigo-500 transition-all active:scale-90 disabled:opacity-30 shadow-2xl flex items-center justify-center group"
            >
              <Send size={22} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </m.button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};