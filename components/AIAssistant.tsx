
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, User, Loader2, Sparkles, Binary, MessageSquareText, ShieldAlert, 
  Github, ExternalLink, ArrowDown, Search, BookOpen, FlaskConical,
  Database, Zap, Trash2, Activity, Mic, MicOff, Waves, Cpu, Lock, Key,
  ClipboardList, Beaker
} from 'lucide-react';
import { GlassCard } from './GlassCard.tsx';
import { ChatMessage, SleepRecord, ViewType } from '../types.ts';
import { chatWithCoach, designExperiment, SleepExperiment } from '../services/geminiService.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo.tsx';
import { Language, translations } from '../services/i18n.ts';

// Fix: Use any cast to bypass broken library types for motion props
const m = motion as any;

const CROAvatar = ({ isProcessing = false, size = 40 }: { isProcessing?: boolean, size?: number }) => {
  return (
    <m.div 
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label="AI Assistant Avatar"
    >
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <filter id="avatarGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <m.circle
          cx="50" cy="50" r="45"
          stroke="rgba(129, 140, 248, 0.3)"
          strokeWidth="1"
          strokeDasharray="5 5"
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        <m.path
          d="M50 20 L80 35 V65 L50 80 L20 65 V35 Z"
          fill="rgba(79, 70, 229, 0.2)"
          stroke="#818cf8"
          strokeWidth="2"
          filter="url(#avatarGlow)"
          animate={isProcessing ? {
            opacity: [0.5, 1, 0.5],
            scale: [0.95, 1, 0.95]
          } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <circle cx="50" cy="50" r="4" fill="white" className="opacity-80" />
      </svg>
    </m.div>
  );
};

interface AIAssistantProps {
  lang: Language;
  data: SleepRecord | null;
  onNavigate?: (view: ViewType) => void;
  onSync?: () => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ lang, data, onNavigate, onSync }) => {
  const t = translations[lang].assistant;
  const [messages, setMessages] = useState<(ChatMessage & { sources?: any[] })[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [isDesigning, setIsDesigning] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkKey = async () => {
      try {
        if ((window as any).aistudio) {
          const selected = await (window as any).aistudio.hasSelectedApiKey();
          setHasKey(selected);
        } else {
          setHasKey(!!process.env.API_KEY);
        }
      } catch (e) {
        setHasKey(false);
      }
    };
    checkKey();
  }, []);

  useEffect(() => {
    if (messages.length === 0 && hasKey) {
      setMessages([{
        role: 'assistant',
        content: t.intro,
        timestamp: new Date()
      }]);
    }
  }, [lang, hasKey]);

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleActivateEngine = async () => {
    if ((window as any).aistudio) {
      try {
        await (window as any).aistudio.openSelectKey();
        setHasKey(true);
      } catch (e) {
        console.error("Activation failed", e);
      }
    }
  };

  const handleDesignExperiment = async () => {
    if (!data || isDesigning || !hasKey) return;
    setIsDesigning(true);
    setIsTyping(true);
    try {
      const exp = await designExperiment(data, lang);
      const content = lang === 'zh' 
        ? `🧪 **新实验协议已生成**\n\n**假设**: ${exp.hypothesis}\n\n**操作步骤**:\n${exp.protocol.map((p, i) => `${i+1}. ${p}`).join('\n')}\n\n**预期影响**: ${exp.expectedImpact}`
        : `🧪 **New Experiment Protocol Generated**\n\n**Hypothesis**: ${exp.hypothesis}\n\n**Protocol**:\n${exp.protocol.map((p, i) => `${i+1}. ${p}`).join('\n')}\n\n**Expected Impact**: ${exp.expectedImpact}`;
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content,
        timestamp: new Date()
      }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDesigning(false);
      setIsTyping(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping || !hasKey) return;

    const userMsg: ChatMessage = { role: 'user', content: input.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const historyForAi = messages.concat(userMsg).map(m => ({
        role: m.role,
        content: m.content
      }));
      const response = await chatWithCoach(historyForAi, lang, data);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.text, 
        sources: response.sources,
        timestamp: new Date() 
      }]);
    } catch (err: any) {
      if (err.message?.includes("entity was not found") || err.message?.includes("404")) {
        setHasKey(false);
      }
      setMessages(prev => [...prev, { role: 'assistant', content: t.error, timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (hasKey === false) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center p-6 space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="relative">
          <div className="p-10 bg-indigo-500/10 rounded-[3rem] border border-indigo-500/20 shadow-2xl">
            <Lock size={64} className="text-indigo-400" />
          </div>
          <m.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full -z-10"
          />
        </div>
        <div className="space-y-4 max-w-sm">
          <h2 className="text-2xl font-black italic tracking-tight text-white">{lang === 'zh' ? '神经引擎未激活' : 'Neural Engine Inactive'}</h2>
          <p className="text-slate-400 text-xs leading-relaxed font-medium">
            {lang === 'zh' 
              ? 'AI 深度洞察需要连接到 Google AI Studio 提供支持。请选择您的付费 API Key 以启动实验分析。' 
              : 'Deep insights require a Google AI Studio connection. Select your paid API Key to initialize analysis.'}
          </p>
        </div>
        <button 
          onClick={handleActivateEngine}
          className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-indigo-500 active:scale-95 transition-all flex items-center gap-3"
        >
          <Key size={18} />
          {lang === 'zh' ? '激活 AI 引擎' : 'Activate AI Engine'}
        </button>
      </div>
    );
  }

  if (hasKey === null) return (
    <div className="flex items-center justify-center h-[70vh]">
      <Loader2 size={32} className="animate-spin text-indigo-500/40" />
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] pb-4">
      <header className="flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
            <Cpu size={24} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-black italic tracking-tight text-white">{t.title}</h1>
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">Neural Research Interface</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleDesignExperiment}
            disabled={!data || isDesigning}
            title={lang === 'zh' ? '设计实验协议' : 'Design Protocol'}
            className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition-all disabled:opacity-30"
          >
            <Beaker size={18} className={isDesigning ? 'animate-pulse' : ''} />
          </button>
          <button 
            onClick={() => setMessages([{ role: 'assistant', content: t.intro, timestamp: new Date() }])}
            aria-label="Clear chat history"
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-rose-400 transition-all"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-6 scrollbar-hide">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <m.div 
              key={idx} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[90%] flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className="pt-1">
                  {msg.role === 'assistant' ? <CROAvatar size={32} /> : <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center border border-white/5 text-slate-400"><User size={14}/></div>}
                </div>
                <div className="space-y-2">
                  <div className={`p-4 rounded-2xl text-[13px] leading-relaxed relative ${
                    msg.role === 'assistant' 
                    ? 'bg-slate-900/60 border border-white/10 text-slate-200' 
                    : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  }`}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-2">
                        {msg.sources.map((source: any, sIdx: number) => {
                          if (source.web && source.web.uri) {
                            return (
                              <a 
                                key={sIdx}
                                href={source.web.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors border border-white/5"
                              >
                                <ExternalLink size={10} />
                                {source.web.title || (lang === 'zh' ? '查看来源' : 'Source')}
                              </a>
                            );
                          }
                          return null;
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </m.div>
          ))}
        </AnimatePresence>
        {isTyping && (
          <div className="flex justify-start gap-4">
            <CROAvatar size={32} isProcessing={true} />
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/5 flex items-center gap-2">
               <m.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
               <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Decoding Stream</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="relative pt-2">
        <GlassCard className="p-1.5 pr-3 flex items-center gap-2 border-indigo-500/30">
          <input 
            type="text" 
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t.placeholder}
            aria-label="Chat message input"
            className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 font-medium"
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            aria-label="Send message"
            className={`p-3 rounded-2xl transition-all ${!input.trim() || isTyping ? 'bg-slate-800 text-slate-500' : 'bg-indigo-600 text-white shadow-lg active:scale-95'}`}
          >
            <Send size={18} />
          </button>
        </GlassCard>
      </div>
    </div>
  );
};
