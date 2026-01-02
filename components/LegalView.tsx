import React from 'react';
import { ArrowLeft, FileText, ShieldCheck, Mail, Lock, Database, Info, ShieldAlert, Globe, Activity, Heart, Zap } from 'lucide-react';

interface LegalViewProps {
  type: 'privacy' | 'terms';
  onBack: () => void;
}

export const LegalView: React.FC<LegalViewProps> = ({ type, onBack }) => {
  const isPrivacy = type === 'privacy';

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
            {isPrivacy ? '隐私权政策' : '服务条款'}
          </h1>
          <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em] mt-0.5">
            SomnoAI Digital Sleep Lab • 生效日期：2024年3月20日
          </p>
        </div>
      </header>

      <div className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-8 md:p-12 space-y-12 leading-relaxed text-slate-300 text-sm shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-white">
          {isPrivacy ? <ShieldCheck size={160} /> : <FileText size={160} />}
        </div>

        {isPrivacy ? (
          <>
            <section className="space-y-4 relative z-10">
              <div className="flex items-center gap-3 text-white">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                  <Database size={20} />
                </div>
                <h2 className="text-xl font-bold italic">1. 数据生命周期与处理</h2>
              </div>
              <p>SomnoAI 坚持“数据最小化”原则。当您通过 Google Fit 授权后，应用会通过 TLS 加密通道获取最近 7 天的生理指标（睡眠分段、心率、卡路里）。这些数据仅在您当前的浏览器 Session 中通过 JavaScript 进行处理和渲染。</p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <Heart className="text-rose-400 mb-2" size={16} />
                  <p className="text-[10px] font-bold uppercase text-slate-500">生理信号</p>
                  <p className="text-[11px] leading-tight mt-1">仅用于生成可视化图表</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <Zap className="text-indigo-400 mb-2" size={16} />
                  <p className="text-[10px] font-bold uppercase text-slate-500">AI 洞察</p>
                  <p className="text-[11px] leading-tight mt-1">匿名化处理后的指标推演</p>
                </div>
              </div>
            </section>

            <section className="space-y-4 relative z-10">
              <div className="p-8 bg-indigo-500/10 border border-indigo-500/20 rounded-[2rem] space-y-4">
                <div className="flex items-center gap-3 text-indigo-400">
                  <ShieldAlert size={20} />
                  <h3 className="text-xs font-black uppercase tracking-widest">Google API 有限使用合规声明</h3>
                </div>
                <p className="text-xs text-indigo-100/80 leading-relaxed italic">
                  我们对从 Google API 接收到的信息的使用和传输将遵守 Google API 服务用户数据政策，包括有限使用要求。这意味着您的健康数据绝不会被用于广告展示、用户画像售卖或任何非核心睡眠分析之外的目的。
                </p>
              </div>
            </section>

            <section className="space-y-4 relative z-10">
              <div className="flex items-center gap-3 text-white">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                  <Lock size={20} />
                </div>
                <h2 className="text-xl font-bold italic">2. 零存储与数据安全</h2>
              </div>
              <p>本应用不设后端服务器，不具备云端持久化存储能力。所有数据存储于您设备本地的 <code>sessionStorage</code>。一旦您注销或关闭浏览器，所有数据将从本地 RAM 中彻底清除。</p>
            </section>

            <footer className="pt-8 border-t border-white/5 space-y-4">
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-indigo-400" />
                <p className="text-xs font-bold text-slate-400">隐私合规查询：ongyuze1401@gmail.com</p>
              </div>
              <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em]">© 2024 SomnoAI Digital Sleep Lab. All rights reserved.</p>
            </footer>
          </>
        ) : (
          <>
            <section className="space-y-4 relative z-10">
              <div className="flex items-center gap-3 text-white">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                  <Globe size={20} />
                </div>
                <h2 className="text-xl font-bold italic">1. 平台协议声明</h2>
              </div>
              <p>使用本实验室服务即表示您同意受本条款约束。本应用是一个旨在提供睡眠数字化实验服务的纯信息平台，不具备医疗执业资质。</p>
            </section>

            <section className="space-y-4 relative z-10">
              <div className="p-8 bg-amber-500/10 border border-amber-500/20 rounded-[2rem] space-y-4">
                <div className="flex items-center gap-3 text-amber-400">
                  <ShieldCheck size={24} />
                  <h2 className="text-sm font-black uppercase tracking-widest">2. 严格医疗免责声明</h2>
                </div>
                <p className="text-xs text-amber-100 font-bold leading-relaxed italic">
                  本应用提供的所有睡眠分数、AI 指导语和生理图表仅供参考。这些信息不能取代医生的专业意见。严禁将本应用用于任何形式的临床医疗、疾病诊断或紧急健康监护。
                </p>
                <p className="text-[10px] text-amber-200/60 leading-relaxed uppercase font-black">
                  IN CASE OF EMERGENCY, PLEASE CONTACT YOUR LOCAL MEDICAL SERVICE IMMEDIATELY.
                </p>
              </div>
            </section>

            <section className="space-y-4 relative z-10">
              <div className="flex items-center gap-3 text-white">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                  <Activity size={20} />
                </div>
                <h2 className="text-xl font-bold italic">3. 责任限制</h2>
              </div>
              <p>开发者不保证服务的 100% 准确性或持续可用性。因 Google API 变动、AI 模型幻觉或浏览器兼容性导致的分析误差，开发者不承担法律赔偿责任。</p>
            </section>

            <footer className="pt-8 border-t border-white/5 flex justify-between items-center">
              <p className="text-[10px] text-slate-500 italic">版本：v2024.03.R3 | 更新：2024.03.20</p>
              <div className="flex gap-4">
                 <Lock size={14} className="text-slate-700" />
                 <ShieldCheck size={14} className="text-slate-700" />
              </div>
            </footer>
          </>
        )}
      </div>
    </div>
  );
};