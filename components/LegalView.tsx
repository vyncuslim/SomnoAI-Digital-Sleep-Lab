
import React from 'react';
import { ArrowLeft, FileText, ShieldCheck, Lock, ShieldAlert, Activity, AlertTriangle, Zap, Mail, ExternalLink } from 'lucide-react';
import { Language } from '../services/i18n.ts';

interface LegalViewProps {
  type: 'privacy' | 'terms';
  lang: Language;
  onBack: () => void;
}

export const LegalView: React.FC<LegalViewProps> = ({ type, lang, onBack }) => {
  const isPrivacy = type === 'privacy';
  const isZh = lang === 'zh';

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
            {isPrivacy ? (isZh ? '隐私政策' : 'Privacy Policy') : (isZh ? '服务条款' : 'Terms of Service')}
          </h1>
          <p className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-[0.3em] mt-0.5">
            Somno Lab • {isZh ? '2025.01.04 版' : 'v2025.01.04'}
          </p>
        </div>
      </header>

      <div className="backdrop-blur-3xl bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-8 md:p-12 space-y-12 leading-relaxed text-slate-300 text-[13px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none text-white">
          {isPrivacy ? <ShieldCheck size={160} /> : <FileText size={160} />}
        </div>

        {isPrivacy ? (
          <>
            <section className="space-y-6 relative z-10">
              <div className="flex items-center gap-3 text-white border-b border-white/5 pb-4">
                <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                  <Activity size={20} />
                </div>
                <h2 className="text-xl font-bold italic tracking-tight">{isZh ? '1. 数据访问' : '1. Data Access'}</h2>
              </div>
              <p>{isZh ? '我们通过 fitness.sleep.read、fitness.heart_rate.read 和 fitness.activity.read 范围访问您的睡眠、心率和能量消耗数据。' : 'We access your sleep, heart rate, and activity data via fitness.sleep.read, fitness.heart_rate.read, and fitness.activity.read scopes.'}</p>
            </section>

            <section className="space-y-6 relative z-10">
              <div className="flex items-center gap-3 text-white border-b border-white/5 pb-4">
                <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                  <Zap size={20} />
                </div>
                <h2 className="text-xl font-bold italic tracking-tight">{isZh ? '2. 数据用途' : '2. Data Usage'}</h2>
              </div>
              <p>{isZh ? '数据仅用于在应用内生成睡眠图表、评分，并通过脱敏处理发送至 Gemini AI 生成个人健康建议。' : 'Data is used for in-app charts, scores, and sent (anonymized) to Gemini AI for health recommendations.'}</p>
            </section>

            <section className="space-y-6 relative z-10">
              <div className="flex items-center gap-3 text-white border-b border-white/5 pb-4">
                <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                  <Lock size={20} />
                </div>
                <h2 className="text-xl font-bold italic tracking-tight">{isZh ? '3. 有限使用与安全' : '3. Limited Use & Security'}</h2>
              </div>
              <p>{isZh ? '我们严格遵守 Google 的有限使用政策。数据仅在浏览器本地会话中处理，绝不用于广告、分析或向第三方销售。' : 'We strictly follow Google\'s Limited Use Policy. Data is processed locally and never used for advertising or third-party sales.'}</p>
            </section>
          </>
        ) : (
          <>
            <section className="space-y-8 relative z-10">
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-[2rem] p-8 space-y-4 shadow-lg shadow-rose-950/20">
                <div className="flex items-center gap-3 text-rose-400">
                  <AlertTriangle size={20} />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">{isZh ? '医疗免责声明' : 'Medical Disclaimer'}</h3>
                </div>
                <p className="text-[12px] text-slate-300 leading-relaxed font-bold italic">
                  {isZh ? '本服务不提供医疗诊断。AI 生成内容仅供参考，任何健康决策前请咨询专业医生。' : 'This service does not provide medical diagnosis. AI content is for reference; consult a doctor for health decisions.'}
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 text-white border-b border-white/5 pb-4">
                  <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                    <ShieldCheck size={20} />
                  </div>
                  <h2 className="text-xl font-bold italic tracking-tight">{isZh ? 'Google API 使用规范' : 'Google API Usage'}</h2>
                </div>
                <p>{isZh ? '您确认已了解本应用访问 Google Fit 数据的具体范围，并同意应用的数据处理方式。' : 'You confirm you understand the scopes accessed from Google Fit and agree to the data processing.'}</p>
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
            {isZh ? '在新窗口阅读完整版文档' : 'Read Full Document in New Window'}
          </a>
        </div>

        <footer className="pt-12 border-t border-white/5 flex flex-col items-center gap-4 opacity-40">
          <div className="flex items-center gap-2 text-indigo-400">
            <Mail size={12} />
            <span className="text-[10px] font-bold">ongyuze1401@gmail.com</span>
          </div>
          <p className="text-[9px] font-black uppercase tracking-widest">© 2025 SOMNO LAB • {isZh ? '合规性更新： 2025.01.04' : 'Compliance Update: 2025.01.04'}</p>
        </footer>
      </div>
    </div>
  );
};
