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
            {isPrivacy ? (isZh ? '隐私协议' : 'Privacy Protocol') : (isZh ? '服务条款' : 'Usage Terms')}
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
                <h2 className="text-xl font-bold italic tracking-tight">{isZh ? '数据访问与使用' : 'Data Access & Usage'}</h2>
              </div>
              <div className="space-y-4 text-slate-300">
                <p className="font-bold text-white italic">最后更新：2026 年 1 月 4 日</p>
                <p>
                  <strong className="text-indigo-400 block mb-1">Google API 数据访问说明</strong>
                  当您授权连接 Google Fit，本应用会访问您的 <span className="text-white">睡眠分段、心率及活动能量</span> 数据，仅用于数字睡眠分析。
                </p>
                <p>
                  <strong className="text-indigo-400 block mb-1">数据使用</strong>
                  所有数据仅用于应用内可视化与 AI 分析，不会用于广告或第三方分享。
                </p>
              </div>
            </section>

            <section className="space-y-4 relative z-10">
              <div className="p-8 bg-indigo-500/10 border border-indigo-500/20 rounded-[2rem] space-y-4 shadow-inner">
                <div className="flex items-center gap-3 text-indigo-400">
                  <ShieldAlert size={20} />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Limited Use Disclosure</h3>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-medium italic">
                  Somno 对从 Google API 接收的信息的使用将遵守 Google API 服务用户数据政策，包括其中的“有限使用”要求。
                </p>
              </div>
            </section>

            <section className="space-y-6 relative z-10">
              <div className="flex items-center gap-3 text-white border-b border-white/5 pb-4">
                <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                  <Lock size={20} />
                </div>
                <h2 className="text-xl font-bold italic tracking-tight">{isZh ? '数据存储与权利' : 'Storage & Rights'}</h2>
              </div>
              <div className="space-y-4">
                <p>
                  <strong className="text-white block">数据存储</strong>
                  数据只存储在浏览器本地 sessionStorage 中，一旦关闭页面即删除。
                </p>
                <p>
                  <strong className="text-white block">用户权利</strong>
                  您可随时在 Google 账号中撤销应用访问权限。
                </p>
              </div>
            </section>
          </>
        ) : (
          <>
            <section className="space-y-8 relative z-10 text-[12px]">
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-[2rem] p-8 space-y-4 shadow-lg shadow-rose-950/20">
                <div className="flex items-center gap-3 text-rose-400">
                  <AlertTriangle size={20} />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">{isZh ? '数据使用与责任声明' : 'Disclaimer'}</h3>
                </div>
                <p className="text-slate-300 leading-relaxed font-bold italic">
                  本应用仅用于分析和个性化建议。我们不对因 Google Fit 数据不完整造成的分析结果准确性负责。AI 洞察不作为医疗诊断依据。
                </p>
              </div>

              <div className="space-y-6 text-slate-400">
                <div className="flex items-center gap-3 text-white">
                  <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                    <Zap size={20} />
                  </div>
                  <h2 className="text-xl font-bold italic tracking-tight">{isZh ? '核心服务条款' : 'Terms Summary'}</h2>
                </div>
                <ul className="list-disc pl-5 space-y-4">
                  <li>使用即表示您同意遵守本服务条款及隐私政策。</li>
                  <li>基于您授权的数据（睡眠分段、心率、活动能量）提供洞察。</li>
                  <li>您需妥善保管 Google 账号授权，自行承担安全责任。</li>
                  <li>禁止干扰系统、非法侵权或未经允许的数据收集行为。</li>
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
          <p className="text-[9px] font-black uppercase tracking-widest">© 2026 SOMNO Lab • {isZh ? '最后更新日期： 2026.01.04' : 'Last Updated: 2026.01.04'}</p>
        </footer>
      </div>
    </div>
  );
};