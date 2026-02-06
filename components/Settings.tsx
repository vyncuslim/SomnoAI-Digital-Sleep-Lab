import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard.tsx';
import { 
  Heart, Copy, QrCode, ArrowUpRight, LogOut as DisconnectIcon, 
  Bell, RefreshCw, Zap, MessageSquare, Mail, ChevronRight, Check, ShieldCheck, Globe, LifeBuoy
} from 'lucide-react';
import { Language, translations } from '../services/i18n.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { notificationService } from '../services/notificationService.ts';

const m = motion as any;

interface SettingsProps {
  lang: Language;
  onLanguageChange: (l: Language) => void;
  onLogout: () => void;
  onNavigate: (view: any) => void;
}

export const Settings: React.FC<SettingsProps> = ({ 
  lang, onLanguageChange, onLogout, onNavigate
}) => {
  const [showDonation, setShowDonation] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAiActive, setIsAiActive] = useState(false);
  const [notifPermission, setNotifPermission] = useState<string>(Notification.permission);

  const t = translations[lang]?.settings || translations.en.settings;
  const isZh = lang === 'zh';

  const networkNodes = [
    { id: 'admin', email: 'admin@sleepsomno.com', label: isZh ? '管理节点' : 'Admin Node', icon: ShieldCheck },
    { id: 'contact', email: 'contact@sleepsomno.com', label: isZh ? '主联络处' : 'Lab Dispatch', icon: Globe },
    { id: 'info', email: 'info@sleepsomno.com', label: isZh ? '信息中心' : 'Info Hub', icon: Mail },
    { id: 'support', email: 'support@sleepsomno.com', label: isZh ? '技术支持' : 'Tech Support', icon: LifeBuoy }
  ];

  useEffect(() => {
    const checkAiStatus = async () => {
      if ((window as any).aistudio?.hasSelectedApiKey) {
        try {
          const hasKey = await (window as any).aistudio.hasSelectedApiKey();
          setIsAiActive(hasKey || !!process.env.API_KEY);
        } catch (e) {
          setIsAiActive(!!process.env.API_KEY);
        }
      } else {
        setIsAiActive(!!process.env.API_KEY);
      }
    };
    checkAiStatus();
  }, []);

  const handleRequestNotif = async () => {
    const granted = await notificationService.requestPermission();
    setNotifPermission(Notification.permission);
    if (granted) {
      notificationService.sendNotification("SomnoAI Connected", "Neural bridge active. System notifications enabled.");
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-10 pb-48 max-w-3xl mx-auto px-4 font-sans text-left relative overflow-hidden">
      <header className="flex flex-col gap-2 pt-8">
        <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none">{t.title}</h1>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic">System Preferences & Node Configuration</p>
      </header>

      <div className="flex flex-col gap-6">
        {/* Status Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassCard className="p-6 rounded-[2.5rem] border-indigo-500/20 bg-indigo-500/5">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${isAiActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                <Zap size={20} className={isAiActive ? 'animate-pulse' : ''} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Neural Bridge</p>
                <p className="text-sm font-black text-white italic">{isAiActive ? 'STABLE' : 'OFFLINE'}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 rounded-[2.5rem] border-white/5">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${notifPermission === 'granted' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-900 text-slate-600'}`}>
                    <Bell size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Notifications</p>
                    <p className="text-sm font-black text-white italic">{notifPermission.toUpperCase()}</p>
                  </div>
                </div>
                {notifPermission !== 'granted' && (
                  <button onClick={handleRequestNotif} className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all">
                    <RefreshCw size={16} />
                  </button>
                )}
             </div>
          </GlassCard>
        </div>

        {/* Primary Support & Feedback Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassCard className="p-8 rounded-[3rem] border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all group cursor-pointer" onClick={() => window.location.href = 'mailto:contact@sleepsomno.com'}>
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                   <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                     <Mail size={24} />
                   </div>
                   <div className="space-y-1">
                     <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">{isZh ? '邮件支持' : 'Email Support'}</p>
                     <p className="text-base font-black text-white italic tracking-tighter leading-none">contact@sleepsomno.com</p>
                   </div>
                </div>
                <ArrowUpRight size={18} className="text-slate-700 group-hover:text-indigo-400 transition-colors" />
             </div>
          </GlassCard>

          <GlassCard className="p-8 rounded-[3rem] border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all group cursor-pointer" onClick={() => onNavigate('feedback')}>
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                   <div className="p-4 bg-rose-500/10 rounded-2xl text-rose-400 border border-rose-500/20 group-hover:scale-110 transition-transform">
                     <MessageSquare size={24} />
                   </div>
                   <div className="space-y-1">
                     <p className="text-[10px] font-black uppercase text-rose-400 tracking-widest">{isZh ? '反馈建议' : 'Feedback'}</p>
                     <p className="text-base font-black text-white italic tracking-tighter leading-none">{isZh ? '提交异常报告' : 'Submit Anomalies'}</p>
                   </div>
                </div>
                <ChevronRight size={18} className="text-slate-700 group-hover:text-rose-400 transition-colors" />
             </div>
          </GlassCard>
        </div>

        {/* Global Network Matrix */}
        <GlassCard className="p-10 rounded-[4rem] border-white/5 bg-black/20 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-10 opacity-[0.02] text-white pointer-events-none transform rotate-12">
              <Globe size={300} strokeWidth={1} />
           </div>
           
           <div className="flex items-center gap-3 mb-10 relative z-10">
              <Globe size={18} className="text-indigo-400" />
              <h3 className="text-[11px] font-black uppercase text-white tracking-[0.3em] italic">{isZh ? '通信网络矩阵' : 'Communication Matrix'}</h3>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
              {networkNodes.map((node) => (
                <div key={node.id} className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-between group hover:border-indigo-500/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-slate-900 rounded-xl text-slate-500 group-hover:text-indigo-400 transition-colors">
                      <node.icon size={16} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{node.label}</p>
                      <p className="text-[11px] font-mono font-bold text-slate-300 italic">{node.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleCopy(node.id, node.email)}
                    className={`p-2.5 rounded-xl transition-all ${copiedId === node.id ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-700 hover:text-white bg-white/5'}`}
                  >
                    {copiedId === node.id ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              ))}
           </div>

           <div className="mt-10 pt-8 border-t border-white/5 flex items-center gap-3 px-2 relative z-10">
              <ShieldCheck size={14} className="text-emerald-500" />
              <p className="text-[10px] text-slate-500 italic leading-relaxed">
                {isZh ? '所有通信均通过 SomnoAI 加密网关处理。' : 'All communications processed via SomnoAI encrypted gateway.'}
              </p>
           </div>
        </GlassCard>

        {/* Core Control Center */}
        <GlassCard className="p-10 rounded-[4rem] border-white/10 bg-white/[0.01]">
          <div className="space-y-12">
            <div className="space-y-4">
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic px-2">{t.language}</span>
               <div className="flex bg-black/40 p-1.5 rounded-full border border-white/5">
                  {['en', 'zh'].map((l) => (
                    <button key={l} onClick={() => onLanguageChange(l as Language)} className={`flex-1 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${lang === l ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}>
                      {l === 'en' ? 'ENGLISH' : '中文简体'}
                    </button>
                  ))}
               </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
               <button onClick={() => setShowDonation(true)} className="w-full py-7 rounded-full bg-[#f43f5e]/5 border border-[#f43f5e]/20 text-[#f43f5e] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-rose-950/10 hover:bg-[#f43f5e]/10">
                 <Heart size={20} fill="currentColor" /> {t.coffee}
               </button>
               <button onClick={onLogout} className="w-full py-7 rounded-full bg-slate-900 border border-white/5 text-slate-500 font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all hover:text-rose-500 hover:border-rose-500/20">
                 <DisconnectIcon size={18} /> {t.logout}
               </button>
            </div>
          </div>
        </GlassCard>
      </div>

      <AnimatePresence>
        {showDonation && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-[#020617]/95 backdrop-blur-3xl" onClick={() => setShowDonation(false)}>
            <m.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e: React.MouseEvent) => e.stopPropagation()} className="w-full max-w-2xl text-center space-y-10">
              <m.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 4, repeat: Infinity }} className="w-24 h-24 rounded-full bg-[#f43f5e] flex items-center justify-center text-white shadow-[0_0_50px_rgba(244,63,94,0.5)] mx-auto"><Heart size={48} fill="white" strokeWidth={0} /></m.div>
              <div className="space-y-4"><h2 className="text-5xl font-black italic text-white uppercase tracking-tighter leading-none">CONTRIBUTION<br />ACKNOWLEDGED</h2><p className="text-[13px] text-slate-400 italic max-w-md mx-auto leading-relaxed">Your support fuels lab processing and research development.</p></div>
              <div className="w-full grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
                <div className="md:col-span-2 p-8 bg-slate-900/80 border border-white/5 rounded-[3rem] flex flex-col items-center gap-6">
                   <div className="bg-white p-5 rounded-[2.5rem] shadow-sm"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent('https://paypal.me/vyncuslim')}&color=020617&bgcolor=ffffff`} alt="QR" className="w-36 h-36 md:w-44 md:h-44" /></div>
                   <p className="text-[10px] font-black text-[#f43f5e] uppercase tracking-[0.3em] flex items-center gap-2 italic"><QrCode size={14} /> SCAN TO PAYPAL</p>
                </div>
                <div className="md:col-span-3 space-y-4 text-left">
                  {[
                    { id: 'duitnow', label: 'DUITNOW / TNG', value: '+60 187807388', icon: Copy }, 
                    { id: 'paypal', label: 'PAYPAL', value: 'Vyncuslim vyncuslim', icon: Copy },
                    { id: 'support-mail', label: isZh ? '邮件支持' : 'EMAIL SUPPORT', value: 'contact@sleepsomno.com', icon: Mail, action: () => window.location.href = 'mailto:contact@sleepsomno.com' },
                    { id: 'feedback-node', label: isZh ? '反馈建议' : 'SYSTEM FEEDBACK', value: isZh ? '提交异常报告' : 'Submit Anomalies', icon: MessageSquare, action: () => { setShowDonation(false); onNavigate('feedback'); } }
                  ].map((item) => (
                    <div key={item.id} className="p-6 bg-slate-900/50 border border-white/5 rounded-[2.2rem] flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{item.label}</p>
                        <p className="text-base font-black text-white italic tracking-tight leading-none truncate max-w-[180px]">{item.value}</p>
                      </div>
                      <button 
                        onClick={() => item.action ? item.action() : handleCopy(item.id, item.value)} 
                        className={`p-4 rounded-2xl transition-all active:scale-90 ${copiedId === item.id ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-600 hover:text-white bg-white/5'}`}
                      >
                        {item.id.includes('mail') || item.id.includes('feedback') ? <ArrowUpRight size={20} /> : (copiedId === item.id ? <Check size={20} /> : <Copy size={20} />)}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => window.open('https://paypal.me/vyncuslim', '_blank')} className="w-full py-6 rounded-full bg-[#4f46e5] text-white font-black text-sm uppercase tracking-[0.4em] flex items-center justify-center gap-4 shadow-2xl transition-transform active:scale-95 italic"><ArrowUpRight size={20} /> GO TO PAYPAL PAGE</button>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};