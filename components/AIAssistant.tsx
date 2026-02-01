
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, User, Loader2, Trash2, Music, ExternalLink, Moon, Key, ShieldAlert, Camera, X, Scan, Zap, Eye, Mail, CheckCircle2
} from 'lucide-react';
import { GlassCard } from './GlassCard.tsx';
import { ChatMessage, SleepRecord } from '../types.ts';
import { chatWithCoach, generateNeuralLullaby, decodeBase64Audio, decodeAudioData } from '../services/geminiService.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { Language, translations } from '../services/i18n.ts';
import { Logo } from './Logo.tsx';
import { safeNavigateHash } from '../services/navigation.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { emailService } from '../services/emailService.ts';

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
  const { profile, isAdmin } = useAuth();
  const t = translations[lang].assistant;
  const [messages, setMessages] = useState<(ChatMessage & { sources?: any[], image?: string, isEmailing?: boolean, emailSent?: boolean })[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // LOGIC: Differentiate between System Asset and Subject Asset
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  useEffect(() => {
    const checkKeyAvailability = () => {
      const hasPersonalKey = !!localStorage.getItem('custom_gemini_key');
      const hasSystemKey = !!process.env.API_KEY;
      
      // Strict Policy: 
      // 1. Regular subjects MUST have a personal key.
      // 2. Only Admins can bypass using the system assets.
      if (isAdmin) {
        setApiKeyMissing(!hasPersonalKey && !hasSystemKey);
      } else {
        setApiKeyMissing(!hasPersonalKey);
      }
    };

    checkKeyAvailability();

    if (messages.length === 0) {
      const welcome = data 
        ? `${t.intro}\n\nI see your current sleep score is ${data.score}/100.`
        : t.intro;
      setMessages([{ role: 'assistant', content: welcome, timestamp: new Date() }]);
    }
  }, [data, t.intro, isAdmin]);

  const handleSend = async (imageOverride?: string) => {
    const textToSend = input.trim();
    if (!textToSend && !imageOverride) return;
    if (isTyping || apiKeyMissing) return;
    
    const userMsg: ChatMessage & { image?: string } = { 
      role: 'user', 
      content: textToSend || (imageOverride ? "Analyzing biometric frame scan..." : ""), 
      image: imageOverride || undefined,
      timestamp: new Date() 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    
    try {
      const historyForAI = messages.concat(userMsg).map(m => ({ 
        role: m.role, 
        content: m.content, 
        image: m.image 
      }));
      
      // Pass the Admin status to authorize access to system assets if applicable
      const response = await chatWithCoach(historyForAI, lang, data, isAdmin);
      if (response) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: response.text || "Handshake Timeout", 
          sources: response.sources, 
          timestamp: new Date() 
        }]);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Personal Bridge required. Please authorize your own API key in Settings.", 
        timestamp: new Date() 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] max-w-2xl mx-auto font-sans relative">
      <header className="flex items-center justify-between mb-8 px-4 pt-10">
        <div className="flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center shadow-inner relative">
            <Logo size={24} animated={true} />
            <div className="absolute -top-1 -right-1">
               <Moon size={12} className="text-indigo-400 fill-indigo-400/20" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-black italic text-white uppercase leading-none">{t.title}</h1>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">
              {apiKeyMissing ? 'Subject Node Offline' : 'Personal Bridge Active'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setMessages([])} className="p-3 bg-white/5 rounded-full text-slate-500 hover:text-rose-400 transition-all"><Trash2 size={18} /></button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto space-y-6 px-4 mb-6 scrollbar-hide relative">
        <AnimatePresence>
          {apiKeyMissing && (
            <m.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-slate-950/80 backdrop-blur-md rounded-3xl"
            >
              <div className="text-center space-y-6 max-w-xs">
                <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto text-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.2)]">
                  <ShieldAlert size={36} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black italic text-white uppercase tracking-tight">Bridge Required</h3>
                  <p className="text-[11px] text-slate-500 font-medium italic leading-relaxed">
                    {isAdmin ? 'System assets detected, but a personal key is recommended for subject simulation.' : 'Personal AI features require a subject-owned API key. Please configure your Personal Bridge in Settings.'}
                  </p>
                </div>
                <button onClick={() => safeNavigateHash('settings')} className="w-full py-4 bg-indigo-600 text-white rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-indigo-500 active:scale-95 transition-all flex items-center justify-center gap-3">
                  <Key size={14} /> CONFIGURE BRIDGE
                </button>
              </div>
            </m.div>
          )}
        </AnimatePresence>

        {messages.map((msg, idx) => (
          <m.div key={idx} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className="mt-1">{msg.role === 'assistant' ? <CROAvatar /> : <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-500"><User size={14}/></div>}</div>
                <div className={`p-5 rounded-[2rem] text-sm leading-relaxed shadow-xl text-left relative overflow-hidden ${msg.role === 'assistant' ? 'bg-slate-900/60 border border-white/5 text-slate-300' : 'bg-indigo-600 text-white'}`}>
                  <div className="whitespace-pre-wrap italic">{msg.content}</div>
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
              <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest italic">Synthesizing...</span>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 pb-4">
        <GlassCard className="p-1.5 rounded-full border-white/10 flex items-center gap-2">
          <input 
            type="text" value={input} 
            onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
            placeholder={apiKeyMissing ? "Bridge Offline" : t.placeholder} disabled={apiKeyMissing}
            className="flex-1 bg-transparent outline-none px-6 py-3 text-sm text-slate-200 placeholder:text-slate-700 font-medium italic disabled:opacity-30" 
          />
          <button 
            onClick={() => handleSend()} disabled={!input.trim() || isTyping || apiKeyMissing} 
            className="w-12 h-12 flex items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg active:scale-90 transition-all hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600"
          ><Send size={18} /></button>
        </GlassCard>
      </div>
    </div>
  );
};
