import React, { useState } from 'react';
import { 
  ArrowLeft, Mail, ShieldCheck, Globe, 
  MessageSquare, UserCircle, Settings, 
  LifeBuoy, Copy, Check, ExternalLink, Zap, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language } from '../services/i18n.ts';
import { GlassCard } from './GlassCard.tsx';
import { Logo } from './Logo.tsx';
import { updateMetadata } from '../services/navigation.ts';
import { useEffect } from 'react';

const m = motion as any;

interface ContactViewProps {
  lang: Language;
  onBack: () => void;
}

export const ContactView: React.FC<ContactViewProps> = ({ lang, onBack }) => {
  const isZh = lang === 'zh';
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    updateMetadata(
      isZh ? '联系我们 - SomnoAI Digital Sleep Lab' : 'Contact Us - SomnoAI Digital Sleep Lab',
      isZh ? '联系 SomnoAI 数字睡眠实验室。' : 'Contact SomnoAI Digital Sleep Lab.',
      '/contact'
    );
  }, [isZh]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const contacts = [
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
      desc: isZh ? '神经链路同步故障排除、账户恢复与 Bug 提交。' : 'Neural link synchronization troubleshooting and bug reporting.',
      icon: LifeBuoy,
      color: 'text-amber-400'
    },
    {
      id: 'admin',
      email: 'admin@sleepsomno.com',
      label: isZh ? '管理终端' : 'Administrative Terminal',
      desc: isZh ? '核心权限、系统级配置与基础设施安全查询。' : 'Core permissions and system-level configuration inquiries.',
      icon: ShieldCheck,
      color: 'text-indigo-400'
    },
    {
      id: 'legal',
      email: 'termandcondition@sleepsomno.com',
      label: isZh ? '法律事务部' : 'Legal Affairs',
      desc: isZh ? '服务条款、隐私政策与合规性法律咨询。' : 'Terms of service, privacy policy, and compliance legal inquiries.',
      icon: FileText,
      color: 'text-rose-400'
    }
  ];

  return (
    <div className="min-h-screen bg-black pt-4 pb-32 animate-in fade-in slide-in-from-right-4 duration-700 font-sans text-left relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#1e1b4b_0%,transparent_50%)] opacity-30" />
      
      <header className="max-w-7xl mx-auto px-6 mb-12 md:mb-20 relative z-10 flex justify-between items-center mt-6">
        <button 
          onClick={onBack}
          className="p-4 bg-white/[0.02] hover:bg-white/5 rounded-3xl text-slate-400 hover:text-white transition-all border border-white/5 shadow-2xl active:scale-95"
        >
          <ArrowLeft size={24} />
        </button>
        <Logo />
      </header>

      <div className="max-w-5xl mx-auto px-6 space-y-24 relative z-10">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-[5rem] font-black italic text-white uppercase tracking-tighter leading-none">
              Connectivity <span className="text-indigo-500">Hub</span>
            </h1>
            <p className="text-[10px] md:text-[12px] text-slate-500 font-mono font-bold uppercase tracking-[0.6em] italic max-w-2xl mx-auto leading-relaxed">
              SomnoAI Network Dispatch • SECURE COMMUNICATION PROTOCOL v4.2
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {contacts.map((node) => (
            <GlassCard key={node.id} className="p-10 rounded-[3.5rem] border-white/5 hover:border-indigo-500/20 transition-all duration-500 group relative overflow-hidden bg-white/[0.01]">
               <div className="flex justify-between items-start mb-10 relative z-10">
                  <div className={`p-4 bg-white/[0.03] rounded-2xl ${node.color} group-hover:scale-110 transition-transform shadow-inner border border-white/5`}>
                    <node.icon size={32} />
                  </div>
                  <button 
                    onClick={() => handleCopy(node.id, node.email)}
                    className={`p-3 rounded-xl transition-all active:scale-90 ${copiedId === node.id ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/[0.03] text-slate-600 hover:text-white'}`}
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
                    className="block text-2xl md:text-3xl font-black italic text-indigo-400 hover:text-indigo-300 transition-colors tracking-tighter leading-none truncate"
                  >
                    {node.email}
                  </a>
                  <p className="text-slate-500 text-xs leading-relaxed italic font-medium pt-2 opacity-80">
                    {node.desc}
                  </p>
               </div>

               <div className="absolute -bottom-4 -right-4 opacity-[0.02] text-white pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
                  <node.icon size={180} strokeWidth={0.5} />
               </div>
            </GlassCard>
          ))}
        </div>

        <footer className="pt-20 text-center space-y-12">
           <div className="flex items-center justify-center gap-4 opacity-30">
              <ShieldCheck size={16} className="text-slate-500" />
              <p className="text-[9px] font-mono tracking-[0.5em] uppercase">SomnoAI Connectivity Matrix • v4.2.5</p>
           </div>
           <button onClick={onBack} className="px-20 py-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-black text-xs uppercase tracking-[0.4em] italic shadow-[0_30px_70px_rgba(79,70,229,0.3)] active:scale-95 transition-all">TERMINATE DISPATCH SESSION</button>
        </footer>
      </div>
    </div>
  );
};