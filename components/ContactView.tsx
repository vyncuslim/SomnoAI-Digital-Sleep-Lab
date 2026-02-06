import React, { useState } from 'react';
import { 
  ArrowLeft, Mail, ShieldCheck, Globe, 
  MessageSquare, UserCircle, Settings, 
  LifeBuoy, Copy, Check, ExternalLink, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language } from '../services/i18n.ts';
import { GlassCard } from './GlassCard.tsx';
import { Logo } from './Logo.tsx';

const m = motion as any;

interface ContactViewProps {
  lang: Language;
  onBack: () => void;
}

export const ContactView: React.FC<ContactViewProps> = ({ lang, onBack }) => {
  const isZh = lang === 'zh';
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const contacts = [
    {
      id: 'admin',
      email: 'admin@sleepsomno.com',
      label: isZh ? '管理终端' : 'Administrative Terminal',
      desc: isZh ? '核心权限、系统级配置与基础设施安全查询。' : 'Core permissions, system-level configuration, and infrastructure security inquiries.',
      icon: ShieldCheck,
      color: 'text-indigo-400'
    },
    {
      id: 'contact',
      email: 'contact@sleepsomno.com',
      label: isZh ? '实验室联络处' : 'Laboratory Dispatch',
      desc: isZh ? '通用业务查询、商务合作与品牌交流。' : 'General business inquiries, partnerships, and brand communications.',
      icon: Globe,
      color: 'text-emerald-400'
    },
    {
      id: 'info',
      email: 'info@sleepsomno.com',
      label: isZh ? '信息集成部' : 'Information Matrix',
      desc: isZh ? '数据协议说明、隐私合规性查询与媒体资料。' : 'Data protocol documentation, privacy compliance queries, and media assets.',
      icon: MessageSquare,
      color: 'text-blue-400'
    },
    {
      id: 'support',
      email: 'support@sleepsomno.com',
      label: isZh ? '技术支持中心' : 'Technical Support',
      desc: isZh ? '神经链路同步故障排除、受试者账户恢复与 Bug 提交。' : 'Neural link synchronization troubleshooting, subject account recovery, and bug reporting.',
      icon: LifeBuoy,
      color: 'text-amber-400'
    }
  ];

  return (
    <div className="min-h-screen pt-4 pb-32 animate-in fade-in slide-in-from-right-4 duration-700 font-sans text-left">
      <header className="max-w-7xl mx-auto px-4 mb-12 md:mb-20">
        <button 
          onClick={onBack}
          className="p-4 bg-slate-950/80 backdrop-blur-3xl hover:bg-white/10 rounded-3xl text-slate-400 hover:text-white transition-all border border-white/5 shadow-2xl active:scale-95"
        >
          <ArrowLeft size={24} />
        </button>
      </header>

      <div className="max-w-5xl mx-auto px-4 space-y-24">
        {/* Hero Section */}
        <div className="text-center space-y-8">
          <div className="relative inline-block">
             <div className="absolute inset-0 bg-indigo-500/20 blur-[120px] rounded-full animate-pulse" />
             <Logo size={140} animated={true} className="mx-auto relative z-10" />
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black italic text-white uppercase tracking-tighter leading-none">
              {isZh ? '连接' : 'Connectivity'} <span className="text-indigo-500">Hub</span>
            </h1>
            <p className="text-[10px] md:text-[12px] text-slate-500 font-mono font-bold uppercase tracking-[0.6em] italic max-w-2xl mx-auto leading-relaxed">
              SomnoAI Network Dispatch • Secure Communication Protocols v4.2
            </p>
          </div>
        </div>

        {/* Contact Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {contacts.map((node) => (
            <GlassCard key={node.id} className="p-10 rounded-[3.5rem] border-white/5 hover:border-indigo-500/20 transition-all duration-500 group relative overflow-hidden">
               <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className={`p-4 bg-white/5 rounded-2xl ${node.color} group-hover:scale-110 transition-transform shadow-inner`}>
                    <node.icon size={32} />
                  </div>
                  <button 
                    onClick={() => handleCopy(node.id, node.email)}
                    className={`p-3 rounded-xl transition-all active:scale-90 ${copiedId === node.id ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-500 hover:text-white'}`}
                  >
                    {copiedId === node.id ? <Check size={20} /> : <Copy size={20} />}
                  </button>
               </div>
               
               <div className="space-y-4 relative z-10">
                  <h3 className="text-white font-black italic uppercase text-lg tracking-tight flex items-center gap-3">
                    {node.label}
                    <div className="w-1 h-1 rounded-full bg-slate-800" />
                    <span className="text-[9px] font-mono text-slate-600 tracking-widest">{node.id.toUpperCase()}_NODE</span>
                  </h3>
                  <a 
                    href={`mailto:${node.email}`}
                    className="block text-2xl font-black italic text-indigo-400 hover:text-indigo-300 transition-colors tracking-tighter leading-none truncate"
                  >
                    {node.email}
                  </a>
                  <p className="text-slate-500 text-xs leading-relaxed italic font-medium pt-2">
                    {node.desc}
                  </p>
               </div>

               {/* Background detail */}
               <div className="absolute -bottom-4 -right-4 opacity-[0.03] text-white pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
                  <node.icon size={160} strokeWidth={0.5} />
               </div>
            </GlassCard>
          ))}
        </div>

        {/* Global Network Note */}
        <section className="p-12 md:p-16 bg-indigo-500/[0.02] border border-white/5 rounded-[4rem] flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.05),transparent)] pointer-events-none" />
           <div className="p-8 bg-indigo-500/10 rounded-[3rem] text-indigo-400 relative z-10 shadow-inner">
              <Zap size={48} className="animate-pulse" />
           </div>
           <div className="space-y-4 relative z-10 text-center md:text-left flex-1">
              <h2 className="text-2xl font-black italic text-white uppercase tracking-tight">Signal Integrity</h2>
              <p className="text-slate-400 text-sm leading-relaxed italic max-w-2xl">
                {isZh 
                  ? '我们的通信网关经过端到端加密处理。管理团队通常会在 24-48 个实验室工作小时内对所有同步信号做出响应。请确保您的邮件包含受试者 ID 或节点指纹以加快处理。' 
                  : 'Our communication gateways are end-to-end encrypted. The management team typically responds to all synchronized signals within 24-48 laboratory business hours. Please ensure your email includes Subject ID or Node Fingerprint for expedited processing.'}
              </p>
              <div className="flex items-center gap-6 pt-4 justify-center md:justify-start">
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">All Channels Nominal</span>
                 </div>
              </div>
           </div>
        </section>

        <footer className="pt-20 text-center space-y-10">
           <div className="flex items-center justify-center gap-4 opacity-30">
              <ShieldCheck size={16} className="text-slate-500" />
              <p className="text-[9px] font-mono tracking-[0.5em] uppercase">SomnoAI Connectivity Matrix • v4.2.1</p>
           </div>
           <button onClick={onBack} className="px-20 py-7 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-black text-xs uppercase tracking-[0.4em] italic shadow-[0_20px_50px_rgba(79,70,229,0.3)] active:scale-95 transition-all">Terminate Hub Session</button>
        </footer>
      </div>
    </div>
  );
};