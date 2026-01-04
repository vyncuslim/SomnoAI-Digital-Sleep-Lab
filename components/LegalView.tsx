import React from 'react';
import { ArrowLeft, FileText, ShieldCheck, Lock, ShieldAlert, Globe, Search, Eye } from 'lucide-react';
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
          className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all active:scale-90 border border-white/5"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black italic tracking-tight text-white">
            {isPrivacy ? (isZh ? '隐私权政策' : 'Privacy Policy') : (isZh ? '服务条款' : 'Terms of Service')}
          </h1>
          <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em] mt-0.5">
            Somno Digital Sleep Lab • {isZh ? '合规版本 v2024.05' : 'Compliance v2024.05'}
          </p>
        </div>
      </header>

      <div className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-8 md:p-12 space-y-12 leading-relaxed text-slate-300 text-sm shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-white">
          {isPrivacy ? <ShieldCheck size={160} /> : <FileText size={160} />}
        </div>

        {isPrivacy ? (
          <>
            <section className="space-y-6 relative z-10">
              <div className="flex items-center gap-3 text-white border-b border-white/5 pb-4">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                  <Eye size={20} />
                </div>
                <h2 className="text-xl font-bold italic">{isZh ? '1. 数据访问说明 (Data Accessed)' : '1. Data Accessed'}</h2>
              </div>
              <p>{isZh ? '在获得您的明确授权后，本实验室仅通过 Google API 访问实现核心分析所必需的特定健康数据：' : 'Upon your explicit authorization, we access only the specific health data required for our core analysis via Google APIs:'}</p>
              <ul className="list-disc pl-5 space-y-2 text-slate-400 font-medium">
                <li><strong>{isZh ? '睡眠分期数据' : 'Sleep Segments'}:</strong> {isZh ? '读取睡眠阶段及其持续时间，用于解析您的睡眠架构。' : 'Reads sleep stages and durations to parse your sleep architecture.'}</li>
                <li><strong>{isZh ? '生理心率指标' : 'Heart Rate'}:</strong> {isZh ? '读取静息心率及其波动，用于评估身体恢复水平。' : 'Reads pulse fluctuations to evaluate physiological recovery.'}</li>
                <li><strong>{isZh ? '能量消耗数据' : 'Activity'}:</strong> {isZh ? '读取代谢卡路里指标，用于多维能效对比。' : 'Reads metabolic burn for multi-dimensional efficiency analysis.'}</li>
              </ul>
            </section>

            <section className="space-y-6 relative z-10">
              <div className="flex items-center gap-3 text-white border-b border-white/5 pb-4">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                  <Search size={20} />
                </div>
                <h2 className="text-xl font-bold italic">{isZh ? '2. 数据使用用途 (Data Usage)' : '2. Data Usage'}</h2>
              </div>
              <p>{isZh ? '我们访问数据仅用于在您的本地设备上提供数字化睡眠分析服务：' : 'Accessed Google data is used exclusively to provide digital sleep analysis on your local device:'}</p>
              <ul className="list-disc pl-5 space-y-2 text-slate-400">
                <li><strong>{isZh ? '实时评分计算' : 'Real-time Scoring'}:</strong> {isZh ? '在本地直接计算您的睡眠分数与恢复指标。' : 'Computes sleep scores and recovery metrics directly in-browser.'}</li>
                <li><strong>{isZh ? 'AI 洞察生成' : 'AI Deep Insight'}:</strong> {isZh ? '将脱敏后的数值发送至 AI 引擎，生成个性化的科学建议。' : 'Sends anonymized metrics to the AI engine for scientific suggestions.'}</li>
                <li><strong>{isZh ? '趋势图谱绘制' : 'Visual Mapping'}:</strong> {isZh ? '将生理指标聚合为历史趋势图表，辅助自我管理。' : 'Aggregates biometrics into historical charts for self-monitoring.'}</li>
              </ul>
            </section>

            <section className="space-y-4 relative z-10">
              <div className="p-8 bg-indigo-500/10 border border-indigo-500/20 rounded-[2rem] space-y-4">
                <div className="flex items-center gap-3 text-indigo-400">
                  <ShieldAlert size={20} />
                  <h3 className="text-xs font-black uppercase tracking-widest">{isZh ? 'Google API 有限使用披露' : 'Google API Limited Use Disclosure'}</h3>
                </div>
                <p className="text-xs text-indigo-100/80 leading-relaxed italic">
                  {isZh ? '本应用承诺遵守 Google API 用户数据政策及其有限使用要求。我们严禁将接收的数据用于广告投放或共享给任何第三方数据经纪人。' : "Our use and transfer of information received from Google APIs adheres to the Google API Service User Data Policy, including Limited Use requirements."}
                </p>
              </div>
            </section>

            <section className="space-y-4 relative z-10">
              <div className="flex items-center gap-3 text-white border-b border-white/5 pb-4">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                  <Lock size={20} />
                </div>
                <h2 className="text-xl font-bold italic">{isZh ? '3. 存储与共享规范' : '3. Storage & Sharing'}</h2>
              </div>
              <p>{isZh ? '本应用采用“零后端”架构。所有数据仅暂存在浏览器临时内存中，不上传至任何服务器，且绝不共享给第三方。会话结束（刷新或关闭页面）即刻销毁。' : 'Somno is a zero-backend application. No Google user data is uploaded or stored on servers. Data resides in transient memory and is purged upon session end.'}</p>
            </section>

            <footer className="pt-8 border-t border-white/5 space-y-4 text-center">
              <p className="text-xs font-bold text-slate-400">{isZh ? '隐私咨询' : 'Privacy Contact'}: ongyuze1401@gmail.com</p>
              <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em]">© 2024 Somno Digital Sleep Lab.</p>
            </footer>
          </>
        ) : (
          <>
            <section className="space-y-4 relative z-10">
              <div className="flex items-center gap-3 text-white">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                  <Globe size={20} />
                </div>
                <h2 className="text-xl font-bold italic">{isZh ? '1. 平台协议' : '1. Platform Agreement'}</h2>
              </div>
              <p>{isZh ? '通过使用本实验室，即表示您同意本条款。本平台仅为数字化实验环境，不替代专业医疗诊断。' : 'By using Somno, you agree to these terms. This is an experimental environment and not a medical device.'}</p>
            </section>

            <footer className="pt-8 border-t border-white/5 flex justify-between items-center">
              <p className="text-[10px] text-slate-500 italic">Version: v2024.05.L | {isZh ? '更新于' : 'Updated'}: 2024.05.22</p>
            </footer>
          </>
        )}
      </div>
    </div>
  );
};
