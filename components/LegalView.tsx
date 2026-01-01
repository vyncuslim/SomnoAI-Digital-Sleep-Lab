import React from 'react';
import { ArrowLeft, FileText, ShieldCheck, Mail, Lock, Database, Info, ShieldAlert } from 'lucide-react';

interface LegalViewProps {
  type: 'privacy' | 'terms';
  onBack: () => void;
}

export const LegalView: React.FC<LegalViewProps> = ({ type, onBack }) => {
  const isPrivacy = type === 'privacy';

  return (
    <div className="min-h-screen pt-4 pb-24 animate-in fade-in slide-in-from-right-4 duration-500">
      <header className="flex items-center gap-4 mb-8 px-2">
        <button 
          onClick={onBack}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all active:scale-90 border border-white/5"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black italic tracking-tight text-white">
            {isPrivacy ? '隐私权政策' : '服务条款'}
          </h1>
          <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em] mt-0.5">
            SomnoAI Lab • 生效日期：2024年3月20日
          </p>
        </div>
      </header>

      <div className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-8 space-y-10 leading-relaxed text-slate-300 text-sm shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-white">
          {isPrivacy ? <ShieldCheck size={120} /> : <FileText size={120} />}
        </div>

        {isPrivacy ? (
          <>
            <section className="space-y-4 relative z-10">
              <div className="flex items-center gap-3 text-white">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                  <Database size={18} />
                </div>
                <h2 className="text-lg font-bold italic">1. 数据收集与授权</h2>
              </div>
              <p>SomnoAI Lab 仅在您明确授权后，通过 Google Fit API 访问以下数据：</p>
              <ul className="list-disc list-inside space-y-2 text-slate-400 ml-4 font-medium">
                <li>睡眠会话与分段</li>
                <li>历史心率数值 (BPM)</li>
                <li>代谢消耗 (Calories)</li>
              </ul>
            </section>

            <section className="space-y-4 relative z-10">
              <div className="p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl space-y-2">
                <div className="flex items-center gap-2 text-indigo-400">
                  <ShieldAlert size={18} />
                  <h3 className="text-xs font-black uppercase tracking-widest">Google API 有限使用政策合规</h3>
                </div>
                <p className="text-[11px] text-indigo-200/80 leading-relaxed italic">
                  我们对从 Google API 接收到的信息的使用和传输将遵守 Google API 服务用户数据政策，包括有限使用要求。
                </p>
              </div>
            </section>

            <section className="space-y-4 relative z-10">
              <div className="flex items-center gap-3 text-white">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                  <Lock size={18} />
                </div>
                <h2 className="text-lg font-bold italic">2. 数据存储与安全</h2>
              </div>
              <p>您的所有生理流数据均在浏览器端实时处理。我们不设任何后端服务器，您的健康数据不会被上传至我们的任何存储介质。</p>
              <p><strong>零共享保证：</strong>我们绝不向第三方（包括广告商或研究机构）出售或分发您的任何数据。</p>
            </section>

            <footer className="pt-8 border-t border-white/5">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-indigo-400" />
                <p className="text-xs font-bold text-slate-400">隐私合规：lynnesom26@gmail.com</p>
              </div>
            </footer>
          </>
        ) : (
          <>
            <section className="space-y-4 relative z-10">
              <div className="flex items-center gap-3 text-white">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                  <Info size={18} />
                </div>
                <h2 className="text-lg font-bold italic">1. 服务协议</h2>
              </div>
              <p>SomnoAI 是一个个人睡眠实验平台。本服务不提供任何医疗诊断或治疗方案。</p>
            </section>

            <section className="space-y-4 relative z-10">
              <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-3xl space-y-3">
                <div className="flex items-center gap-2 text-amber-400">
                  <ShieldCheck size={18} />
                  <h2 className="text-sm font-black uppercase tracking-widest">2. 核心医疗免责声明</h2>
                </div>
                <p className="text-xs text-amber-300/80 font-bold leading-relaxed italic">
                  警告：本应用生成的睡眠分数和 AI 建议仅供参考。在做出任何医疗决策前，请务必咨询专业医疗人员。
                </p>
              </div>
            </section>

            <section className="space-y-4 relative z-10">
              <div className="flex items-center gap-3 text-white">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                  <Lock size={18} />
                </div>
                <h2 className="text-lg font-bold italic">3. 责任限制</h2>
              </div>
              <p>本应用按“原样”提供。开发者不对由于 API 数据延迟或算法局限导致的分析误差承担法律责任。</p>
            </section>

            <footer className="pt-8 border-t border-white/5">
              <p className="text-[10px] text-slate-500 italic">最新更新于 2024年3月20日</p>
            </footer>
          </>
        )}
      </div>
    </div>
  );
};