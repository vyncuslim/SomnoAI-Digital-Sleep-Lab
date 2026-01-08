
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
            Somno Lab • {isZh ? '2026.01.04 版' : 'v2026.01.04'}
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
                 <h2 className="text-[11px] font-black uppercase tracking-widest">{isZh ? 'Google API 有限使用披露' : 'Google API Limited Use Disclosure'}</h2>
              </div>
              <p className="italic text-slate-400">
                {isZh 
                  ? 'Somno Lab 对从 Google API 接收到的信息的使用和转移将遵守 Google API 服务用户数据政策，包括其中的有限使用要求。本应用通过这些 API 桥接 Health Connect 数据。' 
                  : 'Somno Lab\'s use and transfer to any other app of information received from Google APIs will adhere to Google API Services User Data Policy, including the Limited Use requirements. This is used to bridge Health Connect data.'}
              </p>
            </section>

            <section className="space-y-6 relative z-10">
              <div className="flex items-center gap-3 text-white border-b border-white/5 pb-4">
                <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                  <Activity size={20} />
                </div>
                <h2 className="text-xl font-bold italic tracking-tight">{isZh ? '1. 数据访问' : '1. Data Access'}</h2>
              </div>
              <p>{isZh ? '在您明确授权后，我们访问您的睡眠、心率、能量消耗和身体测量数据。这些范围是实现实验分析所必需的最小权限，并通过 Health Connect 基础架构进行同步。' : 'After your explicit authorization, we access sleep, heart rate, energy expenditure, and body measurement data. These represent the minimum scopes required for lab analysis, synced via the Health Connect infrastructure.'}</p>
            </section>

            <section className="space-y-6 relative z-10">
              <div className="flex items-center gap-3 text-white border-b border-white/5 pb-4">
                <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                  <Zap size={20} />
                </div>
                <h2 className="text-xl font-bold italic tracking-tight">{isZh ? '2. 数据用途' : '2. Data Usage'}</h2>
              </div>
              <p>{isZh ? '数据仅用于在应用内生成睡眠图表、评分，并通过脱敏处理发送至 Gemini AI 生成个人健康建议。我们不会为了广告、用户画像或销售给第三方而使用这些数据。' : 'Data is used for in-app charts and scores, and sent (anonymized) to Gemini AI for personalized health recommendations. We do not use this data for advertising, profiling, or third-party sales.'}</p>
            </section>

            <section className="space-y-6 relative z-10">
              <div className="flex items-center gap-3 text-white border-b border-white/5 pb-4">
                <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                  <Lock size={20} />
                </div>
                <h2 className="text-xl font-bold italic tracking-tight">{isZh ? '3. 边缘存储与安全' : '3. Edge Storage & Security'}</h2>
              </div>
              <p>{isZh ? '数据仅在浏览器本地会话（SessionStorage）中处理，绝不上传到我们的后端服务器。一旦您关闭页面或登出，所有敏感数据将被永久擦除。' : 'Data is processed locally in your browser (SessionStorage) and never uploaded to our servers. All sensitive metrics are purged immediately upon logout or tab closure.'}</p>
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
                  {isZh ? 'Somno Lab 不是医疗诊断工具。AI 生成的内容仅供教育和参考，在做出任何健康决策前，请咨询专业医疗人员。' : 'Somno Lab is not a medical device. AI content is for educational reference; consult a medical professional for health decisions.'}
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 text-white border-b border-white/5 pb-4">
                  <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                    <ShieldCheck size={20} />
                  </div>
                  <h2 className="text-xl font-bold italic tracking-tight">{isZh ? '数据授权规范' : 'Data Authorization'}</h2>
                </div>
                <p>{isZh ? '您确认已了解本应用访问 Health Connect 数据的具体范围，并同意应用的数据处理方式。' : 'You confirm you understand the scopes accessed from Health Connect and agree to the data processing.'}</p>
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
          <p className="text-[9px] font-black uppercase tracking-widest">© 2026 SOMNO LAB • {isZh ? '合规性更新： 2026.01.04' : 'Compliance Update: 2026.01.04'}</p>
        </footer>
      </div>
    </div>
  );
};
