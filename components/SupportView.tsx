
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
          {/* Tech Support */}
          <GlassCard 
            onClick={() => onNavigate('feedback')}
            className="p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border-white/5 cursor-pointer group hover:bg-indigo-600/[0.02] transition-all"
            intensity={1.2}
          >
            <div className="flex items-center justify-between mb-6 md:mb-8">
               <div className="p-3 md:p-4 bg-indigo-500/10 rounded-xl md:rounded-2xl text-indigo-400 group-hover:scale-110 transition-transform">
                  {/* Fix: Removed non-existent md:size prop */}
                  <LifeBuoy size={24} />
               </div>
               <ChevronRight size={18} className="text-slate-700 group-hover:text-indigo-400 transition-colors" />
            </div>
            <h3 className="text-lg md:text-xl font-black italic text-white uppercase tracking-tight mb-3 md:mb-4">{t.techSupport}</h3>
            <p className="text-[10px] md:text-xs text-slate-500 leading-relaxed italic">{t.techDesc}</p>
          </GlassCard>

          {/* Funding / Donation */}
          <GlassCard 
            onClick={() => setShowDonation(true)}
            className="p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border-rose-500/20 bg-rose-500/[0.02] cursor-pointer group hover:bg-rose-500/[0.05] transition-all"
            intensity={1.2}
          >
            <div className="flex items-center justify-between mb-6 md:mb-8">
               <div className="p-3 md:p-4 bg-rose-500/10 rounded-xl md:rounded-2xl text-rose-400 group-hover:scale-110 transition-transform">
                  {/* Fix: Removed non-existent md:size prop */}
                  <Heart size={24} fill="currentColor" className="opacity-80" />
               </div>
               <ChevronRight size={18} className="text-rose-500/40 group-hover:text-rose-400 transition-colors" />
            </div>
            <h3 className="text-lg md:text-xl font-black italic text-white uppercase tracking-tight mb-3 md:mb-4">{t.funding}</h3>
            <p className="text-[10px] md:text-xs text-slate-500 leading-relaxed italic">{t.fundingDesc}</p>
          </GlassCard>
        </div>

        {/* Platform Support Section */}
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

        {/* FAQ Section */}
        <div className="space-y-4 md:space-y-6">
           <div className="flex items-center gap-3 px-4">
              <HelpCircle size={16} className="text-slate-600" />
              <h2 className="text-[9px] md:text-[11px] font-black uppercase text-slate-500 tracking-[0.2em] md:tracking-[0.3em]">{t.faq}</h2>
           </div>
           
           <div className="space-y-3 md:space-y-4">
              {faqItems.map((item, i) => (
                <GlassCard key={i} className="p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border-white/5">
                   <h4 className="text-xs md:text-sm font-black text-indigo-400 italic mb-2 md:mb-3 flex items-center gap-2 md:gap-3">
                      <span className="text-[8px] md:text-[10px] font-mono opacity-40">0{i+1}</span>
                      {item.q}
                   </h4>
                   <p className="text-[11px] md:text-xs text-slate-400 leading-relaxed italic ml-6 md:ml-8">{item.a}</p>
                </GlassCard>
              ))}
           </div>
        </div>

        {/* Contact Info */}
        <div className="p-6 md:p-10 bg-slate-900/40 border border-white/5 rounded-[2.5rem] md:rounded-[4rem] flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
           <div className="flex items-center gap-4 md:gap-6">
              <div className="p-3 md:p-4 bg-emerald-500/10 rounded-xl md:rounded-2xl text-emerald-400">
                 {/* Fix: Removed non-existent md:size prop */}
                 <Mail size={20} />
              </div>
              <div className="space-y-0.5 md:space-y-1 text-center md:text-left">
                 <p className="text-[8px] md:text-[9px] font-black text-slate-600 uppercase tracking-widest">Developer Network</p>
                 <p className="text-sm md:text-base font-black text-white italic">ongyuze1401@gmail.com</p>
              </div>
           </div>
           <button 
             onClick={() => window.open('mailto:ongyuze1401@gmail.com')}
             className="w-full md:w-auto px-10 py-3.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all italic flex items-center justify-center gap-2"
           >
             <ExternalLink size={14} /> Send Message
           </button>
        </div>

        {/* Donation Modal Overlay */}
        <AnimatePresence>
          {showDonation && (
            <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 md:p-6 bg-[#020617]/95 backdrop-blur-3xl overflow-y-auto" onClick={() => setShowDonation(false)}>
              <m.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} 
                onClick={(e: React.MouseEvent) => e.stopPropagation()} 
                className="w-full max-w-2xl text-center space-y-6 md:space-y-10 relative bg-slate-950 p-6 md:p-10 rounded-[3rem] md:rounded-[4rem] border border-white/5 max-h-[90vh] overflow-y-auto no-scrollbar shadow-[0_0_100px_rgba(0,0,0,0.8)]"
              >
                {/* Close Icon Button */}
                <button 
                  onClick={() => setShowDonation(false)}
                  className="absolute top-4 right-4 md:top-6 md:right-6 p-3 md:p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-500 hover:text-white transition-all border border-white/5 shadow-2xl active:scale-90"
                >
                  <X size={20} />
                </button>

                <div className="pt-4">
                  <m.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-[#f43f5e] flex items-center justify-center text-white shadow-[0_0_50px_rgba(244,63,94,0.5)] mx-auto mb-6">
                     {/* Fix: Removed non-existent md:size prop */}
                     <Coffee size={32} fill="white" strokeWidth={1} />
                  </m.div>
                  <div className="space-y-2 md:space-y-4">
                     <h2 className="text-3xl md:text-5xl font-black italic text-white uppercase tracking-tighter leading-none">{t.donateTitle}</h2>
                     <p className="text-[11px] md:text-[13px] text-slate-400 italic max-w-xs md:max-w-md mx-auto leading-relaxed">{t.donateSubtitle}</p>
                  </div>
                </div>

                <div className="w-full grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-8 items-start pb-4">
                  <div className="md:col-span-2 p-6 md:p-8 bg-slate-900/80 border border-white/5 rounded-[2.5rem] md:rounded-[3rem] flex flex-col items-center gap-4 md:gap-6">
                     {/* QR Code Optimized: Deep Contrast, moderate ECC (M), and explicit pixel rendering for maximum scannability */}
                     <div className="bg-white p-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(255,255,255,0.1)] border border-white/10 ring-4 ring-white/5">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent('https://paypal.me/vyncuslim')}&color=000000&bgcolor=ffffff&margin=4&ecc=M`} 
                          alt="Contribution QR Code" 
                          className="w-48 h-48 md:w-56 md:h-56 [image-rendering:pixelated]" 
                        />
                     </div>
                     <p className="text-[8px] md:text-[10px] font-black text-[#f43f5e] uppercase tracking-[0.2em] md:tracking-[0.3em] flex items-center gap-2"><QrCode size={12} /> SCAN TO PAYPAL</p>
                  </div>
                  <div className="md:col-span-3 space-y-3 md:space-y-4 text-left">
                    {[
                      { id: 'duitnow', label: 'DUITNOW / TNG (MY)', value: '+60 187807388' }, 
                      { id: 'paypal', label: 'PAYPAL (GLOBAL)', value: 'Vyncuslim vyncuslim' }
                    ].map((item) => (
                      <div key={item.id} className="p-4 md:p-6 bg-slate-900/50 border border-white/5 rounded-[1.8rem] md:rounded-[2.2rem] flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                        <div className="space-y-0.5 md:space-y-1">
                          <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest">{item.label}</p>
                          <p className="text-[14px] md:text-base font-black text-white italic tracking-tight">{item.value}</p>
                        </div>
                        <button onClick={() => handleCopy(item.id, item.value)} className={`p-3 md:p-4 rounded-xl md:rounded-2xl transition-all ${copiedId === item.id ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-600 hover:text-white bg-white/5'}`}>
                           {copiedId === item.id ? <Check size={18} /> : <Copy size={18} />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-3 md:gap-4 pt-4 sticky bottom-0 bg-slate-950 py-2">
                   <button onClick={() => setShowDonation(false)} className="order-2 md:order-1 px-10 py-4 md:py-6 border border-white/10 text-slate-500 rounded-full font-black text-xs md:text-sm uppercase tracking-widest active:scale-95 transition-all hover:text-white">CLOSE</button>
                   <button onClick={() => window.open('https://paypal.me/vyncuslim', '_blank')} className="order-1 md:order-2 flex-1 py-4 md:py-6 rounded-full bg-[#4f46e5] text-white font-black text-xs md:text-sm uppercase tracking-[0.3em] md:tracking-[0.4em] flex items-center justify-center gap-3 md:gap-4 shadow-2xl transition-all active:scale-95 hover:bg-indigo-500">
                      <ArrowUpRight size={18} /> GO TO PAYPAL
                   </button>
                </div>
              </m.div>
            </div>
          )}
        </AnimatePresence>

        <footer className="pt-12 text-center opacity-30">
           <button 
             onClick={onBack}
             className="px-10 md:px-12 py-4 md:py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-black text-[10px] md:text-[12px] uppercase tracking-widest transition-all italic shadow-2xl active:scale-95"
           >
             {t.backToLab}
           </button>
        </footer>
      </div>
    </div>
  );
};
