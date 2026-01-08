
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, User, Loader2, BrainCircuit, ExternalLink, Cpu, Trash2, Key, Beaker, Lock, Settings as SettingsIcon
} from 'lucide-react';
import { GlassCard } from './GlassCard.tsx';
import { ChatMessage, SleepRecord } from '../types.ts';
import { chatWithCoach, designExperiment } from '../services/geminiService.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { Language, translations } from '../services/i18n.ts';

const m = motion as any;

const CROAvatar = ({ isProcessing = false, size = 32 }: { isProcessing?: boolean, size?: number }) => (
  <m.div 
    className="relative flex items-center justify-center shrink-0"
    style={{ width: size, height: size }}
  >
    <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
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
        animate={isProcessing ? { opacity: [0.5, 1, 0.5], scale: [0.95, 1, 0.95] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <circle cx="50" cy="50" r="4" fill="white" className="opacity-80" />
    </svg>
  </m.div>
);

interface AIAssistantProps {
  lang: Language;
  data: SleepRecord | null;
  onNavigate?: (view: any) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ lang, data, onNavigate }) => {
  const t = translations[lang].assistant;
  const [messages, setMessages] = useState<(ChatMessage & { sources?: any[] })[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [isDesigning, setIsDesigning] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const checkKey = async () => {
    const manualKey = localStorage.getItem('somno_manual_gemini_key');
    if ((window as any).aistudio) {
      const selected = await (window as any).aistudio.hasSelectedApiKey();
      setHasKey(selected || !!process.env.API_KEY || !!manualKey);
    } else {
      setHasKey(!!process.env.API_KEY || !!manualKey);
    }
  };

  useEffect(() => {
    checkKey();
    // 监听 Storage 变化，以便从设置页面回来后自动更新状态
    const handleStorage = () => checkKey();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    if (messages.length === 0 && hasKey === true) {
      setMessages([{ role: 'assistant', content: t.intro, timestamp: new Date() }]);
    }
  }, [hasKey]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping || !hasKey) return;

    const userMsg: ChatMessage = { role: 'user', content: input.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const historyForAi = messages.concat(userMsg).map(m => ({ role: m.role, content: m.content }));
      const response = await chatWithCoach(historyForAi, lang, data);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.text, 
        sources: response.sources,
        timestamp: new Date() 
      }]);
    } catch (err: any) {
      if (err.message?.includes("404") || err.message?.includes("not found")) {
        setHasKey(false);
      }
      setMessages(prev => [...prev, { role: 'assistant', content: t.error, timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleActivate = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      try {
        await aistudio.openSelectKey();
        setHasKey(true);
      } catch (e) {
        console.error("Failed to open key selector:", e);
      }
    } else {
      // 非 AI Studio 环境下，直接引导至设置页
      if (onNavigate) {
        onNavigate('profile');
      } else {
        alert("Please go to Settings (CFG) to configure your AI Engine API Key.");
      }
    }
  };

  const handleDesign = async () => {
    if (!data || isDesigning || !hasKey) return;
    setIsDesigning(true);
    setIsTyping(true);
    try {
      const exp = await designExperiment(data, lang);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `🧪 **Protocol Generated**\n\n**Hypothesis**: ${exp.hypothesis}\n\n**Impact**: ${exp.expectedImpact}`,
        timestamp: new Date()
      }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDesigning(false);
      setIsTyping(false);
    }
  };

  if (hasKey === false) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center p-6 space-y-8">
        <div className="w-24 h-24 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-2xl relative">
          <Lock size={40} className="text-indigo-400" />
          <m.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-indigo-500/10 rounded-full"
          />
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">Neural Core Offline</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-10 leading-relaxed">
            { (window as any).aistudio ? 
              "Select an API Key to enable laboratory insights." : 
              "Manual configuration required. Please enter your API Key in the System Settings."}
          </p>
        </div>
        
        <button 
          onClick={handleActivate}
          className="px-10 py-5 bg-indigo-600 text-white rounded-full font-black uppercase text-[10px] tracking-widest shadow-2xl active:scale-95 transition-all hover:bg-indigo-500 flex items-center gap-3"
        >
          { (window as any).aistudio ? <Cpu size={14} /> : <SettingsIcon size={14} /> }
          { (window as any).aistudio ? "Initialize AI Engine" : "Go to Settings" }
        </button>
      </div>
    );
  }

  if (hasKey === null) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] max-w-2xl mx-auto">
      <header className="flex items-center justify-between mb-8 px-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Cpu size={20} />
          </div>
          <h1 className="text-lg font-black italic text-white uppercase">{t.title}</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={handleDesign} disabled={!data || isDesigning} className="p-3 bg-white/5 rounded-full text-indigo-400 hover:bg-white/10 transition-all">
            <Beaker size={18} />
          </button>
          <button onClick={() => setMessages([])} className="p-3 bg-white/5 rounded-full text-slate-500 hover:text-rose-400 transition-all">
            <Trash2 size={18} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto space-y-6 px-4 mb-6 scrollbar-hide">
        {messages.map((msg, idx) => (
          <m.div key={idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className="mt-1">
                {msg.role === 'assistant' ? <CROAvatar /> : <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-500"><User size={14}/></div>}
              </div>
              <div className="space-y-3">
                <div className={`p-6 rounded-[2.5rem] text-sm leading-relaxed ${msg.role === 'assistant' ? 'bg-slate-950/60 border border-white/5 text-slate-300' : 'bg-indigo-600 text-white shadow-xl'}`}>
                  <div className="whitespace-pre-wrap italic">{msg.content}</div>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-2">
                      {msg.sources.map((s, i) => s.web?.uri && (
                        <a key={i} href={s.web.uri} target="_blank" className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full text-[9px] text-indigo-400 border border-white/5 hover:bg-white/10">
                          <ExternalLink size={10} /> {s.web.title || 'Source'}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </m.div>
        ))}
        {isTyping && (
          <div className="flex justify-start gap-3">
            <CROAvatar isProcessing={true} />
            <div className="px-6 py-4 rounded-full bg-slate-900/40 border border-white/5 flex items-center gap-3">
              <m.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
              <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Processing</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="px-4 pb-4">
        <GlassCard className="p-2 rounded-full border-white/10 flex items-center gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t.placeholder}
            className="flex-1 bg-transparent outline-none px-6 py-3 text-sm text-slate-200 placeholder:text-slate-600 font-medium italic"
          />
          <button onClick={handleSend} disabled={!input.trim() || isTyping} className="w-12 h-12 flex items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg active:scale-90 transition-all">
            <Send size={18} />
          </button>
        </GlassCard>
      </div>
    </div>
  );
};
