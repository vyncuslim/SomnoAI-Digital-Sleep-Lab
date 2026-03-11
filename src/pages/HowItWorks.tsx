import React from 'react';
import { MarketingPageTemplate } from '../components/ui/MarketingPageTemplate';
import { Section, AlertBanner, InlineCTA } from '../components/ui/Components';
import { Database, Cpu, BrainCircuit, LineChart } from 'lucide-react';
import { Language } from '../services/i18n';
import { INFO_CONTENT } from '../data/infoContent';

interface HowItWorksProps {
  lang: Language;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ lang }) => {
  const content = (INFO_CONTENT[lang] as any)?.['how-it-works'] || (INFO_CONTENT['en'] as any)['how-it-works'];

  return (
    <MarketingPageTemplate
      title={content.title}
      subtitle={content.subtitle}
      ctaPrimary={{ text: lang === 'zh' ? "查看方法" : "See Method", link: "/science" }}
      ctaSecondary={{ text: lang === 'zh' ? "阅读研究" : "Read Research", link: "/research" }}
    >
      <div className="flex flex-col lg:flex-row gap-12 relative">
        <div className="flex-grow lg:w-3/4">
          <Section>
            <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap text-lg leading-relaxed">
              {content.content}
            </div>
          </Section>

          <Section title={lang === 'zh' ? "分析过程" : "The Analytical Process"}>
            <div className="space-y-12 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-indigo-500/50 before:via-indigo-500/20 before:to-transparent">
              {/* Step 1 */}
              <div className="relative flex items-start gap-8 group">
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-indigo-500/50 flex items-center justify-center text-indigo-400 shrink-0 z-10 shadow-[0_0_20px_rgba(79,70,229,0.2)] group-hover:scale-110 transition-transform">
                  <Database size={20} />
                </div>
                <div className="hardware-panel p-8 flex-grow group-hover:border-indigo-500/30 transition-colors">
                  <div className="hardware-label mb-4">PHASE 01</div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-4">{lang === 'zh' ? "数据输入" : "Data Input"}</h3>
                  <p className="text-slate-400 leading-relaxed">
                    {lang === 'zh'
                      ? "用户可以提供来自兼容可穿戴设备、健康平台或手动记录的活动日志的睡眠相关数据。这些信号通常包括运动模式、休息周期或可用于推断睡眠趋势的行为时间指标。"
                      : "Users may provide sleep-related data from compatible wearable devices, health platforms, or manually recorded activity logs. These signals often include movement patterns, rest cycles, or behavioral timing indicators that can be used to infer sleep trends."}
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative flex items-start gap-8 group">
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-indigo-500/50 flex items-center justify-center text-indigo-400 shrink-0 z-10 shadow-[0_0_20px_rgba(79,70,229,0.2)] group-hover:scale-110 transition-transform">
                  <Cpu size={20} />
                </div>
                <div className="hardware-panel p-8 flex-grow group-hover:border-indigo-500/30 transition-colors">
                  <div className="hardware-label mb-4">PHASE 02</div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-4">{lang === 'zh' ? "信号处理" : "Signal Processing"}</h3>
                  <p className="text-slate-400 leading-relaxed">
                    {lang === 'zh'
                      ? "数据收集完成后，SomnoAI Digital Sleep Lab 系统开始信号处理。在此阶段，平台组织传入的数据并为计算分析做好准备。"
                      : "Once data is collected, the SomnoAI Digital Sleep Lab system begins signal processing. In this stage, the platform organizes incoming data and prepares it for computational analysis."}
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative flex items-start gap-8 group">
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-indigo-500/50 flex items-center justify-center text-indigo-400 shrink-0 z-10 shadow-[0_0_20px_rgba(79,70,229,0.2)] group-hover:scale-110 transition-transform">
                  <BrainCircuit size={20} />
                </div>
                <div className="hardware-panel p-8 flex-grow group-hover:border-indigo-500/30 transition-colors">
                  <div className="hardware-label mb-4">PHASE 03</div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-4">{lang === 'zh' ? "模式检测" : "Pattern Detection"}</h3>
                  <p className="text-slate-400 leading-relaxed">
                    {lang === 'zh'
                      ? "人工智能算法和统计模型评估行为信号中的短期和长期趋势。这些模型在数据中寻找可能表明稳定睡眠节奏或不规则模式的重复结构。"
                      : "Artificial intelligence algorithms and statistical models evaluate both short-term and long-term trends in behavioral signals. These models look for recurring structures within the data that may indicate stable sleep rhythms or irregular patterns."}
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative flex items-start gap-8 group">
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-indigo-500/50 flex items-center justify-center text-indigo-400 shrink-0 z-10 shadow-[0_0_20px_rgba(79,70,229,0.2)] group-hover:scale-110 transition-transform">
                  <LineChart size={20} />
                </div>
                <div className="hardware-panel p-8 flex-grow group-hover:border-indigo-500/30 transition-colors">
                  <div className="hardware-label mb-4">PHASE 04</div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-4">{lang === 'zh' ? "洞察与可视化" : "Insights & Visualization"}</h3>
                  <p className="text-slate-400 leading-relaxed">
                    {lang === 'zh'
                      ? "识别出模式后，平台会生成见解。系统不是呈现原始数据流，而是生成旨在突出相关行为观察结果的结构化摘要。"
                      : "After patterns have been identified, the platform generates insights. Instead of presenting raw data streams, the system produces structured summaries designed to highlight relevant behavioral observations."}
                  </p>
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
          </div>
        </aside>
      </div>
    </MarketingPageTemplate>
  );
};
