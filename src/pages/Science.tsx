import React from 'react';
import { MarketingPageTemplate } from '../components/ui/MarketingPageTemplate';
import { Section, Card, InlineCTA } from '../components/ui/Components';
import { Sun, Moon, Activity } from 'lucide-react';
import { Language } from '../services/i18n';
import { INFO_CONTENT } from '../data/infoContent';

interface ScienceProps {
  lang: Language;
}

export const Science: React.FC<ScienceProps> = ({ lang }) => {
  const content = INFO_CONTENT[lang]?.science || INFO_CONTENT['en'].science;

  return (
    <MarketingPageTemplate
      title={content.title}
      subtitle={content.subtitle}
      ctaPrimary={{ text: lang === 'zh' ? "阅读研究" : "Read Research", link: "/research" }}
    >
      <Section>
        <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap text-lg leading-relaxed mb-12">
          {content.content}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card 
            title={lang === 'zh' ? "昼夜节律" : "Circadian Rhythm"} 
            description={lang === 'zh' ? "调节睡眠-觉醒周期的内部 24 小时时钟，主要受光照 and 温度影响。它决定了您何时感到警觉，何时感到困倦。" : "The internal 24-hour clock that regulates the sleep-wake cycle, primarily influenced by light and temperature. It dictates when you feel alert and when you feel sleepy."}
            icon={<Sun />}
            label="BIOLOGICAL"
          />
          <Card 
            title={lang === 'zh' ? "睡眠结构" : "Sleep Architecture"} 
            description={lang === 'zh' ? "整夜在不同睡眠阶段（浅睡、深睡 and REM）之间的周期性进展。每个阶段都有其独特的恢复功能。" : "The cyclical progression through different stages of sleep (Light, Deep, and REM) throughout the night. Each stage serves a distinct restorative function."}
            icon={<Moon />}
            label="STRUCTURAL"
          />
          <Card 
            title={lang === 'zh' ? "生理恢复" : "Physiological Recovery"} 
            description={lang === 'zh' ? "身体在睡眠期间修复组织、巩固记忆 and 调节新陈代谢的过程，通常反映在静息心率等指标中。" : "The process by which the body repairs tissue, consolidates memories, and regulates metabolism during sleep, often reflected in metrics like resting heart rate."}
            icon={<Activity />}
            label="RESTORATIVE"
          />
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
