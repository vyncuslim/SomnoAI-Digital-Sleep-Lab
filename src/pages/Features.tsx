import React, { useState } from 'react';
import { MarketingPageTemplate } from '../components/ui/MarketingPageTemplate';
import { Section, Card, InlineCTA } from '../components/ui/Components';
import { Activity, Brain, Clock, Shield, BarChart3, Lock, Zap, Eye } from 'lucide-react';
import { Language, getTranslation } from '../services/i18n';
import { INFO_CONTENT } from '../data/infoContent';

interface FeaturesProps {
  lang: Language;
}

export const Features: React.FC<FeaturesProps> = ({ lang }) => {
  const content = INFO_CONTENT[lang]?.features || INFO_CONTENT['en'].features;
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
      title={content.title}
      subtitle={content.subtitle}
      ctaPrimary={{ text: lang === 'zh' ? "探索产品" : "Explore Product", link: "/product" }}
    >
      <Section>
        <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap text-lg leading-relaxed mb-12">
          {content.content}
        </div>

        <div className="flex flex-wrap gap-3 mb-16 justify-center">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                activeFilter === filter 
                  ? 'bg-indigo-600 text-white shadow-[0_0_30px_rgba(79,70,229,0.4)]' 
                  : 'bg-slate-900 border border-white/10 text-slate-500 hover:text-white hover:border-white/20'
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
              label={categoryMap[feature.category].toUpperCase()}
            />
          ))}
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
