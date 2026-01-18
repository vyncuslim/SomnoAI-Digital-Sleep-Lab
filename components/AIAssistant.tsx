
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, User, Loader2, Cpu, Trash2, Key, Beaker, Terminal, Radio, Music, Square
} from 'lucide-react';
import { GlassCard } from './GlassCard.tsx';
import { ChatMessage, SleepRecord } from '../types.ts';
import { chatWithCoach, designExperiment, generateNeuralLullaby, decodeBase64Audio, decodeAudioData } from '../services/geminiService.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { Language, translations } from '../services/i18n.ts';

const m = motion as any;

const CROAvatar = ({ isProcessing = false, size = 32 }: { isProcessing?: boolean, size?: number }) => (
  <m.div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
    <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
      <m.circle cx="50" cy="50" r="45" stroke="rgba(129, 140, 248, 0.3)" strokeWidth="1" strokeDasharray="5 5" animate={{ rotate: 360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} />
      <m.path d="M50 20 L80 35 V65 L50 80 L20 65 V35 Z" fill="rgba(79, 70, 229, 0.2)" stroke="#818cf8" strokeWidth="2" animate={isProcessing ? { opacity: [0.5, 1, 0.5], scale: [0.95, 1, 0.95] } : {}} transition={{ duration: 1.5, repeat: Infinity }} />
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

export const AIAssistant: React.FC<AIAssistantProps> = ({ lang, data, onNavigate }) => {
  const t = translations[lang].assistant;
  const isZh = lang === 'zh';
  const [messages, setMessages] = useState<(ChatMessage & { sources?: any[] })[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasKey, setHasKey] = useState<boolean>(!!process.env.API_KEY);
  
  // Audio state
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0 && hasKey) {
      setMessages([{ role: 'assistant', content: t.intro, timestamp: new Date() }]);
    }
  }, [hasKey, t.intro]);

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
      const response = await chatWithCoach(messages.concat(userMsg).map(m => ({ role: m.role, content: m.content })), lang, data);
      if (response) {
        setMessages(prev => [...prev, { role: 'assistant', content: response.text, sources: response.sources, timestamp: new Date() }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: t.error + " (Connection failed)", timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleLullaby = async () => {
    if (!data || isGeneratingAudio || !hasKey) return;
    if (isPlayingAudio) { stopAudio(); return; }
    setIsGeneratingAudio(true);
    try {
      const base64 = await generateNeuralLullaby(data, lang);
      if (base64) {
        if (!audioContextRef.current) { audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 }); }
        const ctx = audioContextRef.current;
        const decoded = decodeBase64Audio(base64);
        const buffer = await decodeAudioData(decoded, ctx);
        const source = ctx.createBufferSource();
        source.buffer = buffer; source.connect(ctx.destination);
        source.onended = () => setIsPlayingAudio(false);
        audioSourceRef.current = source;
        if (ctx.state === 'suspended') await ctx.resume();
        source.start(); setIsPlayingAudio(true);
      }
    } catch (err) { console.error(err); } finally { setIsGeneratingAudio(false); }
  };

  const stopAudio = () => {
    if (audioSourceRef.current) { try { audioSourceRef.current.stop(); } catch(e) {} audioSourceRef.current = null; }
    setIsPlayingAudio(false);
  };

  if (!hasKey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 space-y-12 font-mono text-left">
        <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-lg bg-[#020617] border border-indigo-500/20 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(79,70,229,0.1)]">
          <div className="bg-indigo-600/10 px-6 py-4 border-b border-indigo-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">Sandbox Environment</span>
            </div>
            <Radio size={14} className="text-indigo-500/50" />
          </div>
          <div className="p-8 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-slate-400">
                <Terminal size={20} />
                <h2 className="text-xl font-black italic text-white uppercase tracking-tighter leading-none">Degraded Neural Mode</h2>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed uppercase tracking-wider">
                Full neural synthesis is currently <span className="text-rose-500">unavailable</span>. 
                The system environment lacks the necessary biometric credentials.
              </p>
            </div>
            <div className="bg-black/40 rounded-2xl border border-white/5 p-6 space-y-4">
              <div className="flex items-center justify-between text-[9px] font-black text-slate-700 uppercase tracking-widest border-b border-white/5 pb-3">
                <span>System Manifest</span><span>Status</span>
              </div>
              {[
                { label: 'Neural Link', status: 'INACTIVE', color: 'text-rose-600' },
                { label: 'Biometric Pulse', status: 'SIMULATED', color: 'text-amber-600' },
                { label: 'Language Core', status: 'DEFAULT: EN', color: 'text-indigo-400' }
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-slate-500 italic">{item.label}</span><span className={item.color}>{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        </m.div>
        <footer className="text-center">
           <p className="text-[8px] text-slate-800 uppercase tracking-[0.6em] font-black">Somno Lab • Configuration Required</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] max-w-2xl mx-auto font-sans">
      <header className="flex items-center justify-between mb-8 px-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400"><Cpu size={20} /></div>
          <div><h1 className="text-lg font-black italic text-white uppercase leading-none">{t.title}</h1><p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-1">Real-time Node Connected</p></div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleLullaby} disabled={!data || isGeneratingAudio} className={`p-3 rounded-full transition-all ${isPlayingAudio ? 'bg-indigo-600 text-white animate-pulse' : 'bg-white/5 text-indigo-400 hover:bg-white/10'}`}>
            {isGeneratingAudio ? <Loader2 size={18} className="animate-spin" /> : isPlayingAudio ? <Square size={18} /> : <Music size={18} />}
          </button>
          <button onClick={() => { if(data) designExperiment(data, lang).then(exp => setMessages(prev => [...prev, { role: 'assistant', content: isZh ? `假设: ${exp.hypothesis}\n步骤: ${exp.protocol.join('; ')}` : `Hypothesis: ${exp.hypothesis}`, timestamp: new Date() }])); }} className="p-3 bg-white/5 rounded-full text-indigo-400 hover:bg-white/10 transition-all"><Beaker size={18} /></button>
          <button onClick={() => setMessages([])} className="p-3 bg-white/5 rounded-full text-slate-500 hover:text-rose-400 transition-all"><Trash2 size={18} /></button>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto space-y-6 px-4 mb-6 scrollbar-hide">
        {messages.map((msg, idx) => (
          <m.div key={idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className="mt-1">{msg.role === 'assistant' ? <CROAvatar /> : <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-500"><User size={14}/></div>}</div>
              <div className={`p-6 rounded-[2.5rem] text-sm leading-relaxed ${msg.role === 'assistant' ? 'bg-slate-950/60 border border-white/5 text-slate-300 shadow-xl' : 'bg-indigo-600 text-white shadow-2xl'}`}>
                <div className="whitespace-pre-wrap italic">{msg.content}</div>
              </div>
            </div>
          </m.div>
        ))}
        {isTyping && <div className="flex justify-start gap-3"><CROAvatar isProcessing={true} /><div className="px-6 py-4 rounded-full bg-slate-900/40 border border-white/5 flex items-center gap-3"><m.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 h-1 bg-indigo-500 rounded-full" /><span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Synthesizing Response...</span></div></div>}
        <div ref={scrollRef} />
      </div>
      <div className="px-4 pb-4">
        <GlassCard className="p-1.5 rounded-full border-white/10 flex items-center gap-2">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder={t.placeholder} className="flex-1 bg-transparent outline-none px-6 py-3 text-sm text-slate-200 placeholder:text-slate-700 font-medium italic" />
          <button onClick={handleSend} disabled={!input.trim() || isTyping} className="w-12 h-12 flex items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg active:scale-90 transition-all hover:bg-indigo-500"><Send size={18} /></button>
        </GlassCard>
      </div>
    </div>
  );
};
