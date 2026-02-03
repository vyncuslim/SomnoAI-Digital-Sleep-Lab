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

  const faqItems = [
    { 
      q: lang === 'zh' ? '为什么同步报 403 错误？' : 'Why am I getting a 403 error during sync?', 
      a: lang === 'zh' ? '这通常意味着 Google Analytics 权限未配置。请联系管理员或前往配置页查看诊断信息。' : 'This usually means Google Analytics permissions aren\'t configured. Check the Admin diagnostic panel for details.' 
    },
    { 
      q: lang === 'zh' ? '我的数据存储在哪里？' : 'Where is my data stored?', 
      a: lang === 'zh' ? 'SomnoAI 采用边缘存储架构。您的生理数据仅存储在浏览器会话中，绝不上传到后台。' : 'SomnoAI uses edge storage. Your biometric data is stored only in your browser session and never uploaded to our servers.' 
    },
    { 
      q: lang === 'zh' ? '如何获取个人 API Key？' : 'How do I get a personal API Key?', 
      a: lang === 'zh' ? '您可以前往 Google AI Studio 免费申请 Gemini API Key 以启用 AI 分析功能。' : 'You can apply for a free Gemini API Key at Google AI Studio to enable personalized AI insights.' 
    }
  ];

  return (
    <div className="min-h-screen pt-4 pb-32 animate-in fade-in slide-in-from-right-4 duration-500 font-sans text-left">
      <header className="flex items-center gap-4 md:gap-6 mb-8 md:mb-12 px-2 max-w-4xl mx-auto">
        <button 
          onClick={onBack}
          className="p-3 md:p-4 bg-white/5 hover:bg-white/10 rounded-2xl md:rounded-3xl text-slate-400 hover:text-white transition-all border border-white/5 shadow-lg active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter text-white uppercase leading-none">
            {t.title}
          </h1>
          <p className="text-[8px] md:text-[10px] text-slate-500 font-mono font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] mt-1.5 md:mt-2">
            {t.subtitle}
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto space-y-6 md:space-y-10 px-2">
        {/* Core Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          <GlassCard 
            onClick={() => onNavigate('feedback')}
            className="p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border-white/5 cursor-pointer group hover:bg-indigo-600/[0.02] transition-all"
            intensity={1.2}
          >
            <div className="flex items-center justify-between mb-6 md:mb-8">
               <div className="p-3 md:p-4 bg-indigo-500/10 rounded-xl md:rounded-2xl text-indigo-400 group-hover:scale-110 transition-transform">
                  <LifeBuoy size={24} />
               </div>
               <ChevronRight size={18} className="text-slate-700 group-hover:text-indigo-400 transition-colors" />
            </div>
            <h3 className="text-lg md:text-xl font-black italic text-white uppercase tracking-tight mb-3 md:mb-4">{t.techSupport}</h3>
            <p className="text-[10px] md:text-xs text-slate-500 leading-relaxed italic">{t.techDesc}</p>
          </GlassCard>

          <GlassCard 
            onClick={() => setShowDonation(true)}
            className="p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border-rose-500/20 bg-rose-500/[0.02] cursor-pointer group hover:bg-rose-500/[0.05] transition-all"
            intensity={1.2}
          >
            <div className="flex items-center justify-between mb-6 md:mb-8">
               <div className="p-3 md:p-4 bg-rose-500/10 rounded-xl md:rounded-2xl text-rose-400 group-hover:scale-110 transition-transform">
                  <Heart size={24} fill="currentColor" className="opacity-80" />
               </div>
               <ChevronRight size={18} className="text-rose-500/40 group-hover:text-rose-400 transition-colors" />
            </div>
            <h3 className="text-lg md:text-xl font-black italic text-white uppercase tracking-tight mb-3 md:mb-4">{t.funding}</h3>
            <p className="text-[10px] md:text-xs text-slate-500 leading-relaxed italic">{t.fundingDesc}</p>
          </GlassCard>
        </div>

        <div className="space-y-6">
           <div className="flex items-center gap-3 px-4">
              <Zap size={16} className="text-indigo-400" />
              <h2 className="text-[9px] md:text-[11px] font-black uppercase text-slate-500 tracking-[0.2em] md:tracking-[0.3em]">{t.platforms}</h2>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GlassCard className="p-8 rounded-[2.5rem] border-white/5 flex gap-6 items-start">
                 <div className="p-3 bg-white/5 rounded-2xl text-slate-400 shrink-0"><Monitor size={24} /></div>
                 <div className="space-y-2">
                    <h4 className="text-sm font-black text-white italic uppercase">{t.pcTitle}</h4>
                    <p className="text-[10px] md:text-xs text-slate-500 leading-relaxed italic">{t.pcDesc}</p>
                 </div>
              </GlassCard>
              <GlassCard className="p-8 rounded-[2.5rem] border-white/5 flex gap-6 items-start">
                 <div className="p-3 bg-white/5 rounded-2xl text-slate-400 shrink-0"><Smartphone size={24} /></div>
                 <div className="space-y-2">
                    <h4 className="text-sm font-black text-white italic uppercase">{t.mobileTitle}</h4>
                    <p className="text-[10px] md:text-xs text-slate-500 leading-relaxed italic">{t.mobileDesc}</p>
                 </div>
              </GlassCard>
           </div>
        </div>

        <AnimatePresence>
          {showDonation && (
            <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 md:p-6 bg-[#020617]/98 backdrop-blur-3xl overflow-y-auto" onClick={() => setShowDonation(false)}>
              <m.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} 
                onClick={(e: React.MouseEvent) => e.stopPropagation()} 
                className="w-full max-w-2xl text-center space-y-10 relative bg-[#020617] p-8 md:p-14 rounded-[4rem] border border-white/10 shadow-[0_0_120px_rgba(0,0,0,1)]"
              >
                <button 
                  onClick={() => setShowDonation(false)}
                  className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-rose-500/20 rounded-2xl text-slate-500 hover:text-rose-500 transition-all active:scale-90"
                >
                  <X size={20} />
                </button>

                <div className="space-y-10">
                  <m.div 
                    animate={{ scale: [1, 1.1, 1] }} 
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="w-24 h-24 rounded-full bg-[#f43f5e] flex items-center justify-center text-white shadow-[0_0_60px_rgba(244,63,94,0.4)] mx-auto relative group"
                  >
                     <Heart size={44} fill="white" strokeWidth={0} />
                     <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  </m.div>

                  <div className="space-y-6">
                     <h2 className="text-4xl md:text-6xl font-black italic text-white uppercase tracking-tighter leading-[0.9]">
                       CONTRIBUTION<br />
                       <span className="text-indigo-400">ACKNOWLEDGED</span>
                     </h2>
                     <p className="text-[12px] md:text-[14px] text-slate-400 italic max-w-md mx-auto leading-relaxed font-medium">
                       Your support fuels lab processing. Payment details follow <span className="text-white">(English Default)</span>:
                     </p>
                  </div>

                  <div className="w-full grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
                    <div className="md:col-span-2 space-y-6 flex flex-col items-center">
                       <GlassCard className="p-6 bg-white rounded-[3rem] shadow-[0_20px_60px_rgba(255,255,255,0.05)] ring-8 ring-white/5">
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent('https://paypal.me/vyncuslim')}&color=000000&bgcolor=ffffff&margin=4&ecc=M`} 
                            alt="Lab QR Ingress" 
                            className="w-36 h-36 md:w-44 md:h-44 [image-rendering:pixelated]" 
                          />
                       </GlassCard>
                       <p className="text-[9px] font-black text-[#f43f5e] uppercase tracking-[0.4em] flex items-center gap-2 italic">
                         <QrCode size={14} /> SCAN TO PAYPAL
                       </p>
                    </div>

                    <div className="md:col-span-3 space-y-4 text-left">
                      {[
                        { id: 'duitnow', label: 'DUITNOW / TNG', value: '+60 187807388' }, 
                        { id: 'paypal', label: 'PAYPAL', value: 'Vyncuslim vyncuslim' }
                      ].map((item) => (
                        <div key={item.id} className="p-6 bg-slate-900/60 border border-white/10 rounded-[2.5rem] flex items-center justify-between group hover:border-indigo-500/40 transition-all shadow-xl">
                          <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{item.label}</p>
                            <p className="text-lg font-black text-white italic tracking-tight leading-none">{item.value}</p>
                          </div>
                          <button 
                            onClick={() => handleCopy(item.id, item.value)} 
                            className={`p-4 rounded-2xl transition-all active:scale-90 ${copiedId === item.id ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-600 hover:text-white bg-white/5'}`}
                          >
                             {copiedId === item.id ? <Check size={20} /> : <Copy size={20} />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4">
                     <button 
                       onClick={() => window.open('https://paypal.me/vyncuslim', '_blank')} 
                       className="w-full py-7 rounded-full bg-[#4f46e5] text-white font-black text-xs uppercase tracking-[0.5em] flex items-center justify-center gap-4 shadow-[0_20px_50px_rgba(79,70,229,0.3)] transition-all active:scale-95 hover:bg-indigo-500 italic"
                     >
                        <ExternalLink size={20} /> GO TO PAYPAL PAGE
                     </button>
                  </div>
                </div>
              </m.div>
            </div>
          )}
        </AnimatePresence>

        <footer className="pt-12 text-center opacity-30">
           <button 
             onClick={onBack}
             className="px-12 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-black text-xs uppercase tracking-widest transition-all italic shadow-2xl active:scale-95"
           >
             {t.backToLab}
           </button>
        </footer>
      </div>
    </div>
  );
};