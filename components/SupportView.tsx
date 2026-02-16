import React, { useState } from 'react';
import { 
  ArrowLeft, Heart, MessageSquare, HelpCircle, 
  ChevronRight, Copy, QrCode, ArrowUpRight, 
  Mail, ShieldCheck, Zap, Info, Sparkles, 
  AlertCircle, ExternalLink, Coffee, LifeBuoy, Check, X, Monitor, Smartphone
} from 'lucide-react';
import { GlassCard } from './GlassCard.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Language, translations } from '../services/i18n.ts';

const m = motion as any;

interface SupportViewProps {
  lang: Language;
  onBack: () => void;
  onNavigate: (view: any) => void;
}

export const SupportView: React.FC<SupportViewProps> = ({ lang, onBack, onNavigate }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showDonation, setShowDonation] = useState(false);
  const t = translations[lang].support;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen pt-4 pb-32 animate-in fade-in slide-in-from-right-4 duration-500 font-sans text-left">
      <header className="flex items-center gap-6 mb-16 px-4 max-w-4xl mx-auto pt-20">
        <button 
          onClick={onBack}
          className="p-4 bg-white/5 hover:bg-white/10 rounded-3xl text-slate-400 hover:text-white transition-all border border-white/5 shadow-2xl active:scale-95"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase leading-none">
            {t.title}
          </h1>
          <p className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-[0.4em] mt-2">
            SomnoAI Laboratory Support Interface
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto space-y-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <GlassCard 
            onClick={() => onNavigate('feedback')}
            className="p-12 rounded-[4rem] border-white/5 cursor-pointer group hover:bg-indigo-600/[0.02] transition-all shadow-2xl"
            intensity={1.2}
          >
            <div className="flex items-center justify-between mb-10">
               <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400 group-hover:scale-110 transition-transform">
                  <LifeBuoy size={32} />
               </div>
               <ChevronRight size={22} className="text-slate-800 group-hover:text-indigo-400 transition-colors" />
            </div>
            <h3 className="text-2xl font-black italic text-white uppercase tracking-tight mb-4">{t.techSupport}</h3>
            <p className="text-xs text-slate-500 leading-relaxed italic font-medium opacity-80">{t.techDesc}</p>
          </GlassCard>

          <GlassCard 
            onClick={() => setShowDonation(true)}
            className="p-12 rounded-[4rem] border-rose-500/20 bg-rose-500/[0.02] cursor-pointer group hover:bg-rose-500/[0.05] transition-all shadow-2xl"
            intensity={1.2}
          >
            <div className="flex items-center justify-between mb-10">
               <div className="p-4 bg-rose-500/10 rounded-2xl text-rose-400 group-hover:scale-110 transition-transform">
                  <Heart size={32} fill="currentColor" className="opacity-80" />
               </div>
               <ChevronRight size={22} className="text-rose-500/40 group-hover:text-rose-400 transition-colors" />
            </div>
            <h3 className="text-2xl font-black italic text-white uppercase tracking-tight mb-4">{t.funding}</h3>
            <p className="text-xs text-slate-500 leading-relaxed italic font-medium opacity-80">{t.fundingDesc}</p>
          </GlassCard>
        </div>

        {/* ECO SYSTEM SECTION */}
        <div className="space-y-8">
           <div className="flex items-center gap-4 px-6">
              <Zap size={18} className="text-indigo-400" />
              <h2 className="text-xs font-black uppercase text-slate-600 tracking-[0.3em] italic">System Ecosystem Nodes</h2>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard className="p-10 rounded-[3rem] border-white/5 flex gap-8 items-start bg-slate-900/40">
                 <div className="p-4 bg-slate-950 rounded-2xl text-slate-600 shrink-0 shadow-inner"><Monitor size={28} /></div>
                 <div className="space-y-2">
                    <h4 className="text-base font-black text-white italic uppercase">{t.pcTitle}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed italic font-medium opacity-80">{t.pcDesc}</p>
                 </div>
              </GlassCard>
              <GlassCard className="p-10 rounded-[3rem] border-white/5 flex gap-8 items-start bg-slate-900/40">
                 <div className="p-4 bg-slate-950 rounded-2xl text-slate-600 shrink-0 shadow-inner"><Smartphone size={28} /></div>
                 <div className="space-y-2">
                    <h4 className="text-base font-black text-white italic uppercase">{t.mobileTitle}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed italic font-medium opacity-80">{t.mobileDesc}</p>
                 </div>
              </GlassCard>
           </div>
        </div>

        <AnimatePresence>
          {showDonation && (
            <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl overflow-y-auto" onClick={() => setShowDonation(false)}>
              <m.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} 
                onClick={(e: React.MouseEvent) => e.stopPropagation()} 
                className="w-full max-w-2xl text-center space-y-12 relative bg-[#01040a] p-10 md:p-16 rounded-[5rem] border border-white/10 shadow-[0_60px_150px_-30px_rgba(0,0,0,1)]"
              >
                <button 
                  onClick={() => setShowDonation(false)}
                  className="absolute top-10 right-10 p-4 bg-white/5 hover:bg-rose-500/20 rounded-2xl text-slate-600 hover:text-rose-500 transition-all active:scale-90"
                >
                  <X size={24} />
                </button>

                <div className="space-y-12">
                  <m.div 
                    animate={{ scale: [1, 1.1, 1] }} 
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="w-28 h-28 rounded-[2.5rem] bg-[#f43f5e] flex items-center justify-center text-white shadow-[0_0_80px_rgba(244,63,94,0.4)] mx-auto relative group"
                  >
                     <Heart size={50} fill="white" strokeWidth={0} />
                     <div className="absolute inset-0 bg-white/10 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  </m.div>

                  <div className="space-y-6">
                     <h2 className="text-5xl md:text-7xl font-black italic text-white uppercase tracking-tighter leading-[0.85]">
                       CONTRIBUTION<br />
                       <span className="text-indigo-400">ACKNOWLEDGED</span>
                     </h2>
                     <p className="text-sm md:text-base text-slate-500 italic max-w-md mx-auto leading-relaxed font-bold opacity-80">
                       {t.donateSubtitle}
                     </p>
                  </div>

                  <div className="w-full grid grid-cols-1 md:grid-cols-5 gap-10 items-start">
                    <div className="md:col-span-2 space-y-8 flex flex-col items-center">
                       <div className="p-8 bg-white rounded-[4rem] shadow-[0_40px_80px_rgba(255,255,255,0.05)] ring-8 ring-white/5 overflow-hidden">
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent('https://paypal.me/vyncuslim')}&color=000000&bgcolor=ffffff&margin=4&ecc=M`} 
                            alt="Lab Ingress" 
                            className="w-40 h-40 md:w-52 md:h-52 [image-rendering:pixelated]" 
                          />
                       </div>
                       <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.5em] flex items-center gap-3 italic">
                         <QrCode size={16} /> SCAN TO PAYPAL
                       </p>
                    </div>

                    <div className="md:col-span-3 space-y-5 text-left">
                      {[
                        { id: 'duitnow', label: 'TNG / DUITNOW', value: '+60 187807388' }, 
                        { id: 'paypal', label: 'PAYPAL DISPATCH', value: 'vyncuslim@icloud.com' },
                        { id: 'support_email', label: 'SUPPORT NODE', value: 'support@sleepsomno.com' },
                        { id: 'info_email', label: 'INFO NODE', value: 'info@sleepsomno.com' },
                        { id: 'admin_email', label: 'ADMIN NODE', value: 'admin@sleepsomno.com' }
                      ].map((item) => (
                        <div key={item.id} className="p-8 bg-slate-900 border border-white/5 rounded-[2.5rem] flex items-center justify-between group hover:border-indigo-500/40 transition-all shadow-inner">
                          <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">{item.label}</p>
                            <p className="text-base font-black text-white italic tracking-tight truncate max-w-[190px]">{item.value}</p>
                          </div>
                          <button 
                            onClick={() => handleCopy(item.id, item.value)} 
                            className={`p-4 rounded-2xl transition-all active:scale-90 ${copiedId === item.id ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-700 hover:text-white bg-black/40'}`}
                          >
                             {copiedId === item.id ? <Check size={20} /> : <Copy size={20} />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </m.div>
            </div>
          )}
        </AnimatePresence>

        <footer className="pt-20 text-center opacity-40">
           <button 
             onClick={onBack}
             className="px-16 py-7 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-black text-[11px] uppercase tracking-widest transition-all italic shadow-2xl active:scale-95 uppercase"
           >
             Return to Terminal
           </button>
        </footer>
      </div>
    </div>
  );
};