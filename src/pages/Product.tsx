import React from 'react';
import { MarketingPageTemplate } from '../components/ui/MarketingPageTemplate';
import { Section, Card, Tabs, InlineCTA } from '../components/ui/Components';
import { Activity, Brain, Clock, Shield, Smartphone, Watch, Cloud, CheckCircle2 } from 'lucide-react';
import { Language, getTranslation } from '../services/i18n';

interface ProductProps {
  lang: Language;
}

export const Product: React.FC<ProductProps> = ({ lang }) => {
  const t = getTranslation(lang, 'landing');
  
  return (
    <MarketingPageTemplate
      title={lang === 'zh' ? "SomnoAI Digital Sleep Lab 平台" : "SomnoAI Digital Sleep Lab Platform"}
      subtitle={lang === 'zh' ? "SomnoAI Digital Sleep Lab 平台旨在分析睡眠相关信息，并生成有关行为睡眠模式的见解。" : "The SomnoAI Digital Sleep Lab platform is designed to analyze sleep-related information and generate insights about behavioral sleep patterns."}
      ctaPrimary={{ text: lang === 'zh' ? "查看功能" : "View Features", link: "/features" }}
      ctaSecondary={{ text: t.nav?.signup || "Join Waitlist", link: "/auth/signup" }}
    >
      <Section>
        <Tabs tabs={[
          {
            id: 'overview',
            label: lang === 'zh' ? '概览' : 'Overview',
            content: (
              <div className="prose prose-invert max-w-none text-slate-300">
                <p className="text-lg leading-relaxed">
                  {lang === 'zh' 
                    ? "传统的健康仪表板通常侧重于基本指标，如总睡眠时间或活动水平。虽然这些测量提供了有用的信息，但它们很少揭示影响睡眠质量的深层行为模式。SomnoAI Digital Sleep Lab 试图通过应用计算分析来检测睡眠数据中的趋势、相关性和不规则性，从而超越简单的测量。"
                    : "Traditional health dashboards often focus on basic metrics such as total sleep duration or activity levels. While these measurements provide useful information, they rarely reveal the deeper behavioral patterns that influence sleep quality. SomnoAI Digital Sleep Lab attempts to move beyond simple measurements by applying computational analysis to detect trends, correlations, and irregularities within sleep data."}
                </p>
                <p className="text-lg leading-relaxed">
                  {lang === 'zh'
                    ? "该平台专注于将原始数据信号转化为结构化观察，帮助用户更好地了解他们的夜间休息周期和长期睡眠一致性。"
                    : "The platform focuses on transforming raw data signals into structured observations that help users better understand their nightly rest cycles and long-term sleep consistency."}
                </p>
              </div>
            )
          },
          {
            id: 'inputs',
            label: lang === 'zh' ? '输入' : 'Inputs',
            content: (
              <div className="prose prose-invert max-w-none text-slate-300">
                <p className="text-lg leading-relaxed">
                  {lang === 'zh'
                    ? "该平台可以分析从兼容设备、数字健康生态系统或用户提供的数据记录中获得的信息。利用统计模型和人工智能技术，SomnoAI Digital Sleep Lab 处理这些信号，以识别传统仪表板可能无法看到的行为模式。"
                    : "The platform may analyze information obtained from compatible devices, digital health ecosystems, or user-provided data records. Using statistical models and artificial intelligence techniques, SomnoAI Digital Sleep Lab processes these signals to identify behavioral patterns that may not be visible through traditional dashboards."}
                </p>
              </div>
            )
          },
          {
            id: 'outputs',
            label: lang === 'zh' ? '输出' : 'Outputs',
            content: (
              <div className="prose prose-invert max-w-none text-slate-300">
                <p className="text-lg leading-relaxed">
                  {lang === 'zh'
                    ? "SomnoAI Digital Sleep Lab 平台的一个核心设计原则是可解释性。数据见解应该是易于理解的，而不是压倒性的。系统试图生成关于睡眠一致性、休息周期和行为节奏的清晰观察，而不是呈现大量的原始数字。"
                    : "A key design principle of the SomnoAI Digital Sleep Lab platform is interpretability. Data insights should be understandable rather than overwhelming. Instead of presenting large volumes of raw numbers, the system attempts to generate clear observations about sleep consistency, rest cycles, and behavioral rhythms."}
                </p>
              </div>
            )
          },
          {
            id: 'privacy',
            label: lang === 'zh' ? '隐私' : 'Privacy',
            content: (
              <div className="prose prose-invert max-w-none text-slate-300">
                <p className="text-lg leading-relaxed">
                  {lang === 'zh'
                    ? "该平台在设计时也考虑到了隐私意识。数据分析的执行方式优先考虑对个人信息的负责任处理。安全实践和数据保护原则已融入系统架构中。"
                    : "The platform is also designed with privacy awareness in mind. Data analysis is performed in ways that prioritize responsible handling of personal information. Security practices and data protection principles are incorporated into the architecture of the system."}
                </p>
              </div>
            )
          }
        ]} />
      </Section>

      <Section title={lang === 'zh' ? "核心能力" : "Core Capabilities"}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card 
            title={lang === 'zh' ? "模式检测" : "Pattern Detection"} 
            description={lang === 'zh' ? "应用计算分析来检测睡眠数据中的趋势、相关性和不规则性。" : "Applying computational analysis to detect trends, correlations, and irregularities within sleep data."} 
            icon={<Brain />} 
          />
          <Card 
            title={lang === 'zh' ? "长期一致性" : "Long-term Consistency"} 
            description={lang === 'zh' ? "识别可能影响个人长期睡眠和恢复的周期性趋势。" : "Identifying recurring trends that may influence how individuals sleep and recover over extended periods."} 
            icon={<Clock />} 
          />
          <Card 
            title={lang === 'zh' ? "可解释性" : "Interpretability"} 
            description={lang === 'zh' ? "生成清晰的观察结果，而不是呈现大量原始、压倒性的数字。" : "Generating clear observations rather than presenting large volumes of raw, overwhelming numbers."} 
            icon={<CheckCircle2 />} 
          />
          <Card 
            title={lang === 'zh' ? "行为节奏" : "Behavioral Rhythms"} 
            description={lang === 'zh' ? "了解常规、环境条件和生活方式选择如何影响人类睡眠。" : "Understanding how routines, environmental conditions, and lifestyle choices influence human sleep."} 
            icon={<Activity />} 
          />
          <Card 
            title={lang === 'zh' ? "隐私感知架构" : "Privacy-Aware Architecture"} 
            description={lang === 'zh' ? "安全实践和数据保护原则直接融入系统。" : "Security practices and data protection principles are incorporated directly into the system."} 
            icon={<Shield />} 
          />
        </div>
      </Section>

      <Section title={lang === 'zh' ? "见解示例" : "Example Insights"}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
            <h4 className="text-indigo-400 font-semibold mb-2">{lang === 'zh' ? "一致性" : "Consistency"}</h4>
            <p className="text-slate-300 text-sm">
              {lang === 'zh' 
                ? "“在过去一周内，您的入睡时间变化超过 90 分钟，这可能会影响您的深度睡眠时长。”"
                : "\"Your sleep onset time has varied by more than 90 minutes over the past week, which may be affecting your deep sleep duration.\""}
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <h4 className="text-emerald-400 font-semibold mb-2">{lang === 'zh' ? "节奏" : "Rhythm"}</h4>
            <p className="text-slate-300 text-sm">
              {lang === 'zh'
                ? "“您的周末睡眠时间表与工作日常规明显不一致，表明存在潜在的社交时差。”"
                : "\"Your weekend sleep schedule is significantly misaligned with your weekday routine, indicating potential social jetlag.\""}
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <h4 className="text-amber-400 font-semibold mb-2">{lang === 'zh' ? "恢复" : "Recovery"}</h4>
            <p className="text-slate-300 text-sm">
              {lang === 'zh'
                ? "“尽管总睡眠时间达到 8 小时，但您的静息心率仍然偏高，表明生理恢复不完全。”"
                : "\"Despite 8 hours of total sleep, your resting heart rate remained elevated, suggesting incomplete physiological recovery.\""}
            </p>
          </div>
        </div>
      </Section>

      <Section title={lang === 'zh' ? "支持的集成" : "Supported Integrations"}>
        <div className="flex flex-wrap gap-4 items-center justify-center py-8">
          <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 border border-white/10 text-slate-400"><Watch size={20} /> {lang === 'zh' ? "可穿戴设备" : "Wearables"}</div>
          <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 border border-white/10 text-slate-400"><Smartphone size={20} /> {lang === 'zh' ? "健康应用" : "Health Apps"}</div>
          <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 border border-white/10 text-slate-400"><Cloud size={20} /> {lang === 'zh' ? "云生态系统" : "Cloud Ecosystems"}</div>
        </div>
      </Section>

      <Section title={lang === 'zh' ? "常见问题" : "Frequently Asked Questions"}>
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5">
            <h4 className="font-semibold text-white mb-2">{lang === 'zh' ? "这是一个医疗诊断工具吗？" : "Is this a medical diagnostic tool?"}</h4>
            <p className="text-slate-400 text-sm">
              {lang === 'zh'
                ? "SomnoAI Digital Sleep Lab 并非旨在取代专业的医疗评估或临床睡眠实验室。相反，该平台专注于教育见解。"
                : "SomnoAI Digital Sleep Lab is not intended to replace professional medical evaluation or clinical sleep laboratories. Instead, the platform focuses on educational insights."}
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5">
            <h4 className="font-semibold text-white mb-2">{lang === 'zh' ? "需要什么样的数据？" : "What kind of data is required?"}</h4>
            <p className="text-slate-400 text-sm">
              {lang === 'zh'
                ? "该平台分析从兼容设备、数字健康生态系统或用户提供的数据记录中获得的信息。"
                : "The platform analyzes information obtained from compatible devices, digital health ecosystems, or user-provided data records."}
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5">
            <h4 className="font-semibold text-white mb-2">{lang === 'zh' ? "我的隐私如何受到保护？" : "How is my privacy protected?"}</h4>
            <p className="text-slate-400 text-sm">
              {lang === 'zh'
                ? "数据分析的执行方式优先考虑对个人信息的负责任处理，并将安全实践融入架构中。"
                : "Data analysis is performed in ways that prioritize responsible handling of personal information, with security practices incorporated into the architecture."}
            </p>
          </div>
        </div>
      </Section>

      <div className="text-center pt-12 border-t border-white/5">
        <div className="flex items-center justify-center gap-6">
          <InlineCTA text={lang === 'zh' ? "获取支持" : "Get Support"} link="/support" />
          <span className="text-white/20">|</span>
          <InlineCTA text={lang === 'zh' ? "系统状态" : "System Status"} link="/status" />
        </div>
      </div>
    </MarketingPageTemplate>
  );
};
