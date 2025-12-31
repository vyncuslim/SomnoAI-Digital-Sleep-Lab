
import React from 'react';
import { ArrowLeft, FileText, ShieldCheck, Mail } from 'lucide-react';

interface LegalViewProps {
  type: 'privacy' | 'terms';
  onBack: () => void;
}

export const LegalView: React.FC<LegalViewProps> = ({ type, onBack }) => {
  const isPrivacy = type === 'privacy';

  return (
    <div className="min-h-screen pt-4 pb-20 animate-in fade-in slide-in-from-right-4 duration-500">
      <header className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black italic tracking-tight text-white">
            {isPrivacy ? '隐私权政策' : '服务条款'}
          </h1>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-0.5">
            SomnoAI Lab • 法律合规文档
          </p>
        </div>
      </header>

      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-8 leading-relaxed text-slate-300 text-sm shadow-2xl">
        {isPrivacy ? (
          <>
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-400">
                <FileText size={18} />
                <h2 className="text-lg font-bold">1. 数据收集声明</h2>
              </div>
              <p>SomnoAI Lab 仅在您明确授权的情况下通过 Google Fit API 访问以下数据：睡眠分段数据、心率数据及能量消耗数据。</p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-400">
                <ShieldCheck size={18} />
                <h2 className="text-lg font-bold">2. 数据使用用途</h2>
              </div>
              <p>我们访问数据的唯一目的是为您提供数字化的睡眠架构可视化分析、生理特征趋势报告以及 AI 健康建议。所有分析均在应用运行时实时生成。</p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-400">
                <ShieldCheck size={18} />
                <h2 className="text-lg font-bold">3. 数据存储与共享</h2>
              </div>
              <p>我们不共享数据：我们承诺不会向任何第三方销售、共享或披露您的个人健康数据。您的 Google Fit 访问令牌仅存储在浏览器 SessionStorage 中。</p>
            </section>

            <section className="space-y-4 pt-6 border-t border-white/5 flex items-center gap-3">
              <Mail size={16} className="text-slate-500" />
              <p className="text-xs text-slate-500">联系开发者: ongyuze1401@gmail.com</p>
            </section>
          </>
        ) : (
          <>
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-400">
                <FileText size={18} />
                <h2 className="text-lg font-bold">1. 服务定义</h2>
              </div>
              <p>SomnoAI 是一款实验性的数字化睡眠实验室工具。它通过可视化技术和 AI 模型处理生理数据，以提供个人参考价值的健康洞察。</p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-amber-500">
                <ShieldCheck size={18} />
                <h2 className="text-lg font-bold">2. 非医疗建议声明</h2>
              </div>
              <p className="text-amber-400/90 font-bold bg-amber-500/5 p-4 rounded-2xl border border-amber-500/20">
                重要：本应用提供的所有分析仅供个人参考。本应用并非医疗设备，不能用于疾病的诊断或治疗。做出任何医疗决策前请咨询专业医生。
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-400">
                <ShieldCheck size={18} />
                <h2 className="text-lg font-bold">3. 数据访问授权</h2>
              </div>
              <p>通过使用 Google Fit 同步功能，您确认已阅读并同意本应用的隐私政策，并授权本应用读取必要的健康指标。</p>
            </section>
          </>
        )}
      </div>
    </div>
  );
};
