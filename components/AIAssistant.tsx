
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, User, Loader2, Sparkles, BrainCircuit, 
  Terminal as TerminalIcon, Globe, Cpu, History,
  Activity, BarChart3, ChevronRight, Zap, ShieldCheck,
  RefreshCw, Binary, Network, MapPin
} from 'lucide-react';
import { GlassCard } from './GlassCard.tsx';
import { ChatMessage, SleepRecord } from '../types.ts';
import { startContextualCoach } from '../services/geminiService.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { Language, translations } from '../services/i18n.ts';
import { Logo } from './Logo.tsx';

const m = motion as any;

const NeuralPulse = () => (
  <div className="flex gap-1 h-3 items-end">
    {[0.2, 0.5, 0.3, 0.8, 0.4, 0.6].map((h, i) => (
      <m.div 
        key={i}
        animate={{ height: ['20%', '100%', '20%'] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.12, ease: "easeInOut" }}
        className="w-0.5 bg-indigo-500/60 rounded-full"
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
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-5xl mx-auto font-sans animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex items-center justify-between mb-6 px-4">
        <div className="flex items-center gap-4 text-left">
          <div className="p-3 bg-slate-900 border border-indigo-500/20 rounded-xl text-indigo-400 relative">
            <BrainCircuit size={20} />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-[#01040a]" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-xl font-black italic text-white uppercase tracking-tighter leading-none">AI Synthesis</h1>
            <div className="flex items-center gap-3">
               <NeuralPulse />
               <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic">Core: ONLINE</span>
            </div>
          </div>
        </div>
      </header>

      <GlassCard className="flex-1 flex flex-col mb-4 overflow-hidden rounded-[2rem] border-white/5 bg-black/70 shadow-2xl" intensity={0.1}>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 md:space-y-12 scrollbar-hide">
          {messages.map((msg, idx) => (
            <m.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 md:gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 border border-white/10 shadow-xl ${
                msg.role === 'assistant' 
                  ? 'bg-slate-950 text-indigo-400' 
                  : 'bg-indigo-600 text-white'
              }`}>
                {msg.role === 'assistant' ? <Logo size={24} animated={isTyping && idx === messages.length - 1} /> : <User size={18} />}
              </div>
              
              <div className={`space-y-2 max-w-[90%] ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`p-4 md:p-6 rounded-[1.5rem] text-sm md:text-base leading-relaxed transition-all duration-500 relative overflow-hidden ${
                  msg.role === 'assistant' 
                    ? 'bg-slate-900/80 border border-white/5 text-slate-100 backdrop-blur-xl' 
                    : 'bg-indigo-600 text-white border border-indigo-400/20 shadow-xl'
                }`}>
                  <div className="whitespace-pre-wrap italic font-bold tracking-tight relative z-10">
                    {String(msg.content || (isTyping && idx === messages.length - 1 ? "Synthesizing..." : "Void..."))}
                  </div>
                  
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-2">
                      {msg.sources.map((src, sIdx) => {
                        const isMaps = !!src.maps;
                        const uri = isMaps ? src.maps.uri : src.web?.uri;
                        const title = isMaps ? src.maps.title : src.web?.title;
                        return (
                          <a key={sIdx} href={String(uri || '')} target="_blank" className={`px-3 py-1 bg-black/40 border border-white/5 rounded-full text-[8px] font-black flex items-center gap-2 transition-all italic ${isMaps ? 'text-emerald-400' : 'text-indigo-400'}`}>
                            {isMaps ? <MapPin size={10} /> : <Globe size={10} />} 
                            {String(title || 'Reference').toUpperCase()}
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
                <p className="text-[7px] font-black text-slate-800 uppercase tracking-widest italic px-4">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • RELAY_V4.8
                </p>
              </div>
            </m.div>
          ))}
        </div>

        <div className="p-4 md:p-8 bg-slate-950/95 border-t border-white/5">
          <div className="relative group max-w-3xl mx-auto">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-500">
              <TerminalIcon size={18} />
            </div>
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={String(t.placeholder || 'Command laboratory...')}
              className="w-full bg-[#050a1f] border border-white/10 rounded-full pl-14 pr-20 py-4 md:py-6 text-sm md:text-base text-white focus:border-indigo-500/50 outline-none transition-all italic font-bold"
            />
            <m.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 md:p-4 bg-indigo-600 text-white rounded-full hover:bg-indigo-500 shadow-xl flex items-center justify-center group"
            >
              <Send size={16} />
            </m.button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
