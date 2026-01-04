import React from 'react';
import { ArrowLeft, FileText, ShieldCheck, Lock, ShieldAlert, Activity, AlertTriangle, Zap, Mail } from 'lucide-react';
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
            <section className="space-y-6 relative z-10">
              <div className="flex items-center gap-3 text-white border-b border-white/5 pb-4">
                <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                  <Activity size={20} />
                </div>
                <h2 className="text-xl font-bold italic tracking-tight">{isZh ? '1. 数据访问' : '1. Data Access'}</h2>
              </div>
              <p>{isZh ? '当您授权连接 Google Fit，本应用会访问您的睡眠分段、心率及活动能量数据，仅用于数字睡眠分析。' : 'SomnoAI accesses sleep segments, heart rate, and activity energy via Google Fit for digital sleep analysis.'}</p>
            </section>

            <section className="space-y-6 relative z-10">
              <div className="flex items-center gap-3 text-white border-b border-white/5 pb-4">
                <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                  <ShieldAlert size={20} />
                </div>
                <h2 className="text-xl font-bold italic tracking-tight">{isZh ? '2. 数据使用' : '2. Data Usage'}</h2>
              </div>
              <p>{isZh ? '所有数据仅用于应用内可视化与 AI 分析，不会用于广告、营销或第三方分享。处理均在本地浏览器中完成。' : 'Data is used solely for in-app analysis and visualization. No data is used for ads or shared with third parties.'}</p>
            </section>

            <section className="space-y-6 relative z-10">
              <div className="flex items-center gap-3 text-white border-b border-white/5 pb-4">
                <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                  <Lock size={20} />
                </div>
                <h2 className="text-xl font-bold italic tracking-tight">{isZh ? '3. 数据存储' : '3. Data Storage'}</h2>
              </div>
              <p>{isZh ? '本应用不设后端服务器。所有数据仅保存在本地 sessionStorage 中，一旦关闭页面即刻彻底删除。' : 'No backend storage. Data resides in sessionStorage and is purged immediately upon tab closure.'}</p>
            </section>
          </>
        ) : (
          <>
            <section className="space-y-8 relative z-10">
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-[2rem] p-8 space-y-4 shadow-lg shadow-rose-950/20">
                <div className="flex items-center gap-3 text-rose-400">
                  <AlertTriangle size={20} />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">{isZh ? '数据使用与责任限制' : 'Liability & Usage'}</h3>
                </div>
                <p className="text-[12px] text-slate-300 leading-relaxed font-bold italic">
                  {isZh ? '数据仅用于参考。我们不对因 Google Fit 数据异常导致的分析结果负责。AI 洞察不作为医疗诊断依据。' : 'Analysis results are for reference only. AI insights do not constitute clinical medical diagnosis.'}
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 text-white border-b border-white/5 pb-4">
                  <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                    <Zap size={20} />
                  </div>
                  <h2 className="text-xl font-bold italic tracking-tight">{isZh ? '核心服务协议' : 'Core Terms'}</h2>
                </div>
                <ul className="list-disc pl-5 space-y-4 text-slate-400">
                  <li>{isZh ? '使用 SomnoAI 即代表同意本条款。' : 'Using SomnoAI implies acceptance of these terms.'}</li>
                  <li>{isZh ? '您需妥善保管 Google 授权账号安全。' : 'You are responsible for your Google account security.'}</li>
                  <li>{isZh ? '严禁非法抓取数据或干扰系统运行。' : 'No data scraping or system interference allowed.'}</li>
                </ul>
              </div>
            </section>
          </>
        )}
        <footer className="pt-12 border-t border-white/5 flex flex-col items-center gap-4 opacity-40">
          <div className="flex items-center gap-2 text-indigo-400">
            <Mail size={12} />
            <span className="text-[10px] font-bold">ongyuze1401@gmail.com</span>
          </div>
          <p className="text-[9px] font-black uppercase tracking-widest">© 2026 SOMNO LAB • {isZh ? '更新日期： 2026.01.04' : 'Updated: 2026.01.04'}</p>
        </footer>
      </div>
    </div>
  );
};