import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, User, Loader2, Trash2, Music, ExternalLink, Moon, Key, ShieldAlert
} from 'lucide-react';
import { GlassCard } from './GlassCard.tsx';
import { ChatMessage, SleepRecord } from '../types.ts';
import { chatWithCoach, generateNeuralLullaby, decodeBase64Audio, decodeAudioData } from '../services/geminiService.ts';
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
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const key = localStorage.getItem('gemini_api_key') || process.env.API_KEY;
    setApiKeyMissing(!key);

    if (messages.length === 0) {
      const welcome = data 
        ? `${t.intro}\n\nI see your current sleep score is ${data.score}/100 with a resting heart rate of ${data.heartRate.resting} bpm. How can I help analyze these metrics?`
        : t.intro;
      setMessages([{ role: 'assistant', content: welcome, timestamp: new Date() }]);
    }
  }, [data, t.intro]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMsg: ChatMessage = { role: 'user', content: input.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    
    setIsTyping(true);
    try {
      const response = await chatWithCoach(messages.concat(userMsg).map(m => ({ role: m.role, content: m.content })), lang, data);
      if (response) {
        setMessages(prev => [...prev, { role: 'assistant', content: response.text, sources: response.sources, timestamp: new Date() }]);
      }
    } catch (err: any) {
      if (err.message === "API_KEY_REQUIRED") {
        setApiKeyMissing(true);
      }
      setMessages(prev => [...prev, { role: 'assistant', content: "Connection timeout. Please ensure your neural link is valid.", timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleLullaby = async () => {
    if (!data || isGeneratingAudio) return;
    if (isPlayingAudio) { stopAudio(); return; }
    
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
        
        if (audioSourceRef.current) {
          try { audioSourceRef.current.stop(); } catch(e) {}
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer; 
        source.connect(ctx.destination);
        source.onended = () => {
          if (audioSourceRef.current === source) {
            setIsPlayingAudio(false);
          }
        };
        
        audioSourceRef.current = source;
        
        if (ctx.state === 'suspended') {
          await ctx.resume().catch(console.error);
        }
        
        try {
          source.start(0);
          setIsPlayingAudio(true);
        } catch (playError) {
          console.error("Audio playback start failed:", playError);
          setIsPlayingAudio(false);
        }
      }
    } catch (err) { 
      console.error("Lullaby sequence failure:", err); 
    } finally { 
      setIsGeneratingAudio(false); 
    }
  };

  const stopAudio = () => {
    if (audioSourceRef.current) { 
      try { 
        audioSourceRef.current.stop(); 
      } catch(e) {} 
      audioSourceRef.current = null; 
    }
    setIsPlayingAudio(false);
  };

  useEffect(() => {
    return () => {
      stopAudio();
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
      }
    };
  }, []);

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
              {data ? `Analyzing Record: ${data.score}/100` : 'Waiting for Telemetry...'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleLullaby} 
            disabled={isGeneratingAudio || apiKeyMissing}
            className={`p-3 rounded-full transition-all ${isPlayingAudio ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'bg-white/5 text-indigo-400 disabled:opacity-30'}`}
          >
            {isGeneratingAudio ? <Loader2 size={18} className="animate-spin" /> : <Music size={18} />}
          </button>
          <button onClick={() => setMessages([])} className="p-3 bg-white/5 rounded-full text-slate-500 hover:text-rose-400 transition-all"><Trash2 size={18} /></button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto space-y-6 px-4 mb-6 scrollbar-hide relative">
        <AnimatePresence>
          {apiKeyMissing && (
            <m.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-slate-950/80 backdrop-blur-md rounded-3xl"
            >
              <div className="text-center space-y-6 max-w-xs">
                <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto text-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.2)]">
                  <ShieldAlert size={36} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black italic text-white uppercase tracking-tight">Neural Link Required</h3>
                  <p className="text-[11px] text-slate-500 font-medium italic leading-relaxed">AI synthesis engine is locked. Please provide your Gemini API Key in the Settings terminal to authorize access.</p>
                </div>
                <button 
                  onClick={() => window.location.hash = '#/settings'}
                  className="w-full py-4 bg-indigo-600 text-white rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-indigo-500 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <Key size={14} /> CONFIGURE API KEY
                </button>
              </div>
            </m.div>
          )}
        </AnimatePresence>

        {messages.map((msg, idx) => (
          <m.div key={idx} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className="mt-1">{msg.role === 'assistant' ? <CROAvatar /> : <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-500"><User size={14}/></div>}</div>
              <div className={`p-5 rounded-[2rem] text-sm leading-relaxed shadow-xl text-left ${msg.role === 'assistant' ? 'bg-slate-900/60 border border-white/5 text-slate-300' : 'bg-indigo-600 text-white'}`}>
                <div className="whitespace-pre-wrap italic">{msg.content}</div>
                
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                      <ExternalLink size={10} /> Grounding Sources:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {msg.sources.map((source: any, sIdx: number) => (
                        source.web?.uri && (
                          <a 
                            key={sIdx} 
                            href={source.web.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[10px] font-bold text-indigo-400 hover:bg-indigo-500/20 transition-all truncate max-w-[180px]"
                          >
                            {source.web.title || source.web.uri}
                          </a>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </m.div>
        ))}
        {isTyping && (
          <div className="flex justify-start gap-3">
            <CROAvatar isProcessing={true} />
            <div className="px-6 py-4 rounded-full bg-slate-900/40 border border-white/5 flex items-center gap-3">
              <m.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
              <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest italic">Analyzing Telemetry...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="px-4 pb-4">
        <GlassCard className="p-1.5 rounded-full border-white/10 flex items-center gap-2">
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
            placeholder={apiKeyMissing ? "AI Node Locked" : t.placeholder} 
            disabled={apiKeyMissing}
            className="flex-1 bg-transparent outline-none px-6 py-3 text-sm text-slate-200 placeholder:text-slate-700 font-medium italic disabled:opacity-30" 
          />
          <button 
            onClick={handleSend} 
            disabled={!input.trim() || isTyping || apiKeyMissing} 
            className="w-12 h-12 flex items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg active:scale-90 transition-all hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600"
          >
            <Send size={18} />
          </button>
        </GlassCard>
      </div>
    </div>
  );
};