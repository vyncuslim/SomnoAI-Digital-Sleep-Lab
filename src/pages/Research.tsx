import React from 'react';
import { MarketingPageTemplate } from '../components/ui/MarketingPageTemplate';
import { Section, Card, Accordion, InlineCTA } from '../components/ui/Components';
import { Activity, Brain, Clock, Moon, Sun, Zap } from 'lucide-react';
import { Language, getTranslation } from '../services/i18n';
import { INFO_CONTENT } from '../data/infoContent';

interface ResearchProps {
  lang: Language;
}

export const Research: React.FC<ResearchProps> = ({ lang }) => {
  const content = INFO_CONTENT[lang]?.research || INFO_CONTENT['en'].research;

  return (
    <MarketingPageTemplate
      title={content.title}
      subtitle={content.subtitle}
      ctaPrimary={{ text: lang === 'zh' ? "阅读科学" : "Read Science", link: "/science" }}
      ctaSecondary={{ text: lang === 'zh' ? "阅读博客" : "Read Blog", link: "/blog" }}
    >
      <Section>
        <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap text-lg leading-relaxed mb-12">
          {content.content}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card 
            title={lang === 'zh' ? "昼夜节律" : "Circadian Rhythm"} 
            description={lang === 'zh' ? "调查日常常规和环境因素如何影响身体自然的 24 小时周期。" : "Investigating how daily routines and environmental factors influence the body's natural 24-hour cycle."}
            icon={<Sun />}
            label="CHRONOBIOLOGY"
          />
          <Card 
            title={lang === 'zh' ? "睡眠一致性" : "Sleep Consistency"} 
            description={lang === 'zh' ? "分析不规则睡眠时间表对认知表现和长期健康指标的影响。" : "Analyzing the impact of irregular sleep schedules on cognitive performance and long-term health markers."}
            icon={<Clock />}
            label="BEHAVIORAL"
          />
          <Card 
            title={lang === 'zh' ? "生理恢复" : "Physiological Recovery"} 
            description={lang === 'zh' ? "研究深度睡眠阶段、静息心率与身体修复之间的关系。" : "Studying the relationship between deep sleep phases, resting heart rate, and physical restoration."}
            icon={<Activity />}
            label="PHYSIOLOGICAL"
          />
          <Card 
            title={lang === 'zh' ? "睡眠结构" : "Sleep Architecture"} 
            description={lang === 'zh' ? "检查整夜睡眠阶段的结构 and 进展。" : "Examining the structure and progression of sleep stages throughout the night."}
            icon={<Brain />}
            label="NEUROLOGICAL"
          />
          <Card 
            title={lang === 'zh' ? "环境因素" : "Environmental Factors"} 
            description={lang === 'zh' ? "了解光照、温度和噪音如何影响入睡和睡眠维持。" : "Understanding how light exposure, temperature, and noise affect sleep onset and maintenance."}
            icon={<Moon />}
            label="ENVIRONMENTAL"
          />
          <Card 
            title={lang === 'zh' ? "能量与疲劳" : "Energy & Fatigue"} 
            description={lang === 'zh' ? "将主观能量水平与客观睡眠指标相关联，以预测白天的疲劳感。" : "Correlating subjective energy levels with objective sleep metrics to predict daytime fatigue."}
            icon={<Zap />}
            label="PERFORMANCE"
          />
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
