import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, User, Loader2, Sparkles, BrainCircuit, 
  Terminal as TerminalIcon, Globe, Cpu, History,
  Activity, BarChart3, ChevronRight, Zap, ShieldCheck,
  RefreshCw, Binary, Network
} from 'lucide-react';
import { GlassCard } from './GlassCard.tsx';
import { ChatMessage, SleepRecord } from '../types.ts';
import { startContextualCoach } from '../services/geminiService.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { Language, translations } from '../services/i18n.ts';
import { Logo } from './Logo.tsx';

const m = motion as any;

const NeuralPulse = () => (
  <div className="flex gap-2 h-4 items-end">
    {[0.2, 0.5, 0.3, 0.8, 0.4, 0.6].map((h, i) => (
      <m.div 
        key={i}
        animate={{ height: ['20%', '100%', '20%'] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.12, ease: "easeInOut" }}
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
      setMessages([{ role: 'assistant', content: String(t.intro || 'Neural link established. Chief Research Officer online.'), timestamp: new Date() }]);
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
        newMsgs[newMsgs.length - 1].content = "Handshake severed. Protocol violation detected. Please re-initiate link.";
        return newMsgs;
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-240px)] md:h-[calc(100vh-220px)] max-w-6xl mx-auto font-sans animate-in fade-in slide-in-from-bottom-12 duration-1000">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-16 px-4 md:px-6 gap-6 md:gap-10 text-left">
        <div className="flex items-center gap-6 md:gap-10">
          <div className="p-4 md:p-6 bg-slate-900 border-2 border-indigo-500/20 rounded-[1.8rem] md:rounded-[2.5rem] text-indigo-400 shadow-[0_30px_70px_rgba(0,0,0,0.6)] relative group">
            <BrainCircuit size={32} className="md:size-10" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#01040a] animate-pulse" />
          </div>
          <div className="space-y-1 md:space-y-3">
            <h1 className="text-3xl md:text-4xl font-black italic text-white uppercase tracking-tighter leading-none">AI Synthesis Coach</h1>
            <div className="flex items-center gap-4 md:gap-6">
               <NeuralPulse />
               <span className="text-[9px] md:text-[11px] font-black text-slate-600 uppercase tracking-[0.4em] md:tracking-[0.5em] italic">Core Grid: ONLINE</span>
            </div>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-6 px-10 py-5 bg-indigo-600/5 border border-indigo-500/10 rounded-[2rem] shadow-inner">
           <ShieldCheck size={24} className="text-indigo-400" />
           <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Protocol: EDGE_SYNTHESIS_v4.8</span>
        </div>
      </header>

      <GlassCard className="flex-1 flex flex-col mb-12 overflow-hidden rounded-[4rem] md:rounded-[6rem] border-white/10 bg-black/70 shadow-[0_120px_250px_-50px_rgba(0,0,0,1)]" intensity={0.2}>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 md:p-20 space-y-16 md:space-y-24 scrollbar-hide">
          {messages.map((msg, idx) => (
            <m.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-6 md:gap-12 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] flex items-center justify-center shrink-0 border-2 shadow-2xl relative group ${
                msg.role === 'assistant' 
                  ? 'bg-slate-950 border-indigo-500/30 text-indigo-400' 
                  : 'bg-indigo-600 border-white/20 text-white'
              }`}>
                {msg.role === 'assistant' ? <Logo size={32} className="md:size-[44px]" animated={isTyping && idx === messages.length - 1} /> : <User size={28} className="md:size-10" />}
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl md:rounded-[2rem]" />
              </div>
              
              <div className={`space-y-4 md:space-y-6 max-w-[92%] md:max-w-[88%] ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`p-8 md:p-16 rounded-[2.5rem] md:rounded-[5rem] text-[18px] md:text-[22px] leading-relaxed shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] transition-all duration-700 relative overflow-hidden ${
                  msg.role === 'assistant' 
                    ? 'bg-slate-900/80 border border-white/10 text-slate-100 backdrop-blur-3xl' 
                    : 'bg-indigo-600 text-white border border-indigo-400/30 shadow-2xl'
                }`}>
                  {msg.role === 'assistant' && (
                     <div className="absolute top-0 right-0 p-8 md:p-12 opacity-[0.04] text-indigo-400 pointer-events-none">
                       <Binary size={150} className="md:size-[200px]" />
                     </div>
                  )}
                  <div className="whitespace-pre-wrap italic font-bold tracking-tight relative z-10 leading-[1.35]">
                    {String(msg.content || (isTyping && idx === messages.length - 1 ? "Synthesizing biological telemetry patterns..." : "Signal Void..."))}
                  </div>
                  
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-8 md:mt-12 pt-8 md:pt-12 border-t border-white/10 flex flex-wrap gap-3 md:gap-5 relative z-10">
                      {msg.sources.map((src, sIdx) => (
                        <a key={sIdx} href={String(src.web?.uri || '')} target="_blank" className="px-5 py-2 md:px-8 md:py-4 bg-black/50 hover:bg-indigo-600/30 border border-white/10 rounded-full text-[10px] md:text-[11px] font-black text-indigo-400 flex items-center gap-3 transition-all italic shadow-2xl">
                          <Globe size={14} className="md:size-4" /> {String(src.web?.title || 'Research_Reference').toUpperCase()}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-[8px] md:text-[10px] font-black text-slate-800 uppercase tracking-[0.4em] md:tracking-[0.6em] px-8 md:px-12 italic">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • NEURAL_RELAY_v4.8
                </p>
              </div>
            </m.div>
          ))}
          {isTyping && messages[messages.length-1].content === "" && (
             <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-6 md:gap-12">
               <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] bg-slate-950 border-2 border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-2xl">
                 {/* Fixed: Combined duplicated className attributes into a single attribute */}
                 <RefreshCw className="animate-spin md:size-[32px]" size={24} />
               </div>
               <div className="p-8 md:p-16 rounded-[2.5rem] md:rounded-[5rem] bg-slate-950/40 border border-white/10 text-slate-700 text-base md:text-xl font-black italic tracking-widest uppercase">Synthesizing...</div>
             </m.div>
          )}
        </div>

        <div className="p-6 md:p-14 bg-slate-950/95 border-t border-white/10">
          <div className="relative group max-w-5xl mx-auto">
            <div className="absolute left-8 md:left-12 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-500 transition-colors">
              <TerminalIcon size={24} className="md:size-8" />
            </div>
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={String(t.placeholder || 'Command laboratory grid...')}
              className="w-full bg-[#050a1f] border-2 border-white/10 rounded-full pl-20 md:pl-28 pr-28 md:pr-32 py-6 md:py-10 text-lg md:text-xl text-white focus:border-indigo-500/50 focus:bg-black outline-none transition-all italic font-black placeholder:text-slate-800 shadow-[0_40px_80px_-20px_rgba(0,0,0,1)]"
            />
            <m.button 
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 p-5 md:p-7 bg-indigo-600 text-white rounded-full hover:bg-indigo-500 transition-all active:scale-90 disabled:opacity-30 shadow-2xl flex items-center justify-center group"
            >
              <Send size={24} className="md:size-9 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
            </m.button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};