
import React from 'react';
import { ArrowLeft, FileText, ShieldCheck, Mail, Lock, Database, Info, ShieldAlert, Globe, Activity, Heart, Zap } from 'lucide-react';

interface LegalViewProps {
  type: 'privacy' | 'terms';
  onBack: () => void;
}

export const LegalView: React.FC<LegalViewProps> = ({ type, onBack }) => {
  const isPrivacy = type === 'privacy';

  return (
    <div className="min-h-screen pt-4 pb-32 animate-in fade-in slide-in-from-right-4 duration-500">
      <header className="flex items-center gap-4 mb-8 px-2">
        <button 
          onClick={onBack}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all active:scale-90 border border-white/5"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black italic tracking-tight text-white">
            {isPrivacy ? 'Privacy Policy' : 'Terms of Service'}
          </h1>
          <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em] mt-0.5">
            Somno Digital Sleep Lab • Effective: March 20, 2024
          </p>
        </div>
      </header>

      <div className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-8 md:p-12 space-y-12 leading-relaxed text-slate-300 text-sm shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-white">
          {isPrivacy ? <ShieldCheck size={160} /> : <FileText size={160} />}
        </div>

        {isPrivacy ? (
          <>
            <section className="space-y-4 relative z-10">
              <div className="flex items-center gap-3 text-white">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                  <Database size={20} />
                </div>
                <h2 className="text-xl font-bold italic">1. Data Lifecycle & Processing</h2>
              </div>
              <p>Somno adheres to the "data minimization" principle. When you authorize through Google Fit, the app fetches metrics from the last 7 days via TLS encrypted channels. This data is processed exclusively within your current browser session.</p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <Heart className="text-rose-400 mb-2" size={16} />
                  <p className="text-[10px] font-bold uppercase text-slate-500">BIO SIGNALS</p>
                  <p className="text-[11px] leading-tight mt-1">Used only for visual synthesis</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <Zap className="text-indigo-400 mb-2" size={16} />
                  <p className="text-[10px] font-bold uppercase text-slate-500">AI INSIGHTS</p>
                  <p className="text-[11px] leading-tight mt-1">Anonymized metric projection</p>
                </div>
              </div>
            </section>

            <section className="space-y-4 relative z-10">
              <div className="p-8 bg-indigo-500/10 border border-indigo-500/20 rounded-[2rem] space-y-4">
                <div className="flex items-center gap-3 text-indigo-400">
                  <ShieldAlert size={20} />
                  <h3 className="text-xs font-black uppercase tracking-widest">Google API Limited Use Disclosure</h3>
                </div>
                <p className="text-xs text-indigo-100/80 leading-relaxed italic">
                  Our use and transfer of information received from Google APIs will adhere to the Google API Service User Data Policy, including Limited Use requirements. Your health data is never used for advertising or profiling.
                </p>
              </div>
            </section>

            <section className="space-y-4 relative z-10">
              <div className="flex items-center gap-3 text-white">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                  <Lock size={20} />
                </div>
                <h2 className="text-xl font-bold italic">2. Zero Storage & Data Security</h2>
              </div>
              <p>This application has no backend servers and no cloud persistence capabilities. All data is stored in your device's <code>sessionStorage</code> and is purged immediately upon logout or tab closure.</p>
            </section>

            <footer className="pt-8 border-t border-white/5 space-y-4">
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-indigo-400" />
                <p className="text-xs font-bold text-slate-400">Inquiries: ongyuze1401@gmail.com</p>
              </div>
              <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em]">© 2024 Somno Digital Sleep Lab. All rights reserved.</p>
            </footer>
          </>
        ) : (
          <>
            <section className="space-y-4 relative z-10">
              <div className="flex items-center gap-3 text-white">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                  <Globe size={20} />
                </div>
                <h2 className="text-xl font-bold italic">1. Platform Agreement</h2>
              </div>
              <p>By using the Somno Lab services, you agree to these terms. This application is an experimental information platform and does not provide medical services.</p>
            </section>

            <section className="space-y-4 relative z-10">
              <div className="p-8 bg-amber-500/10 border border-amber-500/20 rounded-[2rem] space-y-4">
                <div className="flex items-center gap-3 text-amber-400">
                  <ShieldCheck size={24} />
                  <h2 className="text-sm font-black uppercase tracking-widest">2. Medical Disclaimer</h2>
                </div>
                <p className="text-xs text-amber-100 font-bold leading-relaxed italic">
                  All sleep scores, AI insights, and physiological charts provided are for reference only. This information cannot replace professional medical advice. DO NOT use this app for diagnosis or emergency health monitoring.
                </p>
                <p className="text-[10px] text-amber-200/60 leading-relaxed uppercase font-black">
                  IN CASE OF EMERGENCY, PLEASE CONTACT YOUR LOCAL MEDICAL SERVICE IMMEDIATELY.
                </p>
              </div>
            </section>

            <section className="space-y-4 relative z-10">
              <div className="flex items-center gap-3 text-white">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                  <Activity size={20} />
                </div>
                <h2 className="text-xl font-bold italic">3. Limitation of Liability</h2>
              </div>
              <p>The developer does not guarantee 100% accuracy. We are not liable for errors arising from Google API changes, AI model hallucinations, or browser compatibility issues.</p>
            </section>

            <footer className="pt-8 border-t border-white/5 flex justify-between items-center">
              <p className="text-[10px] text-slate-500 italic">Version: v2024.03.R3 | Updated: 2024.03.20</p>
              <div className="flex gap-4">
                 <Lock size={14} className="text-slate-700" />
                 <ShieldCheck size={14} className="text-slate-700" />
              </div>
            </footer>
          </>
        )}
      </div>
    </div>
  );
};
