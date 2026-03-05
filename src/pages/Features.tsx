import React, { useState } from 'react';
import { MarketingPageTemplate } from '../components/ui/MarketingPageTemplate';
import { Section, Card, InlineCTA } from '../components/ui/Components';
import { Activity, Brain, Clock, Shield, BarChart3, Lock, Zap, Eye } from 'lucide-react';
import { Language, getTranslation } from '../services/i18n';

interface FeaturesProps {
  lang: Language;
}

export const Features: React.FC<FeaturesProps> = ({ lang }) => {
  const [activeFilter, setActiveFilter] = useState('All');
  
  const filters = lang === 'zh' 
    ? ['全部', '洞察', '可视化', '隐私', '可靠性']
    : ['All', 'Insights', 'Visualization', 'Privacy', 'Reliability'];
  
  const categoryMap: Record<string, string> = {
    'Insights': lang === 'zh' ? '洞察' : 'Insights',
    'Visualization': lang === 'zh' ? '可视化' : 'Visualization',
    'Privacy': lang === 'zh' ? '隐私' : 'Privacy',
    'Reliability': lang === 'zh' ? '可靠性' : 'Reliability',
    '全部': 'All',
    '洞察': 'Insights',
    '可视化': 'Visualization',
    '隐私': 'Privacy',
    '可靠性': 'Reliability'
  };

  const features = [
    {
      title: lang === 'zh' ? '深度睡眠分析' : 'Deep Sleep Analysis',
      description: lang === 'zh' ? '了解深度睡眠阶段的质量和时长。' : 'Understand the quality and duration of your deep sleep phases.',
      category: 'Insights',
      icon: <Brain />
    },
    {
      title: lang === 'zh' ? '节奏追踪' : 'Rhythm Tracking',
      description: lang === 'zh' ? '监测您的昼夜节律并识别社交时差。' : 'Monitor your circadian rhythm and identify social jetlag.',
      category: 'Insights',
      icon: <Clock />
    },
    {
      title: lang === 'zh' ? '交互式仪表板' : 'Interactive Dashboards',
      description: lang === 'zh' ? '通过直观的交互式可视化探索您的数据。' : 'Explore your data through intuitive, interactive visualizations.',
      category: 'Visualization',
      icon: <BarChart3 />
    },
    {
      title: lang === 'zh' ? '趋势报告' : 'Trend Reports',
      description: lang === 'zh' ? '接收每周和每月的睡眠模式摘要。' : 'Receive weekly and monthly summaries of your sleep patterns.',
      category: 'Visualization',
      icon: <Activity />
    },
    {
      title: lang === 'zh' ? '端到端加密' : 'End-to-End Encryption',
      description: lang === 'zh' ? '您的睡眠数据在传输和存储时均经过加密。' : 'Your sleep data is encrypted both in transit and at rest.',
      category: 'Privacy',
      icon: <Lock />
    },
    {
      title: lang === 'zh' ? '数据匿名化' : 'Data Anonymization',
      description: lang === 'zh' ? '我们在分析前会剥离个人身份信息。' : 'We strip personally identifiable information before analysis.',
      category: 'Privacy',
      icon: <Eye />
    },
    {
      title: lang === 'zh' ? '高可用性' : 'High Availability',
      description: lang === 'zh' ? '我们的基础设施设计旨在实现 99.9% 的正常运行时间。' : 'Our infrastructure is designed for 99.9% uptime.',
      category: 'Reliability',
      icon: <Zap />
    },
    {
      title: lang === 'zh' ? '安全基础设施' : 'Secure Infrastructure',
      description: lang === 'zh' ? '基于企业级云安全标准构建。' : 'Built on enterprise-grade cloud security standards.',
      category: 'Reliability',
      icon: <Shield />
    }
  ];

  const filteredFeatures = activeFilter === 'All' || activeFilter === '全部'
    ? features 
    : features.filter(f => categoryMap[f.category] === activeFilter || f.category === activeFilter);

  return (
    <MarketingPageTemplate
      title={lang === 'zh' ? "平台功能" : "Platform Features"}
      subtitle={lang === 'zh' ? "探索旨在帮助您了解睡眠模式的工具和功能。" : "Discover the tools and capabilities designed to help you understand your sleep patterns."}
      ctaPrimary={{ text: lang === 'zh' ? "探索产品" : "Explore Product", link: "/product" }}
    >
      <Section>
        <div className="flex flex-wrap gap-2 mb-12 justify-center">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                activeFilter === filter 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' 
                  : 'bg-slate-900 border border-white/10 text-slate-400 hover:text-white hover:border-white/20'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredFeatures.map((feature, idx) => (
            <Card 
              key={idx}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
            >
              <div className="mt-4 pt-4 border-t border-white/5">
                <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">{categoryMap[feature.category]}</span>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section title={lang === 'zh' ? "使用场景" : "Use Cases"}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-white/10 transition-colors">
            <h3 className="text-xl font-bold text-white mb-3">{lang === 'zh' ? "运动恢复" : "Athletic Recovery"}</h3>
            <p className="text-slate-400 leading-relaxed">
              {lang === 'zh' 
                ? "通过了解不同的锻炼如何影响您的睡眠结构和恢复指标，优化训练时间表。"
                : "Optimize training schedules by understanding how different workouts impact your sleep architecture and recovery metrics."}
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-white/10 transition-colors">
            <h3 className="text-xl font-bold text-white mb-3">{lang === 'zh' ? "轮班工作管理" : "Shift Work Management"}</h3>
            <p className="text-slate-400 leading-relaxed">
              {lang === 'zh'
                ? "通过跟踪昼夜节律对齐并识别最具恢复性的睡眠窗口，应对不规则的时间表。"
                : "Navigate irregular schedules by tracking circadian alignment and identifying the most restorative sleep windows."}
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-white/10 transition-colors">
            <h3 className="text-xl font-bold text-white mb-3">{lang === 'zh' ? "生活方式优化" : "Lifestyle Optimization"}</h3>
            <p className="text-slate-400 leading-relaxed">
              {lang === 'zh'
                ? "发现日常习惯、咖啡因摄入量和屏幕时间如何与您的整体睡眠质量和一致性相关联。"
                : "Discover how daily habits, caffeine intake, and screen time correlate with your overall sleep quality and consistency."}
            </p>
          </div>
        </div>
      </Section>

      <Section title={lang === 'zh' ? "传统仪表板 vs Digital Sleep Lab" : "Traditional Dashboards vs Digital Sleep Lab"}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-2xl bg-slate-900/30 border border-white/5">
            <h3 className="text-xl font-bold text-slate-300 mb-6">{lang === 'zh' ? "传统仪表板" : "Traditional Dashboards"}</h3>
            <ul className="space-y-4 text-slate-400">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-2 shrink-0" />
                <span>{lang === 'zh' ? "侧重于原始数字和基本指标（例如，总睡眠小时数）。" : "Focus on raw numbers and basic metrics (e.g., total hours slept)."}</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-2 shrink-0" />
                <span>{lang === 'zh' ? "提供孤立的每日快照，缺乏长期背景。" : "Provide isolated daily snapshots without long-term context."}</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-2 shrink-0" />
                <span>{lang === 'zh' ? "要求用户解释复杂的图表并自行寻找模式。" : "Require users to interpret complex graphs and find their own patterns."}</span>
              </li>
            </ul>
          </div>
          <div className="p-8 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
            <h3 className="text-xl font-bold text-indigo-400 mb-6">Digital Sleep Lab</h3>
            <ul className="space-y-4 text-indigo-200/80">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                <span>{lang === 'zh' ? "侧重于行为模式、一致性和节奏。" : "Focuses on behavioral patterns, consistency, and rhythm."}</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                <span>{lang === 'zh' ? "分析长期趋势以揭示隐藏的相关性。" : "Analyzes long-term trends to reveal hidden correlations."}</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                <span>{lang === 'zh' ? "以通俗易懂的语言生成清晰、可操作的见解。" : "Generates clear, actionable insights in plain language."}</span>
              </li>
            </ul>
          </div>
        </div>
      </Section>

      <div className="text-center pt-12 border-t border-white/5">
        <div className="flex items-center justify-center gap-6">
          <InlineCTA text={lang === 'zh' ? "联系我们" : "Contact Us"} link="/contact" />
          <span className="text-white/20">|</span>
          <InlineCTA text={lang === 'zh' ? "获取支持" : "Get Support"} link="/support" />
        </div>
      </div>
    </MarketingPageTemplate>
  );
};
