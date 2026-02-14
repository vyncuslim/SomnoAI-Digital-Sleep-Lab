
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, User, Loader2, Sparkles, BrainCircuit, 
  Terminal as TerminalIcon, Globe, Cpu, Zap, History,
  LayoutGrid, Activity, ChevronRight, BarChart3
} from 'lucide-react';
import { GlassCard } from './GlassCard.tsx';
import { ChatMessage, SleepRecord } from '../types.ts';
import { startContextualCoach } from '../services/geminiService.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { Language, translations } from '../services/i18n.ts';
import { Logo } from './Logo.tsx';

const m = motion as any;

const NeuralSignal = () => (
  <div className="flex gap-1.5 h-3 items-end">
    {[0, 0.4, 0.2, 0.8, 0.5].map((h, i) => (
      <m.div 
        key={i}
        animate={{ height: ['20%', '100%', '20%'] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
        className="w-0.5 bg-indigo-500/60"
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
      setMessages([{ role: 'assistant', content: String(t.intro || ''), timestamp: new Date() }]);
    }
  }, [t.intro]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
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
          if (sources.length > 0) aiSources = sources;
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
        newMsgs[newMsgs.length - 1].content = "神经链路通信中断，请检查 API 节点。";
        return newMsgs;
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] max-w-5xl mx-auto font-sans">
      <header className="flex items-center justify-between mb-8 px-6 pt-4">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-indigo-600/10 rounded-2xl border border-indigo-500/20 text-indigo-400">
            <BrainCircuit size={28} />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-black italic text-white uppercase tracking-tighter">Neuro Assistant</h1>
            <div className="flex items-center gap-3 mt-1">
               <NeuralSignal />
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Neural Pro v2.8 Active</span>
            </div>
          </div>
        </div>
        
        <div className="hidden md:flex gap-3">
           {[
             { label: 'TREND ANALYSIS', icon: BarChart3, cmd: '分析我过去一周的睡眠趋势' },
             { label: 'RHR SCAN', icon: Activity, cmd: '分析我最近的心率变化' }
           ].map((p, i) => (
             <button 
               key={i}
               onClick={() => handleSend(p.cmd)}
               className="px-6 py-3 bg-white/5 border border-white/5 rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-3 italic"
             >
               <p.icon size={12} /> {p.label}
             </button>
           ))}
        </div>
      </header>

      <GlassCard className="flex-1 flex flex-col mb-6 overflow-hidden rounded-[4rem] border-white/5 bg-slate-950/40">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
          {messages.map((msg, idx) => (
            <m.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${
                msg.role === 'assistant' 
                  ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400' 
                  : 'bg-slate-900 border-white/5 text-slate-500'
              }`}>
                {msg.role === 'assistant' ? <Logo size={24} animated={isTyping && idx === messages.length - 1} /> : <User size={24} />}
              </div>
              
              <div className={`space-y-4 max-w-[80%] ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`p-8 rounded-[2.5rem] text-sm md:text-base leading-relaxed shadow-2xl relative overflow-hidden ${
                  msg.role === 'assistant' 
                    ? 'bg-slate-900/60 border border-white/5 text-slate-300' 
                    : 'bg-indigo-600 text-white border border-indigo-500'
                }`}>
                  <div className="whitespace-pre-wrap italic font-medium">{String(msg.content || "正在进行神经元特征提取...")}</div>
                  
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap gap-2">
                      {msg.sources.map((src, sIdx) => (
                        <a 
                          key={sIdx}
                          href={String(src.web?.uri || '')} 
                          target="_blank" 
                          rel="noreferrer"
                          className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-bold text-indigo-400 flex items-center gap-2 transition-all"
                        >
                          <Globe size={11} /> {String(src.web?.title || 'Source')}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-4">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • SOMNO_TERMINAL
                </p>
              </div>
            </m.div>
          ))}
          
          {isTyping && (
            <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Logo size={24} animated={true} />
              </div>
              <div className="bg-slate-900/40 border border-white/5 px-8 py-5 rounded-full flex items-center gap-3">
                 <m.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                 <m.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                 <m.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                 <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-2 italic">Synthesizing Context...</span>
              </div>
            </m.div>
          )}
        </div>

        <div className="p-8 bg-black/20 border-t border-white/5">
          <div className="relative group">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-800">
              <TerminalIcon size={20} />
            </div>
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={String(t.placeholder || '')}
              className="w-full bg-slate-900 border border-white/10 rounded-full pl-16 pr-24 py-7 text-sm text-white focus:border-indigo-500/50 outline-none transition-all italic font-bold placeholder:text-slate-800"
            />
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-5 bg-indigo-600 text-white rounded-full hover:bg-indigo-500 transition-all active:scale-95 disabled:opacity-20 disabled:grayscale"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </GlassCard>

      <footer className="px-10 flex justify-center opacity-30 gap-12">
         <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] italic flex items-center gap-2">
           <Cpu size={12} /> Edge Processing Ingress: Active
         </p>
         <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] italic flex items-center gap-2">
           <History size={12} /> Registry Context: Linked
         </p>
      </footer>
    </div>
  );
};
