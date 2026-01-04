
import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard.tsx';
import { 
  Shield, Smartphone, Globe, LogOut, 
  ChevronRight, ShieldCheck, FileText, Info, MessageSquare, Github, AlertTriangle, Cpu, Activity, Binary, Radio, Languages as LangIcon, Globe2, Wallet, Heart, Coffee, ExternalLink, QrCode, Copy, Smartphone as MobileIcon, CreditCard
} from 'lucide-react';
import { Language, translations } from '../services/i18n.ts';
import { ViewType } from '../types.ts';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsProps {
  lang: Language;
  onLanguageChange: (l: Language) => void;
  onLogout: () => void;
  onNavigate: (view: ViewType | 'privacy' | 'terms') => void;
}

export const Settings: React.FC<SettingsProps> = ({ lang, onLanguageChange, onLogout, onNavigate }) => {
  const t = translations[lang].settings;
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [telemetry, setTelemetry] = useState("0x000000");
  const [copyToast, setCopyToast] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const hex = Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(6, '0');
      setTelemetry(`0x${hex}`);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyToast(t.copySuccess);
    setTimeout(() => setCopyToast(null), 2000);
  };

  const SettingItem = ({ icon: Icon, label, value, href, onClick, badge, statusColor = 'indigo' }: any) => {
    const isExternal = !!href;
    const content = (
      <div className="w-full flex items-center justify-between py-5 px-6 group transition-all active:scale-[0.98] cursor-pointer relative overflow-hidden">
        <div className="flex items-center gap-5 relative z-10">
          <div className={`p-3 rounded-2xl bg-${statusColor}-500/10 text-${statusColor}-400 group-hover:scale-110 group-hover:bg-${statusColor}-500/20 transition-all duration-300 shadow-lg border border-${statusColor}-500/10`}>
            <Icon size={20} />
          </div>
          <div className="text-left space-y-0.5">
            <p className="font-bold text-slate-100 group-hover:text-white transition-colors tracking-tight">{label}</p>
            <div className="flex items-center gap-2">
              <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-400 transition-colors">
                {value}
              </p>
              {badge && (
                <motion.span 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`px-1.5 py-0.5 bg-${statusColor}-500/20 text-${statusColor}-400 text-[7px] font-black rounded-md border border-${statusColor}-500/20 uppercase tracking-tighter`}
                >
                  {badge}
                </motion.span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 relative z-10">
          {onClick && <Copy size={14} className="text-slate-600 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all" />}
          {isExternal && <ExternalLink size={14} className="text-slate-600 group-hover:text-indigo-400 transition-all" />}
          {!onClick && !isExternal && <ChevronRight size={16} className="text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />}
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/[0.03] to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>
    );

    return isExternal ? (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block w-full">{content}</a>
    ) : (
      <button onClick={onClick} className="block w-full text-left outline-none">{content}</button>
    );
  };

  return (
    <div className="space-y-10 pb-32 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <header className="px-2 space-y-1">
        <div className="flex items-center gap-3 mb-1">
          <motion.div 
            animate={{ height: [24, 32, 24] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 bg-indigo-500 rounded-full shadow-[0_0_12px_rgba(79,70,229,0.8)]" 
          />
          <h1 className="text-3xl font-black tracking-tighter text-white italic">{t.title}</h1>
        </div>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] px-4">{t.subtitle}</p>
      </header>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-4">
           <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">{t.language}</h3>
           <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
              <span className="text-[8px] font-mono font-bold text-indigo-400 uppercase tracking-widest">{lang === 'zh' ? '神经链路' : 'Neural Link'}: {lang.toUpperCase()}</span>
           </div>
        </div>
        <GlassCard className="divide-y divide-white/5 border-indigo-500/20 bg-indigo-500/[0.02]">
          <div className="w-full py-8 px-6 space-y-6">
            <div className="flex items-center gap-5">
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 shadow-inner">
                <LangIcon size={20} />
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-100 tracking-tight">{t.language}</p>
                <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mt-0.5">{lang === 'zh' ? '全球本地化模块' : 'Global Localization Module'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-950/80 rounded-[1.75rem] border border-white/5 shadow-inner relative overflow-hidden group/lang-grid">
              <button 
                onClick={() => onLanguageChange('en')}
                className={`relative flex items-center justify-center gap-3 py-4 rounded-[1.25rem] transition-all duration-500 overflow-hidden ${lang === 'en' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {lang === 'en' && (
                  <motion.div layoutId="activeLangIndicator" className="absolute inset-0 bg-indigo-600 shadow-[0_0_30px_rgba(79,70,229,0.4)]" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                )}
                <Globe2 size={14} className="relative z-10" />
                <span className="relative z-10 text-[11px] font-black tracking-widest uppercase">English</span>
              </button>
              <button 
                onClick={() => onLanguageChange('zh')}
                className={`relative flex items-center justify-center gap-3 py-4 rounded-[1.25rem] transition-all duration-500 overflow-hidden ${lang === 'zh' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {lang === 'zh' && (
                  <motion.div layoutId="activeLangIndicator" className="absolute inset-0 bg-indigo-600 shadow-[0_0_30px_rgba(79,70,229,0.4)]" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                )}
                <span className="relative z-10 text-sm font-black">中</span>
                <span className="relative z-10 text-[11px] font-black tracking-widest uppercase">简体中文</span>
              </button>
            </div>
          </div>
          <SettingItem icon={ShieldCheck} label={t.geminiCore} value={`${t.active}`} badge="Gemini-3-Pro" />
          <SettingItem icon={Shield} label={t.dataPrivacy} value={t.encrypted} />
        </GlassCard>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] px-4">{t.legal}</h3>
        <GlassCard className="divide-y divide-white/5 border-slate-700/20">
          <SettingItem 
            icon={Shield} 
            label={t.privacy} 
            value={lang === 'zh' ? '查看内部隐私协议' : 'View Internal Protocol'} 
            onClick={() => onNavigate('privacy')}
            badge={lang === 'zh' ? "本地模式" : "LOCAL"}
            statusColor="indigo" 
          />
          <SettingItem 
            icon={FileText} 
            label={t.terms} 
            value={lang === 'zh' ? '查看内部服务条款' : 'View Internal Terms'} 
            onClick={() => onNavigate('terms')}
            badge={lang === 'zh' ? "本地模式" : "LOCAL"}
            statusColor="indigo" 
          />
          <SettingItem 
            icon={Github} 
            label={t.repo} 
            value="vyncuslim/SomnoAI" 
            href="https://github.com/vyncuslim/SomnoAI-Digital-Sleep-Lab"
            badge={lang === 'zh' ? "源码" : "SOURCE"}
            statusColor="slate"
          />
        </GlassCard>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-4">
           <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">{t.funding}</h3>
           <div className="flex items-center gap-2 text-indigo-400">
             <Heart size={10} className="fill-indigo-400" />
             <span className="text-[8px] font-mono uppercase tracking-widest">{t.fundingDesc}</span>
           </div>
        </div>
        <GlassCard className="divide-white/5 border-slate-700/20 bg-white/[0.01]">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20 shadow-lg">
                  <QrCode size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-100 tracking-tight">{t.duitNowId}</p>
                  <p className="text-[9px] text-rose-400 font-black uppercase tracking-[0.2em]">{t.transferVia}</p>
                </div>
              </div>
            </div>

            <div 
              onClick={() => handleCopy("+60187807388")}
              className="relative group cursor-pointer"
            >
              <div className="p-5 bg-slate-950/80 rounded-[1.5rem] border border-white/5 text-center transition-all group-hover:border-rose-500/30 active:scale-[0.98]">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[8px] font-mono text-slate-600 uppercase tracking-[0.3em]">{lang === 'zh' ? 'DuitNow 代码' : 'DUITNOW CODE'}</span>
                  <p className="text-xl font-black font-mono tracking-tighter text-white group-hover:text-rose-400 transition-colors">+60 18-780 7388</p>
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 right-4 p-2 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                  <Copy size={14} className="text-rose-400" />
                </div>
              </div>
            </div>

            <button 
              onClick={() => handleCopy("+60187807388")}
              className="w-full py-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl text-rose-400 text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98]"
            >
              {t.duitNowCopy}
            </button>
          </div>

          <div className="p-6 space-y-4 border-t border-white/5 bg-cyan-500/[0.02]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-2xl border border-cyan-500/20 shadow-lg">
                  <MobileIcon size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-100 tracking-tight">{t.tngId}</p>
                  <p className="text-[9px] text-cyan-400 font-black uppercase tracking-[0.2em]">TNG eWallet</p>
                </div>
              </div>
            </div>

            <div 
              onClick={() => handleCopy("+600187807388")}
              className="relative group cursor-pointer"
            >
              <div className="p-5 bg-slate-950/80 rounded-[1.5rem] border border-white/5 text-center transition-all group-hover:border-cyan-500/30 active:scale-[0.98]">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[8px] font-mono text-slate-600 uppercase tracking-[0.3em]">{lang === 'zh' ? 'TNG 手机号' : 'TNG MOBILE'}</span>
                  <p className="text-xl font-black font-mono tracking-tighter text-white group-hover:text-cyan-400 transition-colors">+60 0187807388</p>
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 right-4 p-2 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                  <Copy size={14} className="text-cyan-400" />
                </div>
              </div>
            </div>

            <button 
              onClick={() => handleCopy("+600187807388")}
              className="w-full py-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-xl text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98]"
            >
              {t.tngCopy}
            </button>
          </div>

          <div className="p-6 space-y-4 border-t border-white/5 bg-blue-500/[0.02]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20 shadow-lg">
                  <CreditCard size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-100 tracking-tight">{t.paypalId}</p>
                  <p className="text-[9px] text-blue-400 font-black uppercase tracking-[0.2em]">PayPal.me</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center py-4">
               <div className="p-4 bg-white rounded-3xl shadow-2xl relative group overflow-hidden">
                  <img 
                    src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://paypal.me/vyncuslim" 
                    alt="PayPal QR" 
                    className="w-40 h-40 opacity-90 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-white/80 backdrop-blur-sm pointer-events-none">
                     <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest">Scan to Pay</p>
                  </div>
               </div>
            </div>

            <button 
              onClick={() => window.open("https://paypal.me/vyncuslim", "_blank")}
              className="w-full py-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <ExternalLink size={12} />
              {t.paypalLink}
            </button>
          </div>

          <div className="border-t border-white/5">
            <SettingItem 
              icon={Coffee} 
              label={t.coffee} 
              value="buymeacoffee.com/ongyuze140d" 
              href="https://buymeacoffee.com/ongyuze140d"
              statusColor="amber"
            />
          </div>

          <div className="p-6 bg-slate-500/[0.03] border-t border-white/5">
             <div className="flex gap-3 items-start opacity-60">
                <span className="text-slate-400 shrink-0 mt-0.5"><Info size={14} /></span>
                <p className="text-[9px] text-slate-400 font-medium leading-relaxed italic">
                  {t.fundingDisclaimer}
                </p>
             </div>
          </div>
        </GlassCard>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] px-4">{t.ecosystem}</h3>
        <GlassCard className="divide-y divide-white/5">
          <SettingItem icon={Smartphone} label={t.googleFit} value={t.syncing} statusColor="emerald" badge={lang === 'zh' ? "健康链路" : "HEALTH-LINK"} />
          <SettingItem icon={Globe} label={t.autoUpdate} value={t.sessionSync} />
          <SettingItem icon={MessageSquare} label={lang === 'zh' ? '意见反馈' : 'Feedback'} value="ongyuze1401@gmail.com" href="mailto:ongyuze1401@gmail.com" statusColor="amber" />
        </GlassCard>
      </div>

      <div className="pt-6 px-2 space-y-4">
        <AnimatePresence mode="wait">
          {showLogoutConfirm ? (
            <motion.div 
              key="confirm"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-8 bg-rose-500/10 border border-rose-500/30 rounded-[2.5rem] space-y-6 shadow-[0_20px_50px_rgba(225,29,72,0.2)]"
            >
              <div className="flex items-center gap-4 text-rose-400">
                 <div className="p-3 bg-rose-500/20 rounded-2xl border border-rose-500/20">
                   <AlertTriangle size={24} />
                 </div>
                 <div>
                   <p className="font-black uppercase text-[12px] tracking-widest">{lang === 'en' ? 'Confirm System Purge?' : '确认启动系统净化程序？'}</p>
                   <p className="text-[9px] font-mono opacity-60 uppercase mt-0.5">{lang === 'zh' ? '协议' : 'Protocol'}: PURGE_AUTH_09</p>
                 </div>
              </div>
              <p className="text-xs text-slate-400 font-medium leading-relaxed italic">
                {lang === 'en' 
                  ? 'This action will terminate your lab session and permanently erase all biometric cache from your browser. This process is irreversible.' 
                  : '此操作将立即终止当前的实验室会话，并彻底擦除本地浏览器存储中的所有生物识别快照。该过程无法撤销。'}
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={onLogout} 
                  className="flex-1 py-5 bg-rose-600 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest shadow-[0_10px_30px_-5px_rgba(225,29,72,0.4)] hover:bg-rose-500 transition-all active:scale-95"
                >
                  {lang === 'en' ? 'Purge Now' : '确认净化'}
                </button>
                <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-5 bg-white/5 border border-white/10 text-slate-400 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest hover:text-white transition-all active:scale-95">
                  {lang === 'en' ? 'Cancel' : '取消协议'}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.button 
              key="button"
              layoutId="logout-btn"
              onClick={() => setShowLogoutConfirm(true)} 
              className="group w-full flex items-center justify-between p-7 bg-white/5 border border-white/10 text-slate-400 rounded-[2.5rem] transition-all hover:bg-rose-500/5 hover:border-rose-500/30 active:scale-[0.98] shadow-2xl overflow-hidden relative"
            >
              <div className="flex items-center gap-5 relative z-10">
                <div className="p-3 bg-slate-800 rounded-2xl text-slate-500 group-hover:bg-rose-500/10 group-hover:text-rose-400 transition-all shadow-inner border border-white/5"><LogOut size={22} /></div>
                <div className="text-left">
                  <span className="block font-black text-[12px] uppercase tracking-[0.25em] group-hover:text-slate-200 transition-colors">{t.logout}</span>
                  <span className="block text-[8px] font-mono opacity-40 uppercase tracking-widest mt-0.5">{lang === 'zh' ? '终止序列' : 'Termination Sequence'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                <span className="text-[10px] font-black uppercase text-rose-400/60 tracking-widest italic">{lang === 'zh' ? '初始化净化' : 'Init Purge'}</span>
                <ChevronRight size={16} className="text-rose-400" />
              </div>
            </motion.button>
          )}
        </AnimatePresence>

        <div className="flex flex-col items-center gap-5 py-12 opacity-30">
           <div className="flex items-center gap-6"><Activity size={24} className="text-slate-500" /><Radio size={24} className="text-indigo-500 animate-pulse" /><Cpu size={24} className="text-slate-500" /></div>
           <div className="text-center space-y-2">
             <p className="text-[9px] font-mono font-black uppercase tracking-[0.6em] text-slate-400">{lang === 'zh' ? 'Somno 实验室控制系统' : 'Somno Laboratory Control System'}</p>
             <div className="flex items-center gap-3 justify-center">
               <Binary size={12} className="text-indigo-400" />
               <p className="text-[8px] font-mono uppercase tracking-[0.2em] text-slate-600">{lang === 'zh' ? '安全协议' : 'Secure Protocol'} v3.4.0 • {lang === 'zh' ? '遥测信号' : 'Tele-Signal'}: <span className="text-indigo-400">{telemetry}</span></p>
             </div>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {copyToast && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[100] px-6 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-2xl">
            {copyToast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
