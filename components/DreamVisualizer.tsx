
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Image as ImageIcon, Camera, Wand2, Download, 
  Loader2, Zap, ShieldCheck, AlertCircle, Info, Maximize2, 
  Trash2, Terminal, Sliders, Settings
} from 'lucide-react';
import { GlassCard } from './GlassCard.tsx';
import { synthesizeImage, editImage } from '../services/geminiService.ts';
import { SleepRecord } from '../types.ts';
import { Language, translations } from '../services/i18n.ts';

const m = motion as any;

interface DreamVisualizerProps {
  lang: Language;
  data: SleepRecord | null;
}

declare var window: any;

export const DreamVisualizer: React.FC<DreamVisualizerProps> = ({ lang, data }) => {
  const t = translations[lang].dreams;
  const [isProcessing, setIsProcessing] = useState(false);
  const [hqMode, setHqMode] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [editInstruction, setEditInstruction] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSynthesize = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      if (hqMode) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await window.aistudio.openSelectKey();
          // Procedure: proceed directly assuming selection was successful
        }
      }

      const bioPrompt = data 
        ? `A cinematic visualization of a dream influenced by these biological metrics: Sleep Score ${data.score}%, Deep Sleep ${data.deepRatio}%, RHR ${data.heartRate.resting}bpm. Style: Surrealism, 8k, moody atmospheric lighting, ethereal glow.`
        : "A surreal, beautiful neural representation of deep restorative sleep. 8k resolution, cinematic lighting.";

      const result = await synthesizeImage(bioPrompt, hqMode);
      setResultImage(result.imageUrl);
    } catch (err: any) {
      if (err.message?.includes("Requested entity was not found")) {
        setError("API Key Error: Resetting selection. Please select a valid key again.");
        await window.aistudio.openSelectKey();
      } else {
        setError(err.message || "Synthesis Protocol Fault.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      setResultImage(reader.result as string); // Preview original
    };
    reader.readAsDataURL(file);
  };

  const handleEdit = async () => {
    if (!resultImage || !editInstruction.trim()) return;
    setIsProcessing(true);
    setError(null);
    try {
      const mimeType = resultImage.split(';')[0].split(':')[1];
      const base64 = resultImage.split(',')[1];
      const result = await editImage(base64, mimeType, editInstruction);
      setResultImage(result.imageUrl);
      setEditInstruction('');
    } catch (err: any) {
      setError(err.message || "Editing Node Fault.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-10 pb-40 max-w-5xl mx-auto px-4 text-left animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pt-8 px-2">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-xl">
              <Sparkles size={24} />
            </div>
            <h1 className="text-3xl md:text-4xl font-black italic text-white uppercase tracking-tighter leading-none">
              {t.title}
            </h1>
          </div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic">{t.subtitle}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-6 py-2 bg-white/5 rounded-full border border-white/10 group cursor-help relative">
             <Sliders size={14} className="text-slate-600" />
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol v4.0</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Controls Column */}
        <div className="lg:col-span-4 space-y-8">
           <GlassCard className="p-10 rounded-[4rem] border-white/5 bg-slate-950/40 space-y-10 shadow-2xl overflow-hidden relative">
              <div className="space-y-6 relative z-10">
                 <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <Zap size={16} className="text-indigo-400" />
                    <h3 className="text-[11px] font-black uppercase text-white tracking-[0.2em] italic">Synthesizer Core</h3>
                 </div>

                 <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-white uppercase italic">{t.hqMode}</p>
                          <p className="text-[8px] text-slate-600 uppercase font-bold">Ultra Res Synthesis</p>
                       </div>
                       <button 
                         onClick={() => setHqMode(!hqMode)}
                         className={`w-12 h-6 rounded-full transition-all relative ${hqMode ? 'bg-indigo-600' : 'bg-slate-800'}`}
                       >
                          <m.div 
                            animate={{ x: hqMode ? 24 : 4 }}
                            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md" 
                          />
                       </button>
                    </div>

                    <AnimatePresence>
                      {hqMode && (
                        <m.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                           <div className="flex gap-3 items-start">
                              <AlertCircle size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                              <p className="text-[9px] text-slate-300 italic leading-relaxed font-bold">
                                {t.hqWarning} <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-indigo-400 underline">Billing Docs</a>
                              </p>
                           </div>
                        </m.div>
                      )}
                    </AnimatePresence>
                 </div>

                 <button 
                   onClick={handleSynthesize}
                   disabled={isProcessing}
                   className="w-full py-6 bg-indigo-600 text-white rounded-full font-black text-[12px] uppercase tracking-[0.4em] shadow-xl hover:bg-indigo-500 transition-all flex items-center justify-center gap-4 italic active:scale-95 disabled:opacity-30"
                 >
                    {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                    {isProcessing ? t.synthesizing : t.generate}
                 </button>
              </div>

              <div className="pt-10 border-t border-white/5 space-y-6 relative z-10">
                 <div className="flex items-center gap-3">
                    <ImageIcon size={16} className="text-slate-600" />
                    <h3 className="text-[11px] font-black uppercase text-slate-500 tracking-[0.2em] italic">{t.editTitle}</h3>
                 </div>

                 <div className="space-y-4">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-4 bg-white/5 border border-white/10 text-slate-400 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all italic flex items-center justify-center gap-3"
                    >
                      <Camera size={14} /> {t.uploadRoom}
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

                    <textarea 
                      value={editInstruction}
                      onChange={(e) => setEditInstruction(e.target.value)}
                      placeholder={t.editPlaceholder}
                      className="w-full bg-black/40 border border-white/5 rounded-3xl p-5 text-sm text-slate-300 outline-none focus:border-indigo-500/30 transition-all h-24 italic resize-none"
                    />

                    <button 
                      onClick={handleEdit}
                      disabled={isProcessing || !resultImage || !editInstruction.trim()}
                      className="w-full py-4 bg-slate-900 text-slate-300 rounded-full font-black text-[10px] uppercase tracking-[0.3em] hover:text-white transition-all flex items-center justify-center gap-3 italic active:scale-95 disabled:opacity-20"
                    >
                       <Wand2 size={14} /> Execute Mutation
                    </button>
                 </div>
              </div>
           </GlassCard>

           <AnimatePresence>
             {error && (
               <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-rose-600/10 border border-rose-500/20 rounded-[2.5rem] flex items-start gap-4">
                  <AlertCircle size={20} className="text-rose-500 shrink-0 mt-1" />
                  <p className="text-[11px] font-bold text-rose-300 uppercase tracking-widest italic">{error}</p>
               </m.div>
             )}
           </AnimatePresence>
        </div>

        {/* Display Column */}
        <div className="lg:col-span-8 h-[600px] lg:h-auto">
           <GlassCard className="h-full rounded-[5rem] border-white/5 bg-black/60 relative group overflow-hidden shadow-[0_60px_150px_-30px_rgba(0,0,0,1)]" intensity={0.5}>
              <AnimatePresence mode="wait">
                 {resultImage ? (
                   <m.div key="image" initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} className="h-full w-full relative">
                      <img src={resultImage} alt="Synthesized Projection" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      
                      <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-700">
                         <div className="space-y-1">
                            <span className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.4em] italic">Projection Node Alpha</span>
                            <h4 className="text-xl font-black italic text-white uppercase tracking-tight">Synthesized Architecture</h4>
                         </div>
                         <div className="flex gap-3">
                            <a 
                              href={resultImage} download="somno-projection.png"
                              className="p-5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-500 shadow-xl transition-all active:scale-90"
                            >
                               <Download size={20} />
                            </a>
                            <button 
                              onClick={() => setResultImage(null)}
                              className="p-5 bg-white/5 text-slate-400 rounded-2xl hover:bg-rose-600/20 hover:text-rose-500 transition-all border border-white/5"
                            >
                               <Trash2 size={20} />
                            </button>
                         </div>
                      </div>
                   </m.div>
                 ) : (
                   <m.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full w-full flex flex-col items-center justify-center space-y-8 p-20 text-center">
                      <div className="relative">
                         <div className="absolute inset-0 bg-indigo-500/10 blur-[80px] rounded-full animate-pulse" />
                         <div className="w-32 h-32 rounded-[3.5rem] bg-slate-950 border border-white/5 flex items-center justify-center text-slate-800 relative z-10 shadow-inner">
                            <ImageIcon size={64} strokeWidth={0.5} />
                         </div>
                      </div>
                      <div className="space-y-2">
                         <h3 className="text-2xl font-black italic text-white uppercase tracking-tight">{t.noImage}</h3>
                         <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] italic">Initialize high-frequency synthesis protocol</p>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10">
                         {[1, 2, 3, 4].map(i => (
                           <div key={i} className="w-2 h-2 rounded-full bg-indigo-500/20 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                         ))}
                      </div>
                   </m.div>
                 )}
              </AnimatePresence>

              {isProcessing && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md">
                   <m.div 
                     animate={{ 
                       rotate: 360,
                       scale: [1, 1.2, 1],
                       borderRadius: ["40%", "50%", "40%"]
                     }} 
                     transition={{ duration: 3, repeat: Infinity }}
                     className="w-24 h-24 border-4 border-indigo-600/20 border-t-indigo-500 flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.2)]"
                   >
                     <Terminal size={32} className="text-indigo-400 animate-pulse" />
                   </m.div>
                   <p className="mt-10 text-[11px] font-black text-indigo-400 uppercase tracking-[0.8em] italic animate-pulse">Encoding Neural Matrix...</p>
                </div>
              )}
           </GlassCard>
        </div>
      </div>

      <footer className="pt-20 opacity-20 flex flex-col items-center gap-4">
         <div className="flex items-center gap-3">
            <ShieldCheck size={14} className="text-indigo-400" />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Encrypted Image Synthesis Relay Active</span>
         </div>
      </footer>
    </div>
  );
};
