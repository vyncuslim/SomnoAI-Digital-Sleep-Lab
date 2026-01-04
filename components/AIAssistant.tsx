
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, User, Loader2, Sparkles, Binary, MessageSquareText, ShieldAlert, 
  Github, ExternalLink, ArrowDown, Search, BookOpen, FlaskConical,
  Database, Zap, Trash2, Activity, Mic, MicOff, Waves
} from 'lucide-react';
import { GlassCard } from './GlassCard.tsx';
import { ChatMessage, SleepRecord, ViewType } from '../types.ts';
import { chatWithCoach } from '../services/geminiService.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo.tsx';
import { Language, translations } from '../services/i18n.ts';

// New Futuristic CRO Avatar Component
const CROAvatar = ({ isProcessing = false, size = 36 }: { isProcessing?: boolean, size?: number }) => {
  return (
    <motion.div 
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
      animate={isProcessing ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="coreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
        </defs>

        {/* Outer Orbital Ring */}
        <motion.circle
          cx="50" cy="50" r="45"
          stroke="#4f46e5"
          strokeWidth="1"
          strokeDasharray="10 15"
          className="opacity-20"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />

        {/* Inner Data Pulse Ring */}
        <motion.circle
          cx="50" cy="50" r="38"
          stroke="#818cf8"
          strokeWidth="2"
          strokeDasharray="2 4"
          className="opacity-40"
          animate={{ rotate: -360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />

        {/* Hexagonal Core Mask/Grid */}
        <motion.path
          d="M50 25 L71.65 37.5 V62.5 L50 75 L28.35 62.5 V37.5 Z"
          fill="url(#coreGrad)"
          filter="url(#glow)"
          animate={isProcessing ? {
            opacity: [0.6, 1, 0.6],
            scale: [0.95, 1, 0.95]
          } : { opacity: 0.9 }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />

        {/* Neural Activity Sparks */}
        <AnimatePresence>
          {isProcessing && (
            <motion.circle
              cx="50" cy="50" r="5"
              fill="white"
              animate={{ 
                scale: [0, 8],
                opacity: [0.8, 0]
              }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </AnimatePresence>

        {/* The Central "Eye" of Logic */}
        <circle cx="50" cy="50" r="4" fill="white" className="opacity-80" />
      </svg>
      
      {/* Absolute positioning of scanline for extra futuristic feel */}
      <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
        <motion.div 
          className="w-full h-[1px] bg-white/40 shadow-[0_0_8px_white]"
          animate={{ top: ['0%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          style={{ position: 'absolute' }}
        />
      </div>
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
  const [detectedCmd, setDetectedCmd] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const protocols = lang === 'en' 
    ? ["Analyze my REM architecture", "Give me bio-hacks for tonight", "How is my resting heart rate?"] 
    : ["分析我的 REM 架构", "为今晚提供生物黑客技巧", "我的静息心率怎么样？"];

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: t.intro,
          timestamp: new Date()
        }
      ]);
    }
  }, [lang]);

  // 初始化语音识别
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = lang === 'zh' ? 'zh-CN' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        processVoiceInput(transcript);
      };
      recognition.onerror = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, [lang]);

  const processVoiceInput = (text: string) => {
    console.log("Voice Captured:", text);
    
    // 指令映射逻辑
    const commands = {
      sync: ['sync', 'synchronize', 'update', '同步', '更新数据', '刷新数据'],
      trends: ['trends', 'chart', 'graphs', 'history', '趋势', '图谱', '历史'],
      clear: ['clear', 'reset', 'delete', '清除', '清空', '重置']
    };

    if (commands.sync.some(cmd => text.includes(cmd))) {
      triggerCommand('SYNC', onSync);
    } else if (commands.trends.some(cmd => text.includes(cmd))) {
      triggerCommand('TRENDS', () => onNavigate?.('calendar'));
    } else if (commands.clear.some(cmd => text.includes(cmd))) {
      triggerCommand('CLEAR', handleClear);
    } else {
      // 如果不是指令，则作为普通输入处理
      handleSend(text);
    }
  };

  const triggerCommand = (type: string, callback?: () => void) => {
    setDetectedCmd(type);
    setTimeout(() => {
      setDetectedCmd(null);
      callback?.();
    }, 1500);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    scrollRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (!showScrollDown) {
      scrollToBottom();
    }
  }, [messages, isTyping]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 150;
    setShowScrollDown(!isAtBottom);
  };

  const handleClear = () => {
    setMessages([{
      role: 'assistant',
      content: t.intro,
      timestamp: new Date()
    }]);
  };

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    const trimmedInput = textToSend.trim();
    if (!trimmedInput || isTyping) return;

    const userMsg: ChatMessage = { role: 'user', content: trimmedInput, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setShowScrollDown(false);

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
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: t.error, 
        timestamp: new Date() 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] pb-6 animate-in fade-in duration-700 relative">
      <header className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600/10 border border-indigo-500/20 rounded-[1.5rem] shadow-2xl relative">
            <Logo size={32} animated />
            <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-[#020617] ${isListening ? 'bg-indigo-400 animate-ping' : 'bg-emerald-500 animate-pulse'}`}></div>
          </div>
          <div>
            <h1 className="text-xl font-black italic tracking-tight text-white">{t.title}</h1>
            <div className="flex items-center gap-2 text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">
              <Binary size={10} className="text-indigo-400" />
              {data ? <span className="text-emerald-400 flex items-center gap-1"><Activity size={8}/> BIOMETRIC LINK ACTIVE</span> : <span className="text-rose-400">OFFLINE DATA</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleClear}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all active:scale-95"
            title="Clear Session"
          >
            <Trash2 size={16} />
          </button>
          <div className="hidden md:flex flex-col items-end">
            <div className="flex items-center gap-2 px-2 py-0.5 bg-indigo-500/10 rounded-full border border-indigo-500/20">
              <Database size={10} className="text-indigo-400" />
              <span className="text-[8px] font-mono text-indigo-300 uppercase tracking-widest">{t.confidence}: 0.98</span>
            </div>
          </div>
        </div>
      </header>

      {/* 指令捕捉提示器 */}
      <AnimatePresence>
        {detectedCmd && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="absolute top-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-2 bg-indigo-600 border border-indigo-400 rounded-full shadow-[0_0_30px_rgba(79,70,229,0.5)] flex items-center gap-3"
          >
            <Zap size={14} className="text-white fill-white" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white">{t.cmdCaptured}: {detectedCmd}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        className="flex-1 overflow-y-auto space-y-8 pr-2 mb-4 scrollbar-hide relative"
        onScroll={handleScroll}
        ref={containerRef}
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 20, scale: 0.98 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[88%] flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className="shrink-0">
                  {msg.role === 'assistant' ? (
                    <CROAvatar size={36} />
                  ) : (
                    <div className="w-9 h-9 rounded-2xl bg-slate-800 border border-white/5 text-slate-400 flex items-center justify-center shadow-lg">
                      <User size={16} />
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <div className={`p-5 rounded-[1.75rem] text-[13px] leading-relaxed font-medium shadow-2xl relative ${
                    msg.role === 'assistant' 
                    ? 'bg-slate-900/60 border border-white/10 text-slate-200 rounded-tl-none' 
                    : 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-600/30'
                  }`}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    
                    {msg.role === 'assistant' && (
                      <div className="mt-4 flex items-center gap-2 opacity-20 group">
                        <div className="h-[1px] flex-1 bg-white/20"></div>
                        <span className="text-[7px] font-mono uppercase tracking-widest">CRO-RESEARCH-PROTOCOL-v5.0</span>
                      </div>
                    )}
                  </div>
                  
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="flex flex-wrap gap-2 px-1">
                      <div className="w-full flex items-center gap-2 mb-1">
                        <Search size={10} className="text-indigo-400" />
                        <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Scientific Grounding</span>
                      </div>
                      {msg.sources.map((source, sIdx) => (
                        source.web?.uri && (
                          <a 
                            key={sIdx} 
                            href={source.web.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-xl text-[9px] font-bold text-slate-400 hover:text-indigo-400 hover:border-indigo-400/30 transition-all uppercase tracking-widest group"
                          >
                            <BookOpen size={10} className="group-hover:scale-110 transition-transform" />
                            {source.web.title?.slice(0, 24) || `Source ${sIdx + 1}`}...
                            <ExternalLink size={8} className="opacity-40" />
                          </a>
                        )
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="flex gap-4 max-w-[85%]">
              <CROAvatar size={36} isProcessing={true} />
              <div className="p-5 rounded-[1.75rem] bg-slate-900/40 border border-white/5 text-slate-400 text-[13px] flex items-center gap-3 rounded-tl-none italic">
                <span className="animate-pulse">{t.typing}</span>
                <div className="flex gap-1.5">
                  <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                  <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }} className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                  <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.6 }} className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={scrollRef} className="h-4" />
      </div>

      <AnimatePresence>
        {showScrollDown && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={() => scrollToBottom()}
            className="absolute bottom-28 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-full shadow-2xl text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all z-20 group"
          >
            New Signals
            <ArrowDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {/* 指令提示词 */}
        <div className="flex flex-wrap gap-2 px-1">
          <AnimatePresence mode="wait">
            {isListening ? (
              <motion.div 
                key="listening"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 border border-indigo-500/30 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest text-indigo-400"
              >
                <Waves size={14} className="animate-pulse" />
                {t.micActive}
              </motion.div>
            ) : (
              protocols.map((proto, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => handleSend(proto)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-indigo-500/30 transition-all hover:bg-indigo-500/10 active:scale-95"
                >
                  <FlaskConical size={12} className="text-indigo-400" />
                  {proto}
                </motion.button>
              ))
            )}
          </AnimatePresence>
        </div>

        <div className="relative">
          <GlassCard className={`p-2 pr-4 flex items-center gap-2 border-indigo-500/30 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] transition-all ${isListening ? 'ring-2 ring-indigo-500/50 scale-[1.01]' : ''}`}>
            <button 
              onClick={toggleListening}
              className={`flex items-center justify-center p-2.5 rounded-2xl transition-all relative overflow-hidden group/mic ${isListening ? 'bg-indigo-600 text-white shadow-lg' : 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20'}`}
            >
              {isListening ? <Mic size={18} className="relative z-10" /> : <MicOff size={18} className="relative z-10 opacity-60" />}
              {isListening && (
                <motion.div 
                  layoutId="pulse"
                  className="absolute inset-0 bg-indigo-400/30"
                  animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              )}
            </button>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t.placeholder}
              className="flex-1 bg-transparent border-none outline-none px-2 py-3 text-sm text-slate-200 placeholder:text-slate-600 font-medium"
            />
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className={`p-3 rounded-2xl transition-all ${!input.trim() || isTyping ? 'bg-slate-800 text-slate-600' : 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:scale-105 active:scale-95'}`}
            >
              <Send size={18} />
            </button>
          </GlassCard>
          <div className="absolute -bottom-6 left-6 flex items-center gap-2 opacity-30">
             <ShieldAlert size={10} className="text-indigo-400" />
             <span className="text-[8px] font-black uppercase tracking-widest">{t.sandbox}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
