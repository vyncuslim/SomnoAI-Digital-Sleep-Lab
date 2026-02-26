import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Logo } from './Logo';
import { ArrowLeft, Terminal, GitCommit, GitPullRequest, ShieldCheck, Zap } from 'lucide-react';

import { GlassCard } from './GlassCard.tsx';
import { trackPageView } from '../services/analytics.ts';

const m = motion as any;

interface ChangelogViewProps {
  lang: 'en' | 'zh' | 'es';
  onBack: () => void;
}

const CHANGELOG_DATA = [
  {
    version: '4.2.8',
    date: '2024.05.12',
    title: 'Stability Update',
    changes: [
      'Improved device compatibility',
      'Infrastructure upgrades',
      'Security enhancements',
      'UI refinements'
    ]
  },
  {
    version: '4.2.7',
    date: '2024.04.28',
    title: 'Neural Grid Expansion',
    changes: [
      'Added passwordless login option (Magic Link)',
      'Enhanced password strength indicator',
      'Optimized OTP delivery latency',
      'Resolved edge cases in biometric sync'
    ]
  },
  {
    version: '4.2.0',
    date: '2024.03.15',
    title: 'Core Architecture Overhaul',
    changes: [
      'Migrated to Vite for faster build times',
      'Implemented new Glassmorphism UI system',
      'Added multi-language support (EN/ZH/ES)',
      'Initial release of SomnoAI Digital Sleep Lab'
    ]
  }
];

export const ChangelogView: React.FC<ChangelogViewProps> = ({ lang, onBack }) => {
  const isZh = lang === 'zh';

  useEffect(() => {
    trackPageView('/changelog', 'Changelog');
  }, []);

  return (
    <div className="min-h-screen bg-[#010409] text-slate-300 font-sans selection:bg-indigo-500/30">
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,#1e1b4b,transparent_40%)] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 py-24 relative z-10">
        <button 
          onClick={onBack}
          className="group flex items-center gap-3 text-slate-500 hover:text-white transition-colors mb-16 font-black uppercase tracking-widest text-xs italic"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" />
          {isZh ? '返回终端' : 'RETURN TO TERMINAL'}
        </button>

        <div className="flex items-center gap-6 mb-16">

          <div>
            <h1 className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter">
              {isZh ? '更新日志' : 'Changelog'}
            </h1>
            <p className="text-indigo-400 font-black uppercase tracking-[0.4em] text-xs mt-2 italic flex items-center gap-2">
              <Terminal size={12} /> SYSTEM_EVOLUTION_LOG
            </p>
          </div>
        </div>

        <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
          {CHANGELOG_DATA.map((release, idx) => (
            <div key={release.version} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#010409] bg-indigo-600 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <GitCommit size={16} />
              </div>
              
              <GlassCard className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 md:p-8 rounded-3xl border-white/5 hover:border-indigo-500/30 transition-all duration-500" intensity={2}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-xs font-black tracking-widest italic">v{release.version}</span>
                    <span className="text-slate-500 text-xs font-mono">{release.date}</span>
                  </div>
                </div>
                
                <h3 className="text-xl font-black text-white italic mb-4">{release.title}</h3>
                
                <ul className="space-y-3">
                  {release.changes.map((change, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                      <div className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500/50 shrink-0" />
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
