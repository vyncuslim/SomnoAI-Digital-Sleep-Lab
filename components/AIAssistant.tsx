import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, User, Loader2, Trash2, Moon, ExternalLink, Cpu, LayoutGrid, Zap, Globe, Sparkles, ShieldCheck, Terminal as TerminalIcon
} from 'lucide-react';
import { GlassCard } from './GlassCard.tsx';
import { ChatMessage, SleepRecord } from '../types.ts';
import { chatWithCoach } from '../services/geminiService.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { Language, translations } from '../services/i18n.ts';
import { Logo } from './Logo.tsx';

const m = motion as any;

const CROAvatar = ({ isProcessing = false, size = 32 }: { isProcessing?: boolean, size?: number }) => (
  <m.div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
    <div className="absolute inset-0 bg-slate-900 rounded-2xl border border-white/5 shadow-inner" />
    <Logo size={size * 0.7} animated={isProcessing} threeD={true} />
    {isProcessing && (
       <m.div 
         animate={{ scale: [1, 1.4, 1], opacity: [0, 0.2, 0] }}
         transition={{ duration: 2, repeat: Infinity }}
         className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl"
       />
    )}
  </m.div>
);

interface AIAssistantProps {
  lang: Language;
  data: SleepRecord | null;
  onNavigate?: (view: any) => void;
  isSandbox?: boolean;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ lang, data }) => {
  const t = translations[lang].assistant;
  const [messages, setMessages] = useState<(ChatMessage & { sources?: any[] })[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiSource, setAiSource] = useState<'native' | 'sandbox'>('native');
  
  useEffect(() => {
    if (messages.length === 0) {
      const welcome = data 
        ? `${t.intro}\n\nI see your current sleep score is ${data.score}/100.`
        : t.intro;
      setMessages([{ role: 'assistant', content: welcome, timestamp: new Date() }]);
    }
  }, [data, t.intro]);

  const handleSend = async () => {
    const textToSend = input.trim();
    if (!textToSend || isTyping) return;
    
    const userMsg: ChatMessage = { role: 'user', content: textToSend, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    
    try {
      const response = await chatWithCoach(messages.concat(userMsg).map(m => ({ role: m.role, content: m.content })), lang, data);
      if (response) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: response.text || "Handshake Timeout", 
          sources: response.sources, 
          timestamp: new Date() 
        }]);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Neural Bridge unavailable. Switching to external sandbox protocol might assist.", timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] max-w-4xl mx-auto font-sans relative">
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 px-4 pt-10">
        <div className="flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center shadow-inner relative">
            <Logo size={24} animated={true} />
            <div className="absolute -top-1 -right-1">
               <Moon size={12} className="text-indigo-400 fill-indigo-400/20" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-black italic text-white uppercase leading-none">{t.title}</h1>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1 italic">
              Access Node: {aiSource === 'native' ? 'Neural Core V2.5' : 'External Sandbox'}
            </p>
          </div>
        </div>

        <div className="flex bg-slate-950/80 p-1.5 rounded-full border border-white/5 shadow-xl">
           <button onClick={() => setAiSource('native')} className={`px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${aiSource === 'native' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}>
             <Zap size={10} fill={aiSource === 'native' ? "currentColor" : "none"} /> Neural Core
           </button>
           <button onClick={() => setAiSource('sandbox')} className={`px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${aiSource === 'sandbox' ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' : 'text-slate-500 hover:text-slate-300'}`}>
             <Globe size={10} /> Sandbox Node
           </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden px-2 mb-4">
        <AnimatePresence mode="wait">
          {aiSource === 'native' ? (
            <m.div key="native" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-6 px-4 mb-6 scrollbar-hide">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className="mt-1">{msg.role === 'assistant' ? <CROAvatar /> : <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-500"><User size={14}/></div>}</div>
                        <div className={`p-5 rounded-[2rem] text-sm leading-relaxed shadow-xl text-left relative overflow-hidden ${msg.role === 'assistant' ? 'bg-slate-900/60 border border-white/5 text-slate-300' : 'bg-indigo-600 text-white'}`}>
                          <div className="whitespace-pre-wrap italic">{msg.content}</div>
                          {msg.sources && msg.sources.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-2">
                              {msg.sources.map((chunk, sIdx) => (
                                <a key={sIdx} href={chunk.web?.uri || chunk.maps?.uri} target="_blank" className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[9px] font-bold text-indigo-300 flex items-center gap-1.5 transition-all hover:bg-indigo-500/20"><ExternalLink size={10} /> {chunk.web?.title || "Signal Source"}</a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start gap-3">
                    <CROAvatar isProcessing={true} />
                    <div className="px-6 py-4 rounded-full bg-slate-900/40 border border-white/5 flex items-center gap-3">
                      <m.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                      <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest italic">Synthesizing...</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="px-4">
                <GlassCard className="p-1.5 rounded-full border-white/10 flex items-center gap-2">
                  <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder={t.placeholder} className="flex-1 bg-transparent outline-none px-6 py-3 text-sm text-slate-200 placeholder:text-slate-700 font-medium italic" />
                  <button onClick={handleSend} disabled={!input.trim() || isTyping} className="w-12 h-12 flex items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg active:scale-90 transition-all hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600">
                    <Send size={18} />
                  </button>
                </GlassCard>
              </div>
            </m.div>
          ) : (
            <m.div key="sandbox" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="h-full flex flex-col bg-black/40 rounded-[3rem] border border-white/5 relative overflow-hidden">
               <div className="p-4 bg-slate-900/40 border-b border-white/5 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500"><Globe size={14} /></div>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Hugging Face Sandbox Protocol</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                    <ShieldCheck size={10} className="text-emerald-400" />
                    <span className="text-[8px] font-black text-emerald-400 uppercase">Secure Hub</span>
                  </div>
               </div>
               <div className="flex-1 relative z-10">
                 <iframe 
                   src="https://hf.space/embed/nomic-ai/gpt4all-j"
                   className="w-full h-full border-none rounded-b-[3rem] grayscale invert hue-rotate-180 opacity-90 contrast-125"
                   title="Sandbox AI Interface"
                 />
               </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-center pb-6 opacity-30">
        <p className="text-[8px] font-mono uppercase tracking-[0.5em] text-slate-500 italic flex items-center gap-4">
          <TerminalIcon size={10} /> {aiSource === 'native' ? 'NEURAL_LINK_ENCRYPTED' : 'EXTERNAL_SANDBOX_REDIRECT_ACTIVE'} • REV: 2026.2
        </p>
      </div>
    </div>
  );
};