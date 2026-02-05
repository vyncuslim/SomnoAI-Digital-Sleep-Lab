import React from 'react';
import { ArrowLeft, FileText, ShieldCheck, Lock, ShieldAlert, Activity, AlertTriangle, Zap, Mail, ExternalLink, Shield } from 'lucide-react';
import { Language } from '../services/i18n.ts';

interface LegalViewProps {
  type: 'privacy' | 'terms';
  lang: Language;
  onBack: () => void;
}

export const LegalView: React.FC<LegalViewProps> = ({ type, lang, onBack }) => {
  const isPrivacy = type === 'privacy';

  return (
    <div className="min-h-screen pt-4 pb-32 animate-in fade-in slide-in-from-right-4 duration-500">
      <header className="flex items-center gap-4 mb-8 px-2">
        <button 
          onClick={onBack}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all active:scale-90 border border-white/5 shadow-lg"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter text-white">
            {isPrivacy ? 'Privacy Policy' : 'Terms of Service'}
          </h1>
          <p className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-[0.3em] mt-0.5">
            Somno Lab • v2026.01.04
          </p>
        </div>
      </header>

      <div className="backdrop-blur-3xl bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-8 md:p-12 space-y-12 leading-relaxed text-slate-300 text-[13px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none text-white">
          {isPrivacy ? <ShieldCheck size={160} /> : <FileText size={160} />}
        </div>

        {isPrivacy ? (
          <>
            <section className="p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-indigo-400">
                 <Shield size={18} />
                 <h2 className="text-[11px] font-black uppercase tracking-widest">Health Data Limited Use Disclosure</h2>
              </div>
              <p className="italic text-slate-400">
                Somno Lab's use and transfer of information received from personal health APIs will adhere to strict data safety policies, including the Limited Use requirements. This is used to bridge Health Connect data.
              </p>
            </section>

            <section className="space-y-6 relative z-10">
              <div className="flex items-center gap-3 text-white border-b border-white/5 pb-4">
                <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                  <Activity size={20} />
                </div>
                <h2 className="text-xl font-bold italic tracking-tight">1. Data Access</h2>
              </div>
              <p>After your explicit authorization, we access sleep, heart rate, energy expenditure, and body measurement data. These represent the minimum scopes required for lab analysis, synced via the Health Connect infrastructure.</p>
            </section>

            <section className="space-y-6 relative z-10">
              <div className="flex items-center gap-3 text-white border-b border-white/5 pb-4">
                <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                  <Zap size={20} />
                </div>
                <h2 className="text-xl font-bold italic tracking-tight">2. Data Usage</h2>
              </div>
              <p>Data is used for in-app charts and scores, and sent (anonymized) to Gemini AI for personalized health recommendations. We do not use this data for advertising, profiling, or third-party sales.</p>
            </section>

            <section className="space-y-6 relative z-10">
              <div className="flex items-center gap-3 text-white border-b border-white/5 pb-4">
                <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                  <Lock size={20} />
                </div>
                <h2 className="text-xl font-bold italic tracking-tight">3. Edge Storage & Security</h2>
              </div>
              <p>Data is processed locally in your browser (SessionStorage) and never uploaded to our servers. All sensitive metrics are purged immediately upon logout or tab closure.</p>
            </section>
          </>
        ) : (
          <>
            <section className="space-y-8 relative z-10">
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-[2rem] p-8 space-y-4 shadow-lg shadow-rose-950/20">
                <div className="flex items-center gap-3 text-rose-400">
                  <AlertTriangle size={20} />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Medical Disclaimer</h3>
                </div>
                <p className="text-[12px] text-slate-300 leading-relaxed font-bold italic">
                  Somno Lab is not a medical device. AI content is for educational reference; consult a medical professional for health decisions.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 text-white border-b border-white/5 pb-4">
                  <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                    <ShieldCheck size={20} />
                  </div>
                  <h2 className="text-xl font-bold italic tracking-tight">Data Authorization</h2>
                </div>
                <p>You confirm you understand the scopes accessed from Health Connect and agree to the data processing.</p>
              </div>
            </section>
          </>
        )}
        
        <div className="pt-8 flex justify-center">
          <a 
            href={isPrivacy ? "/privacy.html" : "/terms.html"} 
            target="_blank" 
            className="flex items-center gap-2 px-6 py-3 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-2xl text-indigo-400 font-bold transition-all"
          >
            <ExternalLink size={16} />
            Read Full Document in New Window
          </a>
        </div>

        <footer className="pt-12 border-t border-white/5 flex flex-col items-center gap-4 opacity-40">
          <div className="flex items-center gap-2 text-indigo-400">
            <Mail size={12} />
            <span className="text-[10px] font-bold">contact@sleepsomno.com</span>
          </div>
          <p className="text-[9px] font-black uppercase tracking-widest">© 2026 SOMNO LAB • Compliance Update: 2026.01.04</p>
        </footer>
      </div>
    </div>
  );
};