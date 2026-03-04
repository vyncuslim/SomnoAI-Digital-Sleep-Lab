import React from 'react';
import { MarketingPageTemplate } from '../components/ui/MarketingPageTemplate';
import { Section, AlertBanner, InlineCTA } from '../components/ui/Components';
import { Database, Cpu, BrainCircuit, LineChart } from 'lucide-react';
import { Language, getTranslation } from '../services/i18n';

interface HowItWorksProps {
  lang: Language;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ lang }) => {
  return (
    <MarketingPageTemplate
      title={lang === 'zh' ? "SomnoAI Digital Sleep Lab 平台的工作原理" : "How the SomnoAI Digital Sleep Lab Platform Works"}
      subtitle={lang === 'zh' ? "SomnoAI Digital Sleep Lab 平台通过结构化的分析过程分析睡眠相关信息，旨在将原始行为信号转化为可解释的见解。" : "The SomnoAI Digital Sleep Lab platform analyzes sleep-related information through a structured analytical process designed to transform raw behavioral signals into interpretable insights."}
      ctaPrimary={{ text: lang === 'zh' ? "查看方法" : "See Method", link: "/science" }}
      ctaSecondary={{ text: lang === 'zh' ? "阅读研究" : "Read Research", link: "/research" }}
    >
      <div className="flex flex-col lg:flex-row gap-12 relative">
        <div className="flex-grow lg:w-3/4">
          <Section title={lang === 'zh' ? "分析过程" : "The Analytical Process"}>
            <p className="text-lg text-slate-400 leading-relaxed mb-12">
              {lang === 'zh'
                ? "这一过程涉及多个阶段，共同从数据中提取有意义的模式。通过这种多阶段分析工作流程，SomnoAI Digital Sleep Lab 寻求通过将复杂数据转化为可解释的观察结果，提供对睡眠行为的更深入理解。"
                : "This process involves several stages that work together to extract meaningful patterns from data. Through this multi-stage analytical workflow, SomnoAI Digital Sleep Lab seeks to provide a deeper understanding of sleep behavior by transforming complex data into interpretable observations."}
            </p>

            <div className="space-y-12 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-indigo-500/50 before:via-indigo-500/20 before:to-transparent">
              {/* Step 1 */}
              <div className="relative flex items-start gap-6">
                <div className="w-12 h-12 rounded-full bg-slate-900 border-2 border-indigo-500 flex items-center justify-center text-indigo-400 shrink-0 z-10 shadow-[0_0_0_8px_#01040a]">
                  <Database size={20} />
                </div>
                <div className="bg-slate-900/50 border border-white/5 p-8 rounded-2xl flex-grow">
                  <h3 className="text-2xl font-bold text-white mb-4">{lang === 'zh' ? "1. 数据输入" : "1. Data Input"}</h3>
                  <p className="text-slate-400 leading-relaxed mb-6">
                    {lang === 'zh'
                      ? "用户可以提供来自兼容可穿戴设备、健康平台或手动记录的活动日志的睡眠相关数据。这些信号通常包括运动模式、休息周期或可用于推断睡眠趋势的行为时间指标。"
                      : "Users may provide sleep-related data from compatible wearable devices, health platforms, or manually recorded activity logs. These signals often include movement patterns, rest cycles, or behavioral timing indicators that can be used to infer sleep trends."}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <h4 className="text-emerald-400 font-semibold text-sm mb-1">{lang === 'zh' ? "它的作用" : "What it does"}</h4>
                      <p className="text-slate-300 text-xs">{lang === 'zh' ? "收集运动、休息周期和时间指标。" : "Collects movement, rest cycles, and timing indicators."}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                      <h4 className="text-rose-400 font-semibold text-sm mb-1">{lang === 'zh' ? "它不做的" : "What it doesn't"}</h4>
                      <p className="text-slate-300 text-xs">{lang === 'zh' ? "不收集临床级 EEG 或多导睡眠图数据。" : "Does not collect clinical-grade EEG or polysomnography data."}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative flex items-start gap-6">
                <div className="w-12 h-12 rounded-full bg-slate-900 border-2 border-indigo-500 flex items-center justify-center text-indigo-400 shrink-0 z-10 shadow-[0_0_0_8px_#01040a]">
                  <Cpu size={20} />
                </div>
                <div className="bg-slate-900/50 border border-white/5 p-8 rounded-2xl flex-grow">
                  <h3 className="text-2xl font-bold text-white mb-4">{lang === 'zh' ? "2. 信号处理" : "2. Signal Processing"}</h3>
                  <p className="text-slate-400 leading-relaxed mb-6">
                    {lang === 'zh'
                      ? "数据收集完成后，SomnoAI Digital Sleep Lab 系统开始信号处理。在此阶段，平台组织传入的数据并为计算分析做好准备。原始信号可能包含噪声、不规则性或不一致性。预处理技术有助于确保数据能够可靠地解释。"
                      : "Once data is collected, the SomnoAI Digital Sleep Lab system begins signal processing. In this stage, the platform organizes incoming data and prepares it for computational analysis. Raw signals may contain noise, irregularities, or inconsistencies. Pre-processing techniques help ensure that the data can be interpreted reliably."}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <h4 className="text-emerald-400 font-semibold text-sm mb-1">{lang === 'zh' ? "它的作用" : "What it does"}</h4>
                      <p className="text-slate-300 text-xs">{lang === 'zh' ? "过滤噪声，规范格式，并对齐时间戳。" : "Filters noise, normalizes formats, and aligns timestamps."}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                      <h4 className="text-rose-400 font-semibold text-sm mb-1">{lang === 'zh' ? "它不做的" : "What it doesn't"}</h4>
                      <p className="text-slate-300 text-xs">{lang === 'zh' ? "不改变基本的生理测量值。" : "Does not alter the fundamental physiological measurements."}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative flex items-start gap-6">
                <div className="w-12 h-12 rounded-full bg-slate-900 border-2 border-indigo-500 flex items-center justify-center text-indigo-400 shrink-0 z-10 shadow-[0_0_0_8px_#01040a]">
                  <BrainCircuit size={20} />
                </div>
                <div className="bg-slate-900/50 border border-white/5 p-8 rounded-2xl flex-grow">
                  <h3 className="text-2xl font-bold text-white mb-4">{lang === 'zh' ? "3. 模式检测" : "3. Pattern Detection"}</h3>
                  <p className="text-slate-400 leading-relaxed mb-6">
                    {lang === 'zh'
                      ? "人工智能算法和统计模型评估行为信号中的短期和长期趋势。这些模型在数据中寻找可能表明稳定睡眠节奏或不规则模式的重复结构。"
                      : "Artificial intelligence algorithms and statistical models evaluate both short-term and long-term trends in behavioral signals. These models look for recurring structures within the data that may indicate stable sleep rhythms or irregular patterns."}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <h4 className="text-emerald-400 font-semibold text-sm mb-1">{lang === 'zh' ? "它的作用" : "What it does"}</h4>
                      <p className="text-slate-300 text-xs">{lang === 'zh' ? "识别重复结构和长期行为趋势。" : "Identifies recurring structures and long-term behavioral trends."}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                      <h4 className="text-rose-400 font-semibold text-sm mb-1">{lang === 'zh' ? "它不做的" : "What it doesn't"}</h4>
                      <p className="text-slate-300 text-xs">{lang === 'zh' ? "不诊断呼吸暂停或失眠等睡眠障碍。" : "Does not diagnose sleep disorders like apnea or insomnia."}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative flex items-start gap-6">
                <div className="w-12 h-12 rounded-full bg-slate-900 border-2 border-indigo-500 flex items-center justify-center text-indigo-400 shrink-0 z-10 shadow-[0_0_0_8px_#01040a]">
                  <LineChart size={20} />
                </div>
                <div className="bg-slate-900/50 border border-white/5 p-8 rounded-2xl flex-grow">
                  <h3 className="text-2xl font-bold text-white mb-4">{lang === 'zh' ? "4. 洞察与可视化" : "4. Insights & Visualization"}</h3>
                  <p className="text-slate-400 leading-relaxed mb-6">
                    {lang === 'zh'
                      ? "识别出模式后，平台会生成见解。系统不是呈现原始数据流，而是生成旨在突出相关行为观察结果的结构化摘要。可视化工具通常用于以清晰的格式呈现见解。图表、摘要和趋势指标帮助用户了解他们的睡眠行为随时间演变的情况。"
                      : "After patterns have been identified, the platform generates insights. Instead of presenting raw data streams, the system produces structured summaries designed to highlight relevant behavioral observations. Visualization tools are often used to present insights in a clear format. Charts, summaries, and trend indicators help users understand how their sleep behavior evolves over time."}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <h4 className="text-emerald-400 font-semibold text-sm mb-1">{lang === 'zh' ? "它的作用" : "What it does"}</h4>
                      <p className="text-slate-300 text-xs">{lang === 'zh' ? "生成结构化摘要和视觉趋势指标。" : "Produces structured summaries and visual trend indicators."}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                      <h4 className="text-rose-400 font-semibold text-sm mb-1">{lang === 'zh' ? "它不做的" : "What it doesn't"}</h4>
                      <p className="text-slate-300 text-xs">{lang === 'zh' ? "不规定医疗方案或生活方式干预。" : "Does not prescribe medical treatments or lifestyle interventions."}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          <Section>
            <AlertBanner title={lang === 'zh' ? "模型局限性" : "Model Limitations"} type="warning">
              {lang === 'zh'
                ? "SomnoAI Digital Sleep Lab 使用的分析过程侧重于观察性见解，而非临床结论。虽然计算模型可以揭示行为数据中令人感兴趣的模式，但它们不能取代专业的医疗评估。"
                : "The analytical process used by SomnoAI Digital Sleep Lab focuses on observational insights rather than clinical conclusions. While computational models can reveal interesting patterns within behavioral data, they cannot replace professional medical evaluation."}
            </AlertBanner>
          </Section>
        </div>

        <aside className="w-full lg:w-1/4 flex-shrink-0">
          <div className="sticky top-24 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 shadow-2xl">
              <h4 className="text-lg font-bold text-white mb-4">{lang === 'zh' ? "数据责任" : "Data Responsibility"}</h4>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                {lang === 'zh' ? "我们极其谨慎地处理您的数据，确保整个分析过程中的隐私和安全。" : "We handle your data with the utmost care, ensuring privacy and security throughout the analytical process."}
              </p>
              <div className="space-y-3">
                <InlineCTA text={lang === 'zh' ? "隐私政策" : "Privacy Policy"} link="/privacy" />
                <br />
                <InlineCTA text={lang === 'zh' ? "数据处理" : "Data Processing"} link="/data-processing" />
              </div>
            </div>
            
            <div className="pt-6 border-t border-white/5">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">{lang === 'zh' ? "延伸阅读" : "Further Reading"}</h4>
              <div className="space-y-3">
                <InlineCTA text={lang === 'zh' ? "研究重点" : "Research Focus"} link="/research" />
                <br />
                <InlineCTA text={lang === 'zh' ? "常见问题" : "FAQ"} link="/faq" />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </MarketingPageTemplate>
  );
};
