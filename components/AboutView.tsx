
import React from 'react';
import { 
  ArrowLeft, BrainCircuit, Target, Cpu, FlaskConical, Binary, 
  ShieldCheck, Zap, Globe, Smartphone, Database, ChevronRight, 
  UserCheck, Moon, Lock, Mail, Server
} from 'lucide-react';
import { Language, translations } from '../services/i18n.ts';
import { GlassCard } from './GlassCard.tsx';
import { motion } from 'framer-motion';
import { Logo } from './Logo.tsx';

const m = motion as any;

interface AboutViewProps {
  lang: Language;
  onBack: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ lang, onBack }) => {
  return (
    <div className="min-h-screen pt-4 pb-32 animate-in fade-in slide-in-from-right-4 duration-500 font-sans">
      <header className="flex items-center gap-6 mb-12 px-2 max-w-4xl mx-auto">
        <button 
          onClick={onBack}
          className="p-4 bg-white/5 hover:bg-white/10 rounded-3xl text-slate-400 hover:text-white transition-all border border-white/5 shadow-lg active:scale-95"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-4">
          <Logo size={48} animated={true} />
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase leading-none">
              About <span className="text-indigo-400">SomnoAI</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-[0.4em] mt-2">
              Digital Sleep Lab • v2026.01
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto space-y-12 px-2">
        {/* Project Overview */}
        <GlassCard className="p-10 md:p-14 rounded-[4rem] border-white/10">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
              <Globe size={24} />
            </div>
            <h2 className="text-2xl font-black italic text-white uppercase tracking-tight">Project Overview</h2>
          </div>
          <div className="space-y-6 text-slate-300 text-lg leading-relaxed italic text-left">
            <p>
              SomnoAI Digital Sleep Lab is an AI-powered digital health platform focused on advanced sleep analysis and personalized optimization.
            </p>
            <p>
              Unlike traditional hardware-dependent trackers, we offer a pure software solution: collect biometric data from any wearable, smart mattress, phone sensors or manual input — then use sophisticated AI models to deliver meaningful insights without storing sensitive data long-term on servers.
            </p>
          </div>
        </GlassCard>

        {/* Mission */}
        <GlassCard className="p-10 md:p-14 rounded-[4rem] border-white/10 bg-indigo-600/[0.02]">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
              <Target size={24} />
            </div>
            <h2 className="text-2xl font-black italic text-white uppercase tracking-tight">Our Mission</h2>
          </div>
          <div className="space-y-6 text-left">
             <p className="text-lg leading-relaxed text-slate-300 font-medium">
               We help people understand and improve sleep quality — not just track duration.
             </p>
             <ul className="list-disc pl-6 space-y-4 text-slate-400 italic">
               <li>Empower health-conscious individuals with actionable, personalized recommendations</li>
               <li>Provide sleep researchers with tools for anonymized pattern analysis</li>
               <li>Support small clinics and wellness centers in monitoring clients and creating targeted interventions</li>
             </ul>
          </div>
        </GlassCard>

        {/* Key Features & Technology */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <GlassCard className="p-10 rounded-[3.5rem] border-white/5">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
                  <BrainCircuit size={22} />
                </div>
                <h3 className="text-xl font-black italic text-white uppercase tracking-tight">Core AI Capabilities</h3>
              </div>
              <ul className="space-y-4 text-left">
                {[
                  "Sleep stage detection (Awake / Light / Deep / REM)",
                  "Anomaly detection (awakenings, breathing irregularities)",
                  "Time-series models (LSTM/GRU) + classification",
                  "Clustering for individual sleep pattern recognition"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-400 italic font-bold">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
           </GlassCard>

           <GlassCard className="p-10 rounded-[3.5rem] border-white/5">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400">
                  <Lock size={22} />
                </div>
                <h3 className="text-xl font-black italic text-white uppercase tracking-tight">Privacy & Architecture</h3>
              </div>
              <ul className="space-y-4 text-left">
                {[
                  "Zero persistent backend storage architecture",
                  "AES-256 encryption + HTTPS transmission",
                  "GDPR compliant + pseudonymization",
                  "Supabase (PostgreSQL) + React + Gemini AI"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-400 italic font-bold">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
           </GlassCard>
        </div>

        {/* About the Developer */}
        <GlassCard className="p-10 md:p-14 rounded-[4rem] border-white/10 bg-white/[0.01]">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-slate-500/10 rounded-2xl text-slate-400">
              <UserCheck size={24} />
            </div>
            <h2 className="text-2xl font-black italic text-white uppercase tracking-tight">About the Developer</h2>
          </div>
          <div className="space-y-6 text-slate-300 text-lg leading-relaxed italic text-left">
            <p>
              Built independently by <strong>Vyncuslim</strong> (Penang, Malaysia).
            </p>
            <p>
              Started in January 2026 as a build-in-public project with strong focus on privacy, usability and real-world value.
            </p>
            <div className="flex flex-wrap gap-6 mt-10">
              <a
                href="https://github.com/vyncuslim/SomnoAI-Digital-Sleep-Lab"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all border border-white/5 font-black text-[10px] uppercase tracking-widest italic"
              >
                View Source on GitHub →
              </a>
              <a
                href="mailto:ongyuze1401@gmail.com"
                className="inline-flex items-center px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all italic shadow-xl"
              >
                Contact Developer
              </a>
            </div>
          </div>
        </GlassCard>

        {/* Global Footer in About */}
        <footer className="pt-12 flex flex-col items-center gap-6 opacity-30">
           <div className="flex items-center gap-3">
             <FlaskConical size={14} className="text-indigo-400" />
             <span className="text-[9px] font-mono tracking-widest uppercase">SomnoAI Lab • Secure Infrastructure v2.5</span>
           </div>
           <div className="text-center">
              <button 
                onClick={onBack}
                className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-full text-[12px] font-black uppercase tracking-widest transition-all text-white italic shadow-2xl active:scale-95"
              >
                Back to Home
              </button>
           </div>
        </footer>
      </div>
    </div>
  );
};
