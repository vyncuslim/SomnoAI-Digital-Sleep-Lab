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
    <div className="flex flex-col h-[calc(100vh-220px)] max-w-5xl mx-auto font-sans animate-in fade-in slide-in-from-bottom-12 duration-1000">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 px-6 gap-8 text-left">
        <div className="flex items-center gap-8">
          <div className="p-5 bg-slate-900 border border-indigo-500/20 rounded-[2rem] text-indigo-400 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative group">
            <BrainCircuit size={32} />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-[#01040a] animate-pulse" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter leading-none">AI Synthesis Coach</h1>
            <div className="flex items-center gap-5">
               <NeuralPulse />
               <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] italic">Core Neural Grid: ONLINE</span>
            </div>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-5 px-8 py-4 bg-indigo-600/5 border border-indigo-500/10 rounded-[1.5rem] shadow-inner">
           <ShieldCheck size={20} className="text-indigo-400" />
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protocol: EDGE_SYNTHESIS_v4</span>
        </div>
      </header>

      <GlassCard className="flex-1 flex flex-col mb-10 overflow-hidden rounded-[5rem] border-white/5 bg-black/60 shadow-[0_100px_200px_-50px_rgba(0,0,0,1)]" intensity={0.2}>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-12 md:p-16 space-y-16 scrollbar-hide">
          {messages.map((msg, idx) => (
            <m.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-10 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-16 h-16 rounded-[1.8rem] flex items-center justify-center shrink-0 border-2 shadow-2xl relative group ${
                msg.role === 'assistant' 
                  ? 'bg-slate-950 border-indigo-500/30 text-indigo-400' 
                  : 'bg-indigo-600 border-white/20 text-white'
              }`}>
                {msg.role === 'assistant' ? <Logo size={36} animated={isTyping && idx === messages.length - 1} /> : <User size={32} />}
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.8rem]" />
              </div>
              
              <div className={`space-y-4 max-w-[85%] ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`p-12 rounded-[4rem] text-[17px] leading-relaxed shadow-inner transition-all duration-700 relative overflow-hidden ${
                  msg.role === 'assistant' 
                    ? 'bg-slate-900/60 border border-white/5 text-slate-200 backdrop-blur-3xl' 
                    : 'bg-indigo-600 text-white border border-indigo-400/30 shadow-2xl'
                }`}>
                  {msg.role === 'assistant' && (
                     <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-indigo-400 pointer-events-none">
                       <Binary size={120} />
                     </div>
                  )}
                  <div className="whitespace-pre-wrap italic font-bold tracking-tight relative z-10 leading-snug">
                    {String(msg.content || (isTyping && idx === messages.length - 1 ? "Synthesizing biological telemetry patterns..." : "Signal Void..."))}
                  </div>
                  
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-10 pt-10 border-t border-white/10 flex flex-wrap gap-4 relative z-10">
                      {msg.sources.map((src, sIdx) => (
                        <a key={sIdx} href={String(src.web?.uri || '')} target="_blank" className="px-6 py-3 bg-black/40 hover:bg-indigo-600/20 border border-white/10 rounded-full text-[10px] font-black text-indigo-400 flex items-center gap-3 transition-all italic shadow-2xl">
                          <Globe size={14} /> {String(src.web?.title || 'Research_Reference').toUpperCase()}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-[9px] font-black text-slate-800 uppercase tracking-[0.4em] px-8 italic">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • NEURAL_RELAY_v4.8
                </p>
              </div>
            </m.div>
          ))}
          {isTyping && messages[messages.length-1].content === "" && (
             <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-10">
               <div className="w-16 h-16 rounded-[1.8rem] bg-slate-950 border-2 border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-2xl">
                 <RefreshCw className="animate-spin" size={28} />
               </div>
               <div className="p-12 rounded-[4rem] bg-slate-950/40 border border-white/5 text-slate-700 text-base font-black italic tracking-widest uppercase">Initializing neural synthesis...</div>
             </m.div>
          )}
        </div>

        <div className="p-12 bg-slate-950/90 border-t border-white/5">
          <div className="relative group max-w-4xl mx-auto">
            <div className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-500 transition-colors">
              <TerminalIcon size={24} />
            </div>
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={String(t.placeholder || 'Command laboratory grid...')}
              className="w-full bg-[#050a1f] border-2 border-white/5 rounded-full pl-24 pr-28 py-9 text-base text-white focus:border-indigo-500/40 focus:bg-black outline-none transition-all italic font-black placeholder:text-slate-800 shadow-[0_30px_60px_-15px_rgba(0,0,0,1)]"
            />
            <m.button 
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="absolute right-5 top-1/2 -translate-y-1/2 p-6 bg-indigo-600 text-white rounded-full hover:bg-indigo-500 transition-all active:scale-90 disabled:opacity-30 shadow-2xl flex items-center justify-center group"
            >
              <Send size={28} className="group-hover:translate-x-1.5 group-hover:-translate-y-1.5 transition-transform" />
            </m.button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};