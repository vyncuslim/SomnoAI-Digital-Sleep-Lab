import React from 'react';
import { MarketingPageTemplate } from '../components/ui/MarketingPageTemplate';
import { Section, Card, InlineCTA } from '../components/ui/Components';
import { Sun, Moon, Activity, CheckCircle2, AlertCircle } from 'lucide-react';
import { Language, getTranslation } from '../services/i18n';

interface ScienceProps {
  lang: Language;
}

export const Science: React.FC<ScienceProps> = ({ lang }) => {
  return (
    <MarketingPageTemplate
      title={lang === 'zh' ? "睡眠科学" : "The Science of Sleep"}
      subtitle={lang === 'zh' ? "对支配休息、恢复和人类表现的生物过程的基础理解。" : "A foundational understanding of the biological processes that govern rest, recovery, and human performance."}
      ctaPrimary={{ text: lang === 'zh' ? "阅读研究" : "Read Research", link: "/research" }}
    >
      <Section title={lang === 'zh' ? "核心概念" : "Key Concepts"}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card 
            title={lang === 'zh' ? "昼夜节律" : "Circadian Rhythm"} 
            description={lang === 'zh' ? "调节睡眠-觉醒周期的内部 24 小时时钟，主要受光照和温度影响。它决定了您何时感到警觉，何时感到困倦。" : "The internal 24-hour clock that regulates the sleep-wake cycle, primarily influenced by light and temperature. It dictates when you feel alert and when you feel sleepy."}
            icon={<Sun />}
          />
          <Card 
            title={lang === 'zh' ? "睡眠结构" : "Sleep Architecture"} 
            description={lang === 'zh' ? "整夜在不同睡眠阶段（浅睡、深睡和 REM）之间的周期性进展。每个阶段都有其独特的恢复功能。" : "The cyclical progression through different stages of sleep (Light, Deep, and REM) throughout the night. Each stage serves a distinct restorative function."}
            icon={<Moon />}
          />
          <Card 
            title={lang === 'zh' ? "生理恢复" : "Physiological Recovery"} 
            description={lang === 'zh' ? "身体在睡眠期间修复组织、巩固记忆和调节新陈代谢的过程，通常反映在静息心率等指标中。" : "The process by which the body repairs tissue, consolidates memories, and regulates metabolism during sleep, often reflected in metrics like resting heart rate."}
            icon={<Activity />}
          />
        </div>
      </Section>

      <Section title={lang === 'zh' ? "消费级数据能告诉我们什么，不能告诉我们什么" : "What Consumer Data Can and Cannot Tell Us"}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <h3 className="text-xl font-bold text-emerald-400 mb-6 flex items-center gap-2"><CheckCircle2 /> {lang === 'zh' ? "它能告诉我们什么" : "What It Can Tell"}</h3>
            <ul className="space-y-4 text-emerald-200/80">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                <span><strong>{lang === 'zh' ? "行为一致性：" : "Behavioral Consistency:"}</strong> {lang === 'zh' ? "您的睡眠时间表在数周或数月内的规律程度。" : "How regular your sleep schedule is over weeks or months."}</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                <span><strong>{lang === 'zh' ? "总时长趋势：" : "Total Duration Trends:"}</strong> {lang === 'zh' ? "您是否始终如一地达到睡眠目标。" : "Whether you are consistently meeting your sleep goals."}</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                <span><strong>{lang === 'zh' ? "静息心率：" : "Resting Heart Rate:"}</strong> {lang === 'zh' ? "心血管恢复和压力的总体指标。" : "General indicators of cardiovascular recovery and stress."}</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                <span><strong>{lang === 'zh' ? "运动模式：" : "Movement Patterns:"}</strong> {lang === 'zh' ? "夜间躁动或清醒的时间段。" : "Periods of restlessness or wakefulness during the night."}</span>
              </li>
            </ul>
          </div>
          <div className="p-8 rounded-2xl bg-rose-500/10 border border-rose-500/20">
            <h3 className="text-xl font-bold text-rose-400 mb-6 flex items-center gap-2"><AlertCircle /> {lang === 'zh' ? "它不能告诉我们什么" : "What It Cannot Tell"}</h3>
            <ul className="space-y-4 text-rose-200/80">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                <span><strong>{lang === 'zh' ? "临床诊断：" : "Clinical Diagnoses:"}</strong> {lang === 'zh' ? "不能诊断睡眠呼吸暂停、失眠或嗜睡症。" : "Cannot diagnose sleep apnea, insomnia, or narcolepsy."}</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                <span><strong>{lang === 'zh' ? "确切的睡眠阶段：" : "Exact Sleep Stages:"}</strong> {lang === 'zh' ? "可穿戴设备根据运动和心率估算阶段，但不能测量脑电波 (EEG)。" : "Wearables estimate stages based on movement and heart rate, but cannot measure brain waves (EEG)."}</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                <span><strong>{lang === 'zh' ? "根本原因：" : "Underlying Causes:"}</strong> {lang === 'zh' ? "可以显示睡眠质量差，但不能明确解释“为什么”（例如，焦虑、饮食、环境）。" : "Can show poor sleep, but cannot definitively explain *why* (e.g., anxiety, diet, environment)."}</span>
              </li>
            </ul>
          </div>
        </div>
      </Section>

      <Section title={lang === 'zh' ? "概念参考" : "Conceptual References"}>
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5">
            <h4 className="font-semibold text-white mb-2">{lang === 'zh' ? "睡眠调节的双过程模型" : "The Two-Process Model of Sleep Regulation"}</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              {lang === 'zh'
                ? "由 Alexander Borbély 于 1982 年提出，该模型认为睡眠受两个相互作用的过程调节：过程 S（睡眠债，在清醒期间积累）和过程 C（昼夜节律，决定困倦和警觉的时间）。"
                : "Proposed by Alexander Borbély in 1982, this model posits that sleep is regulated by two interacting processes: Process S (sleep debt, which builds up during wakefulness) and Process C (the circadian rhythm, which dictates the timing of sleepiness and alertness)."}
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5">
            <h4 className="font-semibold text-white mb-2">{lang === 'zh' ? "社交时差" : "Social Jetlag"}</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              {lang === 'zh'
                ? "由 Till Roenneberg 引入的概念，描述了个体的生物钟与其社交时间表之间的差异，通常导致慢性睡眠剥夺和失调，特别是在工作日与休息日之间。"
                : "A concept introduced by Till Roenneberg, describing the discrepancy between an individual's biological clock and their social schedule, often resulting in chronic sleep deprivation and misalignment, particularly on workdays versus free days."}
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5">
            <h4 className="font-semibold text-white mb-2">{lang === 'zh' ? "深度睡眠（慢波睡眠）的作用" : "The Role of Deep Sleep (Slow-Wave Sleep)"}</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              {lang === 'zh'
                ? "深度睡眠在睡眠科学中被广泛认为是恢复性最强的睡眠阶段，对于身体恢复、免疫系统功能以及通过类淋巴系统清除大脑中的代谢废物至关重要。"
                : "Deep sleep is widely recognized in sleep science as the most restorative sleep stage, crucial for physical recovery, immune system function, and the clearance of metabolic waste from the brain via the glymphatic system."}
            </p>
          </div>
        </div>
      </Section>

      <div className="text-center pt-12 border-t border-white/5">
        <div className="flex items-center justify-center gap-6">
          <InlineCTA text={lang === 'zh' ? "医疗免责声明" : "Medical Disclaimer"} link="/medical-disclaimer" />
          <span className="text-white/20">|</span>
          <InlineCTA text={lang === 'zh' ? "AI 免责声明" : "AI Disclaimer"} link="/ai-disclaimer" />
        </div>
      </div>
    </MarketingPageTemplate>
  );
};
