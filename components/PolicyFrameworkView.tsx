import React, { useEffect } from 'react';
import { ArrowLeft, Shield, CheckCircle, AlertTriangle, Activity, Database, Cookie, Flag, Lock } from 'lucide-react';
import { Language } from '../types.ts';
import { getTranslation } from '../services/i18n.ts';
import { updateMetadata } from '../services/navigation.ts';

interface PolicyFrameworkViewProps {
  lang: Language;
  onBack: () => void;
}

export const PolicyFrameworkView: React.FC<PolicyFrameworkViewProps> = ({ lang, onBack }) => {
  const t = getTranslation(lang, 'policy');
  const isZh = lang === 'zh';

  useEffect(() => {
    updateMetadata(`${t.title} - SomnoAI Digital Sleep Lab`, t.subtitle, '/policy');
  }, [lang, t.title, t.subtitle]);

  return (
    <div className="min-h-screen bg-black pt-4 pb-32 animate-in fade-in slide-in-from-right-4 duration-500 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#1e1b4b_0%,transparent_50%)] opacity-30" />
      
      <header className="flex items-center gap-4 mb-8 px-4 max-w-4xl mx-auto pt-16 relative z-10">
        <button 
          onClick={onBack}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all active:scale-90 border border-white/5 shadow-lg"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter text-white">
            🧠 SomnoAI Digital Sleep Lab — {t.title}
          </h1>
          <p className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-[0.3em] mt-0.5">
            {t.subtitle}
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 relative z-10 space-y-8">
        
        {/* Security Policy */}
        <section className="backdrop-blur-3xl bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-3 text-white border-b border-white/5 pb-6 mb-6">
            <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 border border-indigo-500/20">
              <Lock size={24} />
            </div>
            <h2 className="text-2xl font-black italic tracking-tight">{t.security.title}</h2>
          </div>
          <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
            <p>{t.security.intro}</p>
            <p>{t.security.safeguardsTitle}</p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-slate-400">
              {t.security.safeguards.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p className="mt-6">{t.security.prohibitionsTitle}</p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-slate-400">
              {t.security.prohibitions.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p className="mt-6 font-bold text-rose-400 bg-rose-500/10 p-4 rounded-xl border border-rose-500/20">
              {t.security.footer}
            </p>
          </div>
        </section>

        {/* Acceptable Use Policy */}
        <section className="backdrop-blur-3xl bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-3 text-white border-b border-white/5 pb-6 mb-6">
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20">
              <CheckCircle size={24} />
            </div>
            <h2 className="text-2xl font-black italic tracking-tight">{t.acceptableUse.title}</h2>
          </div>
          <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
            <p>{t.acceptableUse.intro}</p>
            <p>{t.acceptableUse.prohibitionsTitle}</p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-slate-400">
              {t.acceptableUse.prohibitions.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p className="mt-6 font-bold text-indigo-300">
              {t.acceptableUse.footer}
            </p>
          </div>
        </section>

        {/* AI Usage Disclaimer */}
        <section className="backdrop-blur-3xl bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-3 text-white border-b border-white/5 pb-6 mb-6">
            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 border border-blue-500/20">
              <Activity size={24} />
            </div>
            <h2 className="text-2xl font-black italic tracking-tight">{t.aiDisclaimer.title}</h2>
          </div>
          <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
            <p>{t.aiDisclaimer.intro}</p>
            <p>{t.aiDisclaimer.outputsTitle}</p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-slate-400">
              {t.aiDisclaimer.outputs.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p className="mt-6">{t.aiDisclaimer.responsibility}</p>
            <p className="font-bold text-blue-300">
              {t.aiDisclaimer.footer}
            </p>
          </div>
        </section>

        {/* Medical Disclaimer */}
        <section className="backdrop-blur-3xl bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-3 text-white border-b border-white/5 pb-6 mb-6">
            <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-400 border border-rose-500/20">
              <AlertTriangle size={24} />
            </div>
            <h2 className="text-2xl font-black italic tracking-tight">{t.medicalDisclaimer.title}</h2>
          </div>
          <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
            <p className="font-bold text-rose-300">{t.medicalDisclaimer.intro}</p>
            <p>{t.medicalDisclaimer.recommendationsTitle}</p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-slate-400">
              {t.medicalDisclaimer.recommendations.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p className="mt-6 font-bold">{t.medicalDisclaimer.consult}</p>
            <p className="italic text-slate-400">{t.medicalDisclaimer.footer}</p>
          </div>
        </section>

        {/* Data Processing Statement */}
        <section className="backdrop-blur-3xl bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-3 text-white border-b border-white/5 pb-6 mb-6">
            <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400 border border-purple-500/20">
              <Database size={24} />
            </div>
            <h2 className="text-2xl font-black italic tracking-tight">{t.dataProcessing.title}</h2>
          </div>
          <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
            <p>{t.dataProcessing.intro}</p>
            <p>{t.dataProcessing.typesTitle}</p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-slate-400">
              {t.dataProcessing.types.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p className="mt-6">{t.dataProcessing.purposesTitle}</p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-slate-400">
              {t.dataProcessing.purposes.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p className="mt-6">{t.dataProcessing.safeguards}</p>
            <p>{t.dataProcessing.retention}</p>
          </div>
        </section>

        {/* Cookie Policy */}
        <section className="backdrop-blur-3xl bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-3 text-white border-b border-white/5 pb-6 mb-6">
            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-400 border border-amber-500/20">
              <Cookie size={24} />
            </div>
            <h2 className="text-2xl font-black italic tracking-tight">{t.cookie.title}</h2>
          </div>
          <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
            <p>{t.cookie.intro}</p>
            <p>{t.cookie.purposesTitle}</p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-slate-400">
              {t.cookie.purposes.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p className="mt-6">{t.cookie.control}</p>
            <p className="italic text-slate-400">{t.cookie.footer}</p>
          </div>
        </section>

        {/* Abuse Reporting Policy */}
        <section className="backdrop-blur-3xl bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-3 text-white border-b border-white/5 pb-6 mb-6">
            <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-400 border border-orange-500/20">
              <Flag size={24} />
            </div>
            <h2 className="text-2xl font-black italic tracking-tight">{t.abuse.title}</h2>
          </div>
          <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
            <p>{t.abuse.intro}</p>
            <p>{t.abuse.reportTitle}</p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-slate-400">
              {t.abuse.reports.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p className="mt-6">{t.abuse.detail}</p>
            <p>{t.abuse.actionsTitle}</p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-slate-400">
              {t.abuse.actions.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Account Blocking Policy */}
        <section className="backdrop-blur-3xl bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-3 text-white border-b border-white/5 pb-6 mb-6">
            <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-400 border border-rose-500/20">
              <Shield size={24} />
            </div>
            <h2 className="text-2xl font-black italic tracking-tight">{t.blocking.title}</h2>
          </div>
          <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
            <p>{t.blocking.intro}</p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-slate-400">
              {t.blocking.reasons.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p className="mt-6 font-bold text-rose-300">
              {t.blocking.notification}
            </p>
            <p className="italic text-slate-400">
              {t.blocking.footer}
            </p>
          </div>
        </section>

      </div>
    </div>
  );
};
