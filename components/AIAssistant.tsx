
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
  const { profile } = useAuth();
  const t = translations[lang].assistant;
  const [messages, setMessages] = useState<(ChatMessage & { sources?: any[], image?: string, isEmailing?: boolean, emailSent?: boolean })[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  
  const [showScanner, setShowScanner] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<HTMLAudioElement | any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkKeyAvailability = async () => {
      if ((window as any).aistudio?.hasSelectedApiKey) {
        try {
          const hasKey = await (window as any).aistudio.hasSelectedApiKey();
          setApiKeyMissing(!hasKey && !process.env.API_KEY);
        } catch (e) {
          setApiKeyMissing(!process.env.API_KEY);
        }
      } else {
        setApiKeyMissing(!process.env.API_KEY);
      }
    };

    checkKeyAvailability();

    if (messages.length === 0) {
      const welcome = data 
        ? `${t.intro}\n\nI see your current sleep score is ${data.score}/100 with a resting heart rate of ${data.heartRate.resting} bpm. How can I help analyze these metrics? You can also use the camera for a facial fatigue scan.`
        : t.intro;
      setMessages([{ role: 'assistant', content: welcome, timestamp: new Date() }]);
    }
  }, [data, t.intro]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleDispatchEmail = async (index: number) => {
    const msg = messages[index];
    if (!profile?.email || !msg.content || msg.isEmailing) return;

    setMessages(prev => prev.map((m, i) => i === index ? { ...m, isEmailing: true } : m));

    try {
      const html = emailService.formatAnalysisHtml(msg.content, profile.email);
      const res = await emailService.sendSystemEmail(profile.email, "Neural Lab Analysis Dispatch", html);
      
      if (res.success) {
        setMessages(prev => prev.map((m, i) => i === index ? { ...m, isEmailing: false, emailSent: true } : m));
        setTimeout(() => {
          setMessages(prev => prev.map((m, i) => i === index ? { ...m, emailSent: false } : m));
        }, 3000);
      } else {
        throw new Error("SMTP_BRIDGE_FAILURE");
      }
    } catch (e) {
      setMessages(prev => prev.map((m, i) => i === index ? { ...m, isEmailing: false } : m));
      console.error("Dispatch Error:", e);
    }
  };

  const handleSend = async (imageOverride?: string) => {
    const textToSend = input.trim();
    if (!textToSend && !imageOverride) return;
    if (isTyping) return;
    
    const userMsg: ChatMessage & { image?: string } = { 
      role: 'user', 
      content: textToSend || (imageOverride ? "Analyzing facial fatigue scan..." : ""), 
      image: imageOverride || capturedImage || undefined,
      timestamp: new Date() 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setCapturedImage(null);
    
    setIsTyping(true);
    try {
      const historyForAI = messages.concat(userMsg).map(m => ({ 
        role: m.role, 
        content: m.content, 
        image: m.image 
      }));
      
      const response = await chatWithCoach(historyForAI, lang, data);
      if (response) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: response.text || "Synthesis Null", 
          sources: response.sources, 
          timestamp: new Date() 
        }]);
      }
    } catch (err: any) {
      if (err.message === "API_KEY_REQUIRED" || err.message?.includes("entity not found")) {
        setApiKeyMissing(true);
      }
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Neural handshake failed. Please ensure your AI bridge is authorized in Settings.", 
        timestamp: new Date() 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const startScanner = async () => {
    setShowScanner(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera Access Denied:", err);
      setShowScanner(false);
    }
  };

  const stopScanner = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setShowScanner(false);
    setIsScanning(false);
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsScanning(true);
    
    setTimeout(() => {
      const canvas = canvasRef.current!;
      const video = videoRef.current!;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(dataUrl);
      stopScanner();
      handleSend(dataUrl);
    }, 2000);
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
        
        const source = ctx.createBufferSource();
        source.buffer = buffer; 
        source.connect(ctx.destination);
        source.onended = () => {
          setIsPlayingAudio(false);
        };
        
        audioSourceRef.current = source;
        if (ctx.state === 'suspended') await ctx.resume();
        source.start(0);
        setIsPlayingAudio(true);
      }
    } catch (err) { 
      console.error("Lullaby failure:", err); 
    } finally { 
      setIsGeneratingAudio(false); 
    }
  };

  const stopAudio = () => {
    if (audioSourceRef.current) { 
      try { audioSourceRef.current.stop(); } catch(e) {} 
      audioSourceRef.current = null; 
    }
    setIsPlayingAudio(false);
  };

  useEffect(() => {
    return () => stopAudio();
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
            onClick={startScanner}
            disabled={apiKeyMissing}
            className="p-3 bg-white/5 rounded-full text-indigo-400 hover:bg-white/10 transition-all disabled:opacity-30"
          >
            <Camera size={18} />
          </button>
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
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-slate-950/80 backdrop-blur-md rounded-3xl"
            >
              <div className="text-center space-y-6 max-w-xs">
                <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto text-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.2)]">
                  <ShieldAlert size={36} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black italic text-white uppercase tracking-tight">Neural Link Required</h3>
                  <p className="text-[11px] text-slate-500 font-medium italic leading-relaxed">Please initialize your Neural Bridge in Settings to authorize AI processing.</p>
                </div>
                <button onClick={() => safeNavigateHash('settings')} className="w-full py-4 bg-indigo-600 text-white rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-indigo-500 active:scale-95 transition-all flex items-center justify-center gap-3">
                  <Key size={14} /> AUTHORIZE NEURAL BRIDGE
                </button>
              </div>
            </m.div>
          )}

          {showScanner && (
            <m.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 z-[60] bg-slate-950 rounded-[3rem] overflow-hidden border border-white/10 flex flex-col"
            >
              <div className="relative flex-1 bg-black">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                  <div className="w-3/4 h-3/4 border-2 border-indigo-500/30 rounded-3xl relative overflow-hidden">
                    <m.div animate={{ top: ['0%', '100%', '0%'] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} className="absolute left-0 right-0 h-1 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,1)]" />
                    <div className="absolute top-4 left-4 text-indigo-400 flex items-center gap-2"><Scan size={14} className="animate-pulse" /><span className="text-[8px] font-black uppercase tracking-widest">Biometric Mapping...</span></div>
                  </div>
                </div>
                {isScanning && <div className="absolute inset-0 bg-indigo-600/20 backdrop-blur-sm flex items-center justify-center"><div className="text-center space-y-4"><Loader2 className="animate-spin text-white mx-auto" size={48} /><p className="text-xs font-black text-white uppercase tracking-widest italic">Analyzing Fatigue Markers...</p></div></div>}
              </div>
              <div className="p-8 bg-slate-900 flex justify-between items-center"><button onClick={stopScanner} className="p-4 bg-white/5 rounded-full text-slate-400"><X size={20} /></button><button onClick={captureFrame} disabled={isScanning} className="px-10 py-4 bg-indigo-600 text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3"><Zap size={16} fill="white" /> Execute Scan</button><div className="w-12" /></div>
            </m.div>
          )}
        </AnimatePresence>

        {messages.map((msg, idx) => (
          <m.div key={idx} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className="mt-1">{msg.role === 'assistant' ? <CROAvatar /> : <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-500"><User size={14}/></div>}</div>
                <div className={`p-5 rounded-[2rem] text-sm leading-relaxed shadow-xl text-left relative overflow-hidden ${msg.role === 'assistant' ? 'bg-slate-900/60 border border-white/5 text-slate-300' : 'bg-indigo-600 text-white'}`}>
                  {msg.image && (
                     <div className="mb-4 rounded-2xl overflow-hidden border border-white/10">
                        <img src={msg.image} alt="Scan" className="w-full h-auto max-h-48 object-cover" />
                        <div className="p-2 bg-black/40 text-[8px] font-black uppercase text-indigo-400 flex items-center gap-2"><Eye size={10} /> Biometric Frame Captured</div>
                     </div>
                  )}
                  <div className="whitespace-pre-wrap italic">{msg.content}</div>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"><ExternalLink size={10} /> Grounding Intelligence:</p>
                      <div className="flex flex-wrap gap-2">
                        {msg.sources.map((source: any, sIdx: number) => source.web?.uri && (
                            <a key={sIdx} href={source.web.uri} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[10px] font-bold text-indigo-400 hover:bg-indigo-500/20 transition-all truncate max-w-[180px] backdrop-blur-md">{source.web.title || source.web.uri}</a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Action: Dispatch Email */}
              {msg.role === 'assistant' && !isTyping && profile?.email && (
                 <m.button 
                   initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                   onClick={() => handleDispatchEmail(idx)}
                   disabled={msg.isEmailing || msg.emailSent}
                   className={`ml-11 flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-[9px] font-black uppercase tracking-widest ${
                     msg.emailSent ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 
                     msg.isEmailing ? 'bg-white/5 border-white/5 text-slate-600' :
                     'bg-white/5 border-white/10 text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/30'
                   }`}
                 >
                   {msg.isEmailing ? <Loader2 size={10} className="animate-spin" /> : msg.emailSent ? <CheckCircle2 size={10} /> : <Mail size={10} />}
                   {msg.emailSent ? t.emailSuccess : msg.isEmailing ? "Dispatching..." : t.dispatchEmail}
                 </m.button>
              )}
            </div>
          </m.div>
        ))}
        {isTyping && (
          <div className="flex justify-start gap-3">
            <CROAvatar isProcessing={true} />
            <div className="px-6 py-4 rounded-full bg-slate-900/40 border border-white/5 flex items-center gap-3">
              <m.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
              <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest italic">Synthesizing Neural Response...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="px-4 pb-4">
        <GlassCard className="p-1.5 rounded-full border-white/10 flex items-center gap-2">
          {capturedImage && (
             <div className="relative ml-4">
                <img src={capturedImage} className="w-10 h-10 rounded-full object-cover border border-indigo-500" />
                <button onClick={() => setCapturedImage(null)} className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5"><X size={8} /></button>
             </div>
          )}
          <input 
            type="text" value={input} 
            onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
            placeholder={apiKeyMissing ? "Neural Link Offline" : t.placeholder} disabled={apiKeyMissing}
            className="flex-1 bg-transparent outline-none px-6 py-3 text-sm text-slate-200 placeholder:text-slate-700 font-medium italic disabled:opacity-30" 
          />
          <button 
            onClick={() => handleSend()} disabled={(!input.trim() && !capturedImage) || isTyping || apiKeyMissing} 
            className="w-12 h-12 flex items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg active:scale-90 transition-all hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600"
          ><Send size={18} /></button>
        </GlassCard>
      </div>
    </div>
  );
};
