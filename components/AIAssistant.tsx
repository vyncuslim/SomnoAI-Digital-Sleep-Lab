
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, User, Loader2, BrainCircuit, ExternalLink, Cpu, Trash2, Key, Beaker, Lock, Settings as SettingsIcon, CreditCard, Music, Play, Square
} from 'lucide-react';
import { GlassCard } from './GlassCard.tsx';
import { ChatMessage, SleepRecord } from '../types.ts';
import { chatWithCoach, designExperiment, generateNeuralLullaby, decodeBase64Audio, decodeAudioData } from '../services/geminiService.ts';
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
  isSandbox?: boolean;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ lang, data, onNavigate, isSandbox = false }) => {
  const t = translations[lang].assistant;
  const isZh = lang === 'zh';
  const [messages, setMessages] = useState<(ChatMessage & { sources?: any[] })[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [isDesigning, setIsDesigning] = useState(false);
  
  // Audio state
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  const checkKey = async () => {
    if (isSandbox) {
      setHasKey(true);
      return;
    }
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
    const handleStorage = () => checkKey();
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      stopAudio();
    };
  }, [isSandbox]);

  useEffect(() => {
    if (messages.length === 0 && hasKey === true) {
      const initialMessage = isSandbox 
        ? (isZh ? "【沙盒模式】神经网络模拟已激活。由于未检测到物理秘钥，我将使用本地推理核心进行回复。" : "[Sandbox Mode] Neural simulation active. Local core reasoning will be used as no physical key detected.")
        : t.intro;
      setMessages([{ role: 'assistant', content: initialMessage, timestamp: new Date() }]);
    }
  }, [hasKey, t.intro, isSandbox]);

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
      const manualKey = localStorage.getItem('somno_manual_gemini_key');
      const apiKeyExists = !!process.env.API_KEY || !!manualKey;

      if (isSandbox && !apiKeyExists) {
        setTimeout(() => {
          const mockResponse = isZh 
            ? `[模拟回复] 我已接收到关于“${userMsg.content}”的查询流。在沙盒模式下，我的神经元会模拟真实反馈。您的睡眠评分显示出良好的生理恢复迹象。`
            : `[Simulated] Received query stream regarding "${userMsg.content}". In sandbox mode, neural feedback is simulated. Your sleep metrics show positive signs of recovery.`;
          setMessages(prev => [...prev, { role: 'assistant', content: mockResponse, timestamp: new Date() }]);
          setIsTyping(false);
        }, 1500);
        return;
      }

      const historyForAi = messages.concat(userMsg).map(m => ({ role: m.role, content: m.content }));
      const response = await chatWithCoach(historyForAi, lang, data);
      if (response) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: response.text, 
          sources: response.sources,
          timestamp: new Date() 
        }]);
      }
    } catch (err: any) {
      if (err.message === "KEY_INVALID_OR_NOT_FOUND") {
        setHasKey(false);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: isZh ? "API 密钥已过期或项目未激活。请重新初始化引擎。" : "API Key expired or project inactive. Please re-initialize engine.", 
          timestamp: new Date() 
        }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: t.error, timestamp: new Date() }]);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleLullaby = async () => {
    if (!data || isGeneratingAudio) return;
    
    if (isPlayingAudio) {
      stopAudio();
      return;
    }
    
    setIsGeneratingAudio(true);
    try {
      const base64 = await generateNeuralLullaby(data, lang);
      if (base64) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const ctx = audioContextRef.current;
        const decoded = decodeBase64Audio(base64);
        const buffer = await decodeAudioData(decoded, ctx);
        
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.onended = () => setIsPlayingAudio(false);
        
        audioSourceRef.current = source;
        
        // Handle potential play/pause interruption issues
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }
        
        source.start();
        setIsPlayingAudio(true);
      }
    } catch (err) {
      console.error("Audio Synthesis Error:", err);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const stopAudio = () => {
    if (audioSourceRef.current) {
      try { 
        audioSourceRef.current.stop(); 
        audioSourceRef.current.disconnect();
      } catch(e) {
        console.debug("Audio stop bypassed (already finished).");
      }
      audioSourceRef.current = null;
    }
    setIsPlayingAudio(false);
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
    } else if (onNavigate) {
      onNavigate('profile');
    }
  };

  const handleDesign = async () => {
    if (!data || isDesigning) return;
    setIsDesigning(true);
    try {
      const experiment = await designExperiment(data, lang);
      const content = lang === 'zh' 
        ? `为你生成了新的睡眠实验方案：\n\n**假设**: ${experiment.hypothesis}\n\n**实验步骤**:\n${experiment.protocol.map((p, i) => `${i+1}. ${p}`).join('\n')}\n\n**预期效果**: ${experiment.expectedImpact}`
        : `Generated a new sleep experiment for you:\n\n**Hypothesis**: ${experiment.hypothesis}\n\n**Protocol**:\n${experiment.protocol.map((p, i) => `${i+1}. ${p}`).join('\n')}\n\n**Expected Impact**: ${experiment.expectedImpact}`;
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content, 
        timestamp: new Date() 
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: isZh ? "实验设计失败，请检查神经网络连接。" : "Experiment design failed. Check neural link.", 
        timestamp: new Date() 
      }]);
    } finally {
      setIsDesigning(false);
    }
  };

  if (hasKey === false) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center p-6 space-y-10">
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
              (isZh ? "请选择付费 GCP 项目的 API Key 以启用实验室深度分析。" : "Select an API Key from a paid GCP project to enable deep lab insights.") : 
              (isZh ? "请在系统设置中手动配置您的 API Key。" : "Manual configuration required in System Settings.")}
          </p>
          
          <div className="pt-2">
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-colors"
            >
              <CreditCard size={12} />
              {isZh ? "查看计费说明文档" : "View Billing Documentation"}
              <ExternalLink size={10} />
            </a>
          </div>
        </div>
        
        <button 
          onClick={handleActivate}
          className="px-10 py-5 bg-indigo-600 text-white rounded-full font-black uppercase text-[10px] tracking-widest shadow-2xl active:scale-95 transition-all hover:bg-indigo-500 flex items-center gap-3"
        >
          { (window as any).aistudio ? <Cpu size={14} /> : <SettingsIcon size={14} /> }
          { (window as any).aistudio ? (isZh ? "初始化神经内核" : "Initialize Neural Core") : (isZh ? "前往设置" : "Go to Settings") }
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
          <div>
            <h1 className="text-lg font-black italic text-white uppercase leading-none">{t.title}</h1>
            {isSandbox && <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Sandbox Environment</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleLullaby} 
            disabled={!data || isGeneratingAudio} 
            className={`p-3 rounded-full transition-all ${isPlayingAudio ? 'bg-indigo-600 text-white animate-pulse' : 'bg-white/5 text-indigo-400 hover:bg-white/10'}`}
          >
            {isGeneratingAudio ? <Loader2 size={18} className="animate-spin" /> : isPlayingAudio ? <Square size={18} /> : <Music size={18} />}
          </button>
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
                        <a key={i} href={s.web.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full text-[9px] text-indigo-400 border border-white/5 hover:bg-white/10">
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
