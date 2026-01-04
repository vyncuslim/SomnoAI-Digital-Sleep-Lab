import React from 'react';
import { ArrowLeft, FileText, ShieldCheck, Lock, ShieldAlert, Eye, AlertTriangle, Cpu, Terminal, Activity, Zap } from 'lucide-react';
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
            {isPrivacy ? (isZh ? '隐私协议' : 'Privacy Protocol') : (isZh ? '使用条款' : 'Usage Terms')}
          </h1>
          <p className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-[0.3em] mt-0.5">
            Somno Lab • {isZh ? '合规版本 v2025.1' : 'Compliance v2025.1'}
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
                <h2 className="text-xl font-bold italic tracking-tight">{isZh ? '1. 遥测架构 (数据访问)' : '1. Telemetry Schema'}</h2>
              </div>
              <p className="font-medium text-slate-400">
                {isZh ? '为了合成您的“睡眠架构图”，本实验室仅请求访问以下 Google Fit 数据集的只读权限：' : 'To synthesize your "Sleep Architecture Map," the lab requests read-only access to the following Google Fit datasets:'}
              </p>
              <ul className="space-y-6">
                <li className="flex gap-4 items-start bg-white/[0.03] p-4 rounded-2xl border border-white/5">
                  <span className="mono text-indigo-500 font-bold mt-1 shrink-0">0x01</span>
                  <div>
                    <strong className="text-white uppercase text-[10px] tracking-widest block mb-1">{isZh ? '睡眠分段 (com.google.sleep.segment)' : 'Sleep Segments'}</strong>
                    <span className="text-[11px] opacity-70">{isZh ? '用于识别深度、REM 和浅睡阶段，构建睡眠分析基础。' : 'Used to identify sleep stages for AI architecture analysis.'}</span>
                  </div>
                </li>
                <li className="flex gap-4 items-start bg-white/[0.03] p-4 rounded-2xl border border-white/5">
                  <span className="mono text-indigo-500 font-bold mt-1 shrink-0">0x02</span>
                  <div>
                    <strong className="text-white uppercase text-[10px] tracking-widest block mb-1">{isZh ? '心率遥测 (com.google.heart_rate.bpm)' : 'Heart Rate Telemetry'}</strong>
                    <span className="text-[11px] opacity-70">{isZh ? '用于计算静息心率 (RHR)，校准生理恢复指标。' : 'Used to calculate RHR and calibrate recovery metrics.'}</span>
                  </div>
                </li>
                <li className="flex gap-4 items-start bg-white/[0.03] p-4 rounded-2xl border border-white/5">
                  <span className="mono text-indigo-500 font-bold mt-1 shrink-0">0x03</span>
                  <div>
                    <strong className="text-white uppercase text-[10px] tracking-widest block mb-1">{isZh ? '能量流 (com.google.calories.expended)' : 'Metabolic Flow'}</strong>
                    <span className="text-[11px] opacity-70">{isZh ? '将代谢数据与睡眠效率关联，提供多维视图。' : 'Correlates expenditure with efficiency for a multi-dimensional view.'}</span>
                  </div>
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
                  {isZh 
                    ? 'Somno 对从 Google API 接收的信息的使用，将遵守 Google API 服务用户数据政策，包括其中的“有限使用”要求。我们绝不将您的健康数据用于广告、画像或任何第三方数据交易。' 
                    : "Somno adheres to the Google API Services User Data Policy, ensuring health data is never shared for advertising, profiling, or third-party brokers."}
                </p>
              </div>
            </section>

            <section className="space-y-6 relative z-10">
              <div className="flex items-center gap-3 text-white border-b border-white/5 pb-4">
                <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                  <Lock size={20} />
                </div>
                <h2 className="text-xl font-bold italic tracking-tight">{isZh ? '2. 零后端处理协议' : '2. Zero-Backend Processing'}</h2>
              </div>
              <p className="font-medium text-slate-400">
                {isZh 
                  ? '您的数据仅在浏览器临时内存 (sessionStorage) 中流动。 Somno 不设后端数据库，页面关闭即物理销毁。' 
                  : 'Somno executes total isolation. Data exists in transient memory (sessionStorage) and is purged upon session termination. No biometric data is uploaded to remote storage.'}
              </p>
            </section>

            <footer className="pt-12 border-t border-white/5 text-center opacity-40">
              <p className="text-[9px] font-black uppercase tracking-widest">© 2025 SOMNO DIGITAL LAB • vyncus.lim</p>
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
                  {isZh ? '本实验室提供的分析仅供个人研究参考。我们不是医疗服务，不提供临床诊断。' : 'SOMNO IS NOT A MEDICAL SERVICE. All projections are for personal research only and should not replace clinical diagnosis.'}
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 text-white">
                  <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                    <Zap size={20} />
                  </div>
                  <h2 className="text-xl font-bold italic tracking-tight">{isZh ? '1. 数据完整性' : '1. Data Integrity'}</h2>
                </div>
                <p className="font-medium text-slate-400 leading-relaxed">
                  {isZh ? '分析报告的准确性完全取决于您的穿戴设备提供的 Google Fit 遥测数据。' : 'Report accuracy depends entirely on the high-fidelity telemetry provided by your wearable via Google Fit.'}
                </p>
              </div>
            </section>

            <footer className="pt-12 border-t border-white/5 flex justify-between items-center opacity-50">
              <p className="text-[9px] mono uppercase tracking-widest">Protocol v3.4.L</p>
              <p className="text-[9px] mono uppercase tracking-widest">2025.01.12</p>
            </footer>
          </>
        )}
      </div>
    </div>
  );
};