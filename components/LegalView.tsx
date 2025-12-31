
import React from 'react';
import { ArrowLeft, FileText, ShieldCheck, Mail, Lock, Database, Info } from 'lucide-react';

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
            SomnoAI Lab • 开发者：lynnesom26@gmail.com
          </p>
        </div>
      </header>

      <div className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-8 space-y-10 leading-relaxed text-slate-300 text-sm shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          {isPrivacy ? <ShieldCheck size={120} /> : <FileText size={120} />}
        </div>

        {isPrivacy ? (
          <>
            <section className="space-y-4 relative z-10">
              <div className="flex items-center gap-3 text-white">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                  <Database size={18} />
                </div>
                <h2 className="text-lg font-bold italic">1. 数据收集与 Google Fit 权限</h2>
              </div>
              <p>SomnoAI Lab 是一款数字睡眠实验工具。我们通过 Google Fit API 仅访问以下数据以进行可视化分析：</p>
              <ul className="list-disc list-inside space-y-2 text-slate-400 ml-4 font-medium">
                <li>睡眠分段 (com.google.sleep.segment)</li>
                <li>心率数据 (com.google.heart_rate.bpm)</li>
                <li>能量消耗 (com.google.calories.expended)</li>
              </ul>
              <p>我们承诺不会在您未明确勾选 Google 授权页面的权限框时尝试越权访问。</p>
            </section>

            <section className="space-y-4 relative z-10">
              <div className="flex items-center gap-3 text-white">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                  <Lock size={18} />
                </div>
                <h2 className="text-lg font-bold italic">2. 数据存储与安全</h2>
              </div>
              <p><strong>本地处理优先：</strong>您的所有生理特征流数据均在浏览器端实时处理。我们不设任何后端服务器用于存储、上传或处理您的原始个人健康数据。</p>
              <p><strong>零共享政策：</strong>我们绝不会向任何第三方（包括广告商、研究机构或保险公司）出售、分发或展示您的任何健康指标。</p>
            </section>

            <section className="space-y-4 relative z-10">
              <div className="flex items-center gap-3 text-white">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                  <ShieldCheck size={18} />
                </div>
                <h2 className="text-lg font-bold italic">3. 权限管理</h2>
              </div>
              <p>您可以随时在应用设置中点击“退出”以清除本地 SessionStorage 中的访问令牌。此外，您可以在 Google 账号的“安全性”设置中彻底移除 SomnoAI 的授权。</p>
            </section>

            <footer className="pt-8 border-t border-white/5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-indigo-400" />
                <p className="text-xs font-bold text-slate-400">合规联系：ongyuze1401@gmail.com</p>
              </div>
              <p className="text-[10px] text-slate-500 italic">本政策最近更新于 2024年3月20日</p>
            </footer>
          </>
        ) : (
          <>
            <section className="space-y-4 relative z-10">
              <div className="flex items-center gap-3 text-white">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                  <Info size={18} />
                </div>
                <h2 className="text-lg font-bold italic">1. 服务性质</h2>
              </div>
              <p>SomnoAI Lab 是一个用于个人睡眠数据可视化和 AI 生成式洞察的数字化实验平台。本服务不提供任何医疗诊断或治疗方案。</p>
            </section>

            <section className="space-y-4 relative z-10">
              <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-3xl space-y-3">
                <div className="flex items-center gap-2 text-amber-400">
                  <ShieldCheck size={18} />
                  <h2 className="text-sm font-black uppercase tracking-widest">2. 非医疗免责声明</h2>
                </div>
                <p className="text-xs text-amber-300/80 font-bold leading-relaxed italic">
                  警告：本应用生成的睡眠分数、AI 建议和生理图表仅供娱乐和个人参考之用。在根据本应用的数据做出任何饮食、锻炼或医疗决策前，请务必咨询持有执照的医疗执业人员。
                </p>
              </div>
            </section>

            <section className="space-y-4 relative z-10">
              <div className="flex items-center gap-3 text-white">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                  <Database size={18} />
                </div>
                <h2 className="text-lg font-bold italic">3. Google Fit 同步约定</h2>
              </div>
              <p>用户在使用 Google Fit 同步功能时，必须遵守 Google 的相关服务条款。SomnoAI 仅作为数据接口，不对由于 Google Fit 端数据不准确或缺失导致的分析结果负责。</p>
            </section>

            <footer className="pt-8 border-t border-white/5">
              <p className="text-[10px] text-slate-500 italic">本服务条款最近更新于 2024年3月20日</p>
            </footer>
          </>
        )}
      </div>
    </div>
  );
};
