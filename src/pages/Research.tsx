import React from 'react';
import { MarketingPageTemplate } from '../components/ui/MarketingPageTemplate';
import { Section, Card, Accordion, InlineCTA } from '../components/ui/Components';
import { Activity, Brain, Clock, Moon, Sun, Zap } from 'lucide-react';
import { Language, getTranslation } from '../services/i18n';

interface ResearchProps {
  lang: Language;
}

export const Research: React.FC<ResearchProps> = ({ lang }) => {
  return (
    <MarketingPageTemplate
      title={lang === 'zh' ? "研究与方法论" : "Research & Methodology"}
      subtitle={lang === 'zh' ? "探索人工智能、数据科学和人类睡眠行为的交集，以揭示有意义的模式。" : "Exploring the intersection of artificial intelligence, data science, and human sleep behavior to uncover meaningful patterns."}
      ctaPrimary={{ text: lang === 'zh' ? "阅读科学" : "Read Science", link: "/science" }}
      ctaSecondary={{ text: lang === 'zh' ? "阅读博客" : "Read Blog", link: "/blog" }}
    >
      <Section title={lang === 'zh' ? "研究领域" : "Research Areas"}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card 
            title={lang === 'zh' ? "昼夜节律" : "Circadian Rhythm"} 
            description={lang === 'zh' ? "调查日常常规和环境因素如何影响身体自然的 24 小时周期。" : "Investigating how daily routines and environmental factors influence the body's natural 24-hour cycle."}
            icon={<Sun />}
          />
          <Card 
            title={lang === 'zh' ? "睡眠一致性" : "Sleep Consistency"} 
            description={lang === 'zh' ? "分析不规则睡眠时间表对认知表现和长期健康指标的影响。" : "Analyzing the impact of irregular sleep schedules on cognitive performance and long-term health markers."}
            icon={<Clock />}
          />
          <Card 
            title={lang === 'zh' ? "生理恢复" : "Physiological Recovery"} 
            description={lang === 'zh' ? "研究深度睡眠阶段、静息心率与身体修复之间的关系。" : "Studying the relationship between deep sleep phases, resting heart rate, and physical restoration."}
            icon={<Activity />}
          />
          <Card 
            title={lang === 'zh' ? "睡眠结构" : "Sleep Architecture"} 
            description={lang === 'zh' ? "检查整夜睡眠阶段的结构和进展。" : "Examining the structure and progression of sleep stages throughout the night."}
            icon={<Brain />}
          />
          <Card 
            title={lang === 'zh' ? "环境因素" : "Environmental Factors"} 
            description={lang === 'zh' ? "了解光照、温度和噪音如何影响入睡和睡眠维持。" : "Understanding how light exposure, temperature, and noise affect sleep onset and maintenance."}
            icon={<Moon />}
          />
          <Card 
            title={lang === 'zh' ? "能量与疲劳" : "Energy & Fatigue"} 
            description={lang === 'zh' ? "将主观能量水平与客观睡眠指标相关联，以预测白天的疲劳感。" : "Correlating subjective energy levels with objective sleep metrics to predict daytime fatigue."}
            icon={<Zap />}
          />
        </div>
      </Section>

      <Section title={lang === 'zh' ? "方法论" : "Methodology"}>
        <div className="max-w-3xl mx-auto">
          <Accordion items={[
            {
              title: lang === 'zh' ? "数据类型与来源" : "Data Types & Sources",
              content: lang === 'zh' 
                ? "我们的模型旨在处理多样化的数据流，包括体动记录（运动）、光电容积脉搏波（心率）和用户报告的日志。我们专注于纵向数据，以捕获长期的行为趋势，而不是孤立的每日快照。"
                : "Our models are designed to process diverse data streams, including actigraphy (movement), photoplethysmography (heart rate), and user-reported logs. We focus on longitudinal data to capture long-term behavioral trends rather than isolated nightly snapshots."
            },
            {
              title: lang === 'zh' ? "计算模型" : "Computational Models",
              content: lang === 'zh'
                ? "我们结合使用统计分析和机器学习技术，包括时间序列预测、异常检测和聚类算法。这些模型针对可解释性进行了优化，确保生成的见解易于理解且具有可操作性。"
                : "We employ a combination of statistical analysis and machine learning techniques, including time-series forecasting, anomaly detection, and clustering algorithms. These models are optimized for interpretability, ensuring that the resulting insights are understandable and actionable."
            },
            {
              title: lang === 'zh' ? "验证与完整性" : "Validation & Integrity",
              content: lang === 'zh'
                ? "虽然我们不是临床诊断工具，但我们优先考虑科学完整性。通过将模型输出与既定的睡眠科学原理和大规模匿名数据集进行比较，我们不断完善我们的分析框架。"
                : "While we are not a clinical diagnostic tool, we prioritize scientific integrity. Our analytical frameworks are continuously refined by comparing model outputs against established sleep science principles and large-scale anonymized datasets."
            }
          ]} />
        </div>
      </Section>

      <Section title={lang === 'zh' ? "开放性问题" : "Open Questions"}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-white/5">
            <h3 className="text-xl font-bold text-white mb-4">{lang === 'zh' ? "社交时差的影响" : "The Impact of Social Jetlag"}</h3>
            <p className="text-slate-400 leading-relaxed">
              {lang === 'zh'
                ? "生物时间与社交时间之间的差异（例如，周末的时间表变动）在数年或数十年内如何影响代谢健康和认知功能？"
                : "How does the discrepancy between biological time and social time (e.g., shifting schedules on weekends) affect metabolic health and cognitive function over years or decades?"}
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-white/5">
            <h3 className="text-xl font-bold text-white mb-4">{lang === 'zh' ? "个性化睡眠需求" : "Personalized Sleep Needs"}</h3>
            <p className="text-slate-400 leading-relaxed">
              {lang === 'zh'
                ? "除了标准的“每晚 8 小时”建议外，计算模型如何准确确定个人独特的、最佳的睡眠时长和时间？"
                : "Beyond the standard \"8 hours a night\" recommendation, how can computational models accurately determine an individual's unique, optimal sleep duration and timing?"}
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-white/5">
            <h3 className="text-xl font-bold text-white mb-4">{lang === 'zh' ? "可穿戴设备的准确性 vs. 实用性" : "Wearable Accuracy vs. Utility"}</h3>
            <p className="text-slate-400 leading-relaxed">
              {lang === 'zh'
                ? "在承认消费级可穿戴设备与临床多导睡眠图相比存在局限性的同时，我们如何从中提取最可靠的行为见解？"
                : "How can we extract the most reliable behavioral insights from consumer-grade wearables, acknowledging their limitations compared to clinical polysomnography?"}
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-white/5">
            <h3 className="text-xl font-bold text-white mb-4">{lang === 'zh' ? "AI 在行为改变中的作用" : "AI in Behavioral Change"}</h3>
            <p className="text-slate-400 leading-relaxed">
              {lang === 'zh'
                ? "可解释的 AI 在激励可持续的行为改变方面可以发挥什么作用，从而改善睡眠卫生和整体福祉？"
                : "What role can interpretable AI play in motivating sustainable behavioral changes that lead to improved sleep hygiene and overall well-being?"}
            </p>
          </div>
        </div>
      </Section>

      <div className="text-center pt-12 border-t border-white/5">
        <div className="flex items-center justify-center gap-6">
          <InlineCTA text={lang === 'zh' ? "开源项目" : "Open Source"} link="/opensource" />
          <span className="text-white/20">|</span>
          <InlineCTA text={lang === 'zh' ? "政策框架" : "Policy Framework"} link="/policy" />
        </div>
      </div>
    </MarketingPageTemplate>
  );
};
