import React from 'react';
import { ArrowLeft, FileText, ShieldCheck, Lock, ShieldAlert, Globe, Search, Eye, AlertTriangle, Cpu, Terminal } from 'lucide-react';
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
            {isPrivacy ? (isZh ? '隐私权政策' : 'Privacy Protocol') : (isZh ? '服务条款' : 'Usage Terms')}
          </h1>
          <p className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-[0.3em] mt-0.5">
            Somno Lab • {isZh ? '合规版本 v2025.01' : 'Compliance v2025.01'}
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
                  <Eye size={20} />
                </div>
                <h2 className="text-xl font-bold italic tracking-tight">{isZh ? '1. 数据访问说明 (Data Accessed)' : '1. Telemetry Access'}</h2>
              </div>
              <p className="font-medium text-slate-400">{isZh ? '在获得您的明确授权后，本实验室仅通过 Google API 访问实现核心分析所必需的特定健康数据：' : 'Upon explicit authorization, our neural engine accesses specific telemetry required for architecture synthesis:'}</p>
              <ul className="space-y-4 pl-2">
                <li className="flex gap-4 items-start">
                  <span className="mono text-indigo-500 font-bold mt-1 shrink-0">0x01</span>
                  <span><strong>{isZh ? '睡眠分期数据' : 'Sleep Segments'}:</strong> {isZh ? '读取睡眠阶段及其持续时间，用于解析您的睡眠架构。' : 'Reads binary sleep stages to parse physiological architecture.'}</span>
                </li>
                <li className="flex gap-4 items-start">
                  <span className="mono text-indigo-500 font-bold mt-1 shrink-0">0x02</span>
                  <span><strong>{isZh ? '生理心率指标' : 'Cardiac Data'}:</strong> {isZh ? '读取静息心率及其波动，用于评估身体恢复水平。' : 'Reads pulse telemetry to calibrate neural recovery index.'}</span>
                </li>
              </ul>
            </section>

            <section className="space-y-4 relative z-10">
              <div className="p-8 bg-indigo-500/10 border border-indigo-500/20 rounded-[2rem] space-y-4 shadow-inner">
                <div className="flex items-center gap-3 text-indigo-400">
                  <ShieldAlert size={20} />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">{isZh ? 'Google API 有限使用披露' : 'Google API Limited Use Disclosure'}</h3>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-medium italic">
                  {isZh ? '本应用承诺遵守 Google API 用户数据政策及其有限使用要求。我们严禁将接收的数据用于广告投放或共享给任何第三方数据经纪人。' : "Our use and transfer of information received from Google APIs adheres to the Google API Service User Data Policy, ensuring health data is never shared for advertising or profiling."}
                </p>
              </div>
            </section>

            <section className="space-y-6 relative z-10">
              <div className="flex items-center gap-3 text-white border-b border-white/5 pb-4">
                <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                  <Lock size={20} />
                </div>
                <h2 className="text-xl font-bold italic tracking-tight">{isZh ? '2. 零后端隐私架构' : '2. Zero-Backend Protocol'}</h2>
              </div>
              <p className="font-medium text-slate-400">
                {isZh ? '本应用采用物理级隔离。所有 Google 用户数据仅暂存在浏览器临时内存中，绝不上传至任何服务器，且会话结束即刻销毁。' : 'Somno executes total physical isolation. No Google user data is uploaded or stored on remote servers. All data exists in transient memory and is purged upon session termination.'}
              </p>
              <div className="flex items-center gap-2 p-3 bg-white/5 rounded-2xl border border-white/5">
                <Terminal size={12} className="text-slate-500" />
                <span className="text-[9px] mono uppercase text-slate-500 tracking-widest">Secure Handshake: Established</span>
              </div>
            </section>

            <footer className="pt-12 border-t border-white/5 space-y-4 text-center">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                {isZh ? '联系研究官' : 'Contact Research Officer'}: ongyuze1401@gmail.com
              </p>
              <p className="text-[8px] mono text-slate-700 font-bold uppercase tracking-[0.4em]">© 2025 SOMNO DIGITAL LAB</p>
            </footer>
          </>
        ) : (
          <>
            <section className="space-y-8 relative z-10">
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-[2rem] p-8 space-y-4">
                <div className="flex items-center gap-3 text-rose-400">
                  <AlertTriangle size={20} />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">{isZh ? '医疗免责声明' : 'Medical Disclaimer'}</h3>
                </div>
                <p className="text-[12px] text-slate-300 leading-relaxed font-bold italic">
                  {isZh ? '本实验室提供的分析仅供科研参考。我们不是医疗设备，不提供临床诊断。' : 'SOMNO IS NOT A MEDICAL DEVICE. All projections are for research purposes only and should not replace clinical diagnosis.'}
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 text-white">
                  <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                    <Cpu size={20} />
                  </div>
                  <h2 className="text-xl font-bold italic tracking-tight">{isZh ? '1. 平台定位' : '1. Digital Lab Environment'}</h2>
                </div>
                <p className="font-medium text-slate-400 leading-relaxed">
                  {isZh ? '通过使用本系统，即表示您理解并同意这是一款用于可视化生理指标的实验性工具。' : 'By initializing this system, you acknowledge that Somno is an experimental tool for visualizing physiological telemetry.'}
                </p>
              </div>
            </section>

            <footer className="pt-12 border-t border-white/5 flex justify-between items-center opacity-50">
              <p className="text-[9px] mono uppercase tracking-widest">Protocol v3.4.L</p>
              <p className="text-[9px] mono uppercase tracking-widest">{isZh ? '更新于' : 'Updated'}: 2025.01.05</p>
            </footer>
          </>
        )}
      </div>
    </div>
  );
};