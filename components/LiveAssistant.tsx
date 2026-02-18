import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Radio, Terminal as TerminalIcon, ShieldCheck, 
  Zap, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { GlassCard } from './GlassCard.tsx';
import { SleepRecord } from '../types.ts';
import { Language, translations } from '../services/i18n.ts';

const m = motion as any;

/**
 * SOMNO LAB NEURAL VOICE BRIDGE v1.1
 * Refined implementation of Gemini Live API Protocols.
 */

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const LiveAssistant: React.FC<{ lang: Language; data: SleepRecord | null }> = ({ lang, data }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [transcription, setTranscription] = useState<string[]>([]);
  const [inputTranscription, setInputTranscription] = useState("");
  const [outputTranscription, setOutputTranscription] = useState("");
  
  const t = translations[lang].voice;
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<{ input: AudioContext; output: AudioContext; sources: Set<AudioBufferSourceNode> } | null>(null);
  const nextStartTimeRef = useRef(0);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcription, inputTranscription, outputTranscription]);

  const disconnect = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.input.close().catch(() => {});
      audioContextRef.current.output.close().catch(() => {});
      audioContextRef.current.sources.forEach(s => { try { s.stop(); } catch(e) {} });
      audioContextRef.current = null;
    }
    setIsConnected(false);
    setIsSyncing(false);
  };

  const connect = async () => {
    if (isConnected || isSyncing) return;
    setIsSyncing(true);
    
    try {
      /**
       * FIXED: Guidelines enforce exclusive process.env.API_KEY usage with named parameters.
       */
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const sources = new Set<AudioBufferSourceNode>();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      audioContextRef.current = { input: inputAudioContext, output: outputAudioContext, sources };

      const bioBrief = data ? `Subject Baseline: Score ${data.score}, RHR ${data.heartRate.resting}BPM.` : "No baseline data available.";

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsSyncing(false);
            
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
              
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };

              // CRITICAL: Initiating send after sessionPromise resolves
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setOutputTranscription(prev => prev + message.serverContent!.outputTranscription!.text);
            } else if (message.serverContent?.inputTranscription) {
              setInputTranscription(prev => prev + message.serverContent!.inputTranscription!.text);
            }

            if (message.serverContent?.turnComplete) {
              setTranscription(prev => [...prev, `User: ${inputTranscription}`, `CRO: ${outputTranscription}`]);
              setInputTranscription("");
              setOutputTranscription("");
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
              const source = outputAudioContext.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputAudioContext.destination);
              source.addEventListener('ended', () => sources.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sources.add(source);
            }

            if (message.serverContent?.interrupted) {
              sources.forEach(s => { try { s.stop(); } catch(e) {} });
              sources.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error("Neural Bridge Fault:", e);
            disconnect();
          },
          onclose: () => disconnect(),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: `You are the SomnoAI Chief Research Officer. You are speaking to a laboratory subject in real-time. 
          Use biological telemetry context if available: ${bioBrief}. 
          Your tone is highly professional, efficient, and scientifically focused. 
          Keep responses concise. Reply in ${lang === 'zh' ? 'Chinese' : 'English'}.`,
        },
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Connection Protocol Breach:", err);
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-240px)] md:h-[calc(100vh-220px)] max-w-4xl mx-auto font-sans animate-in fade-in slide-in-from-bottom-12 duration-1000">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-16 px-4 gap-6 text-left">
        <div className="flex items-center gap-6">
          <div className={`p-4 md:p-6 bg-slate-900 border-2 rounded-[2rem] shadow-2xl relative group ${isConnected ? 'border-emerald-500/40 text-emerald-400' : 'border-indigo-500/20 text-indigo-400'}`}>
            <Radio size={32} className={isConnected ? 'animate-pulse' : ''} />
            <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-[#01040a] ${isConnected ? 'bg-emerald-500' : 'bg-slate-800'}`} />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter">{t.title}</h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] italic">{t.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="hidden lg:flex items-center gap-3 px-6 py-3 bg-indigo-600/5 border border-white/5 rounded-full">
              <ShieldCheck size={14} className="text-indigo-400" />
              <span className="text-[9px] font-black text-slate-600 uppercase">PROTOCOL_V3.0_LIVE</span>
           </div>
        </div>
      </header>

      <GlassCard className="flex-1 flex flex-col mb-12 overflow-hidden rounded-[4rem] border-white/10 bg-black/70 shadow-2xl relative" intensity={0.1}>
        <div className="absolute inset-0 pointer-events-none opacity-20">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-indigo-600/5 blur-[120px] rounded-full" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-10 space-y-12 relative z-10">
           <div className="relative">
              <m.div 
                animate={isConnected ? { 
                  scale: [1, 1.1, 1],
                  rotate: [0, 90, 180, 270, 360],
                } : {}}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className={`w-64 h-64 border-2 flex items-center justify-center transition-all duration-1000 rounded-full ${isConnected ? 'border-emerald-500/30 shadow-[0_0_80px_rgba(16,185,129,0.2)]' : 'border-indigo-500/20 opacity-40'}`}
              >
                 <div className={`w-32 h-32 rounded-full border-2 flex items-center justify-center ${isConnected ? 'border-emerald-400/40 animate-pulse' : 'border-indigo-400/20'}`}>
                    <Mic size={48} className={isConnected ? 'text-emerald-400' : 'text-slate-700'} />
                 </div>
              </m.div>
           </div>

           <div className="text-center space-y-4">
              <p className={`text-[11px] font-black uppercase tracking-[0.5em] italic transition-colors ${isConnected ? 'text-emerald-400' : 'text-slate-600'}`}>
                {isSyncing ? t.statusSyncing : isConnected ? t.statusActive : t.statusIdle}
              </p>
              <p className="text-xs text-slate-500 max-w-xs italic font-medium opacity-60">
                {isConnected ? t.instruction : "Initialize biometric audio bridge for real-time synthesis."}
              </p>
           </div>

           <div className="w-full max-w-2xl bg-black/40 border border-white/5 rounded-[2.5rem] p-8 h-48 overflow-y-auto scrollbar-hide font-mono text-[10px] space-y-4 shadow-inner">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2 text-slate-700 mb-4">
                 <TerminalIcon size={12} />
                 <span className="uppercase tracking-widest text-[9px]">Neural Pulse Log</span>
              </div>
              {transcription.map((line, i) => (
                <m.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={i} className="flex gap-4">
                   <span className="text-indigo-500/50 shrink-0">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                   <span className={line.startsWith('User') ? 'text-slate-500' : 'text-indigo-400 font-bold italic'}>{line}</span>
                </m.div>
              ))}
              {inputTranscription && (
                <div className="flex gap-4 animate-pulse">
                   <span className="text-emerald-500/50 shrink-0">[INPUT]</span>
                   <span className="text-emerald-500/80 italic">{inputTranscription}...</span>
                </div>
              )}
              {outputTranscription && (
                <div className="flex gap-4 animate-pulse">
                   <span className="text-indigo-500/50 shrink-0">[OUTPUT]</span>
                   <span className="text-indigo-400 italic">{outputTranscription}...</span>
                </div>
              )}
              <div ref={logEndRef} />
           </div>
        </div>

        <div className="p-10 bg-slate-950/80 border-t border-white/5 flex justify-center">
           <button 
             onClick={isConnected ? disconnect : connect}
             disabled={isSyncing}
             className={`px-16 py-7 rounded-full font-black text-[12px] uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-95 italic ${isConnected ? 'bg-rose-600 text-white hover:bg-rose-500 shadow-rose-600/20' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/30'}`}
           >
             {isSyncing ? <Loader2 size={18} className="animate-spin" /> : isConnected ? <MicOff size={18} /> : <Zap size={18} fill="currentColor" />}
             {isSyncing ? 'SYNCING...' : isConnected ? t.disconnect : t.connect}
           </button>
        </div>
      </GlassCard>
    </div>
  );
};