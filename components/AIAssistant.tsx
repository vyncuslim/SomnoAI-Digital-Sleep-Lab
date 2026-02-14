import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, User, Loader2, Sparkles, BrainCircuit, 
  Terminal as TerminalIcon, Globe, Cpu, History,
  Activity, BarChart3, ChevronRight, Zap
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
    {[0.2, 0.5, 0.3, 0.8, 0.4].map((h, i) => (
      <m.div 
        key={i}
        animate={{ height: ['25%', '100%', '25%'] }}
        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}
        className="w-1 bg-indigo-400 rounded-full"
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
        newMsgs[newMsgs.length - 1].content = "神经链路通信中断。请检查网络状态或稍后再试。";
        return newMsgs;
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] max-w-5xl mx-auto font-sans animate-in fade-in slide-in-from-bottom-6 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 px-6 gap-6">
        <div className="flex items-center gap-6 text-left">
          <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 text-indigo-600">
            <BrainCircuit size={28} />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black italic text-slate-900 uppercase tracking-tight">Neuro Assistant</h1>
            <div className="flex items-center gap-4">
               <NeuralPulse />
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Core Engine Active</span>
            </div>
          </div>
        </div>
      </header>

      <GlassCard className="flex-1 flex flex-col mb-6 overflow-hidden rounded-[3rem] border-slate-100 bg-white/80 shadow-sm" intensity={0.3}>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
          {messages.map((msg, idx) => (
            <m.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm ${
                msg.role === 'assistant' 
                  ? 'bg-white border-slate-100 text-indigo-600' 
                  : 'bg-indigo-600 border-indigo-500 text-white'
              }`}>
                {msg.role === 'assistant' ? <Logo size={28} animated={isTyping && idx === messages.length - 1} /> : <User size={24} />}
              </div>
              
              <div className={`space-y-2 max-w-[80%] ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`p-8 rounded-[2.5rem] text-base leading-relaxed shadow-sm transition-all duration-500 ${
                  msg.role === 'assistant' 
                    ? 'bg-slate-50 border border-slate-100 text-slate-700' 
                    : 'bg-indigo-600 text-white border border-indigo-500'
                }`}>
                  <div className="whitespace-pre-wrap italic font-medium">{String(msg.content || "正在思考回复...")}</div>
                  
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-slate-200 flex flex-wrap gap-2">
                      {msg.sources.map((src, sIdx) => (
                        <a key={sIdx} href={String(src.web?.uri || '')} target="_blank" className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-full text-[10px] font-bold text-indigo-600 flex items-center gap-2 transition-all">
                          <Globe size={12} /> {String(src.web?.title || 'Ref').toUpperCase()}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </m.div>
          ))}
        </div>

        {/* 输入区 */}
        <div className="p-8 bg-white border-t border-slate-100">
          <div className="relative group max-w-4xl mx-auto">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300">
              <TerminalIcon size={20} />
            </div>
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={String(t.placeholder || '询问您的睡眠架构...')}
              className="w-full bg-slate-50 border border-slate-100 rounded-full pl-16 pr-20 py-6 text-sm text-slate-900 focus:border-indigo-400 focus:bg-white outline-none transition-all italic font-bold placeholder:text-slate-300 shadow-inner"
            />
            <m.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-4 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-30 shadow-md"
            >
              <Send size={20} />
            </m.button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};