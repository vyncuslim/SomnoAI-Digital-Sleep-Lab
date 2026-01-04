
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, User, Loader2, Sparkles, Binary, MessageSquareText, ShieldAlert, 
  Github, ExternalLink, ArrowDown, Search, BookOpen, FlaskConical,
  Database, Zap, Trash2, Activity, Mic, MicOff, Waves, Cpu
} from 'lucide-react';
import { GlassCard } from './GlassCard.tsx';
import { ChatMessage, SleepRecord, ViewType } from '../types.ts';
import { chatWithCoach } from '../services/geminiService.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo.tsx';
import { Language, translations } from '../services/i18n.ts';

const CROAvatar = ({ isProcessing = false, size = 40 }: { isProcessing?: boolean, size?: number }) => {
  return (
    <motion.div 
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <filter id="avatarGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <motion.circle
          cx="50" cy="50" r="45"
          stroke="rgba(129, 140, 248, 0.3)"
          strokeWidth="1"
          strokeDasharray="5 5"
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        <motion.path
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
      {isProcessing && (
        <motion.div 
          className="absolute inset-0 border-2 border-indigo-400 rounded-full"
          animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </motion.div>
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
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: t.intro,
        timestamp: new Date()
      }]);
    }
  }, [lang]);

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!showScrollDown) scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isTyping) return;

    const userMsg: ChatMessage = { role: 'user', content: textToSend.trim(), timestamp: new Date() };
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
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: t.error, timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] pb-4 animate-in fade-in duration-700">
      <header className="flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
            <Cpu size={24} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-black italic tracking-tight text-white">{t.title}</h1>
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">Neural Research Interface</p>
          </div>
        </div>
        <button 
          onClick={() => setMessages([{ role: 'assistant', content: t.intro, timestamp: new Date() }])}
          className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-500 hover:text-rose-400 transition-all"
        >
          <Trash2 size={16} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-6 scrollbar-hide" ref={containerRef}>
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[90%] flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className="pt-1">
                  {msg.role === 'assistant' ? <CROAvatar size={32} /> : <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center border border-white/5 text-slate-500"><User size={14}/></div>}
                </div>
                <div className="space-y-2">
                  <div className={`p-4 rounded-2xl text-[13px] leading-relaxed relative ${
                    msg.role === 'assistant' 
                    ? 'bg-slate-900/60 border border-white/10 text-slate-200' 
                    : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  }`}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    {msg.role === 'assistant' && (
                      <div className="mt-3 pt-2 border-t border-white/5 flex justify-between items-center opacity-30">
                        <span className="text-[7px] font-mono uppercase tracking-widest">Protocol: CRO-v5.0</span>
                        <span className="text-[7px] font-mono">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    )}
                  </div>
                  
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="flex flex-wrap gap-2 px-1">
                      {msg.sources.map((source, sIdx) => source.web?.uri && (
                        <a key={sIdx} href={source.web.uri} target="_blank" className="inline-flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-[8px] font-bold text-slate-400 hover:text-indigo-400 transition-all uppercase tracking-widest">
                          <BookOpen size={10} /> {source.web.title?.slice(0, 20)}...
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isTyping && (
          <div className="flex justify-start gap-4">
            <CROAvatar size={32} isProcessing={true} />
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/5 flex items-center gap-2">
               <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
               <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Decoding Stream</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="relative pt-2">
        <GlassCard className="p-1.5 pr-3 flex items-center gap-2 border-indigo-500/30">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t.placeholder}
            className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 font-medium"
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className={`p-3 rounded-2xl transition-all ${!input.trim() || isTyping ? 'bg-slate-800 text-slate-600' : 'bg-indigo-600 text-white shadow-lg active:scale-95'}`}
          >
            <Send size={18} />
          </button>
        </GlassCard>
        <div className="absolute -bottom-6 left-4 flex items-center gap-2 opacity-20">
           <ShieldAlert size={10} className="text-indigo-400" />
           <span className="text-[8px] font-black uppercase tracking-[0.2em]">End-to-End Neural Processing</span>
        </div>
      </div>
    </div>
  );
};
