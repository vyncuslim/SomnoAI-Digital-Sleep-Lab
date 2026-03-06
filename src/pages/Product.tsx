import React from 'react';
import { MarketingPageTemplate } from '../components/ui/MarketingPageTemplate';
import { Section, Card, InlineCTA } from '../components/ui/Components';
import { Activity, Brain, Clock, Shield, Smartphone, Watch, Cloud, CheckCircle2 } from 'lucide-react';
import { Language, getTranslation } from '../services/i18n';
import { INFO_CONTENT } from '../data/infoContent';

interface ProductProps {
  lang: Language;
}

export const Product: React.FC<ProductProps> = ({ lang }) => {
  const content = INFO_CONTENT[lang]?.product || INFO_CONTENT['en'].product;
  const t = getTranslation(lang, 'landing');
  
  return (
    <MarketingPageTemplate
      title={content.title}
      subtitle={content.subtitle}
      ctaPrimary={{ text: lang === 'zh' ? "查看功能" : "View Features", link: "/features" }}
      ctaSecondary={{ text: t.nav?.signup || "Join Waitlist", link: "/auth/signup" }}
    >
      <Section>
        <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap text-lg leading-relaxed">
          {content.content}
        </div>
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
            description={lang === 'zh' ? "识别可能影响个人长期睡眠 and 恢复的周期性趋势。" : "Identifying recurring trends that may influence how individuals sleep and recover over extended periods."} 
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

      <Section title={lang === 'zh' ? "支持的集成" : "Supported Integrations"}>
        <div className="flex flex-wrap gap-4 items-center justify-center py-8">
          <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 border border-white/10 text-slate-400"><Watch size={20} /> {lang === 'zh' ? "可穿戴设备" : "Wearables"}</div>
          <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 border border-white/10 text-slate-400"><Smartphone size={20} /> {lang === 'zh' ? "健康应用" : "Health Apps"}</div>
          <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 border border-white/10 text-slate-400"><Cloud size={20} /> {lang === 'zh' ? "云生态系统" : "Cloud Ecosystems"}</div>
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
