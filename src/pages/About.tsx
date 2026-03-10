import React from 'react';
import { MarketingPageTemplate } from '../components/ui/MarketingPageTemplate';
import { Section, Card, InlineCTA, HardwareButton, TechnicalLabel } from '../components/ui/Components';
import { Shield, Lock, Brain, Activity, LineChart, Lightbulb, ExternalLink } from 'lucide-react';
import { AlertBanner } from '../components/ui/Components';
import { Language, getTranslation } from '../services/i18n';
import { INFO_CONTENT } from '../data/infoContent';

interface AboutProps {
  lang: Language;
}

export const About: React.FC<AboutProps> = ({ lang }) => {
  const content = INFO_CONTENT[lang]?.about || INFO_CONTENT['en'].about;
  const lt = getTranslation(lang, 'landing');

  return (
    <MarketingPageTemplate
      title={content.title}
      subtitle={content.subtitle}
      ctaPrimary={{ text: lt.ctaPrimary || "Explore Platform", link: "/product" }}
      ctaSecondary={{ text: lang === 'zh' ? "阅读研究" : "Read Research", link: "/research" }}
    >
      <Section>
        <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap text-lg leading-relaxed">
          {content.content}
        </div>
      </Section>

      <Section title={lang === 'zh' ? "指导原则" : "Guiding Principles"}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card 
            title={lang === 'zh' ? "透明度" : "Transparency"} 
            description={lang === 'zh' ? "我们致力于创建易于访问且易于理解的工具，确保用户确切了解其数据的使用和分析方式。" : "We aim to create tools that are accessible and understandable, ensuring users know exactly how their data is being used and analyzed."}
            icon={<Shield />}
            label="ETHICS"
          />
          <Card 
            title={lang === 'zh' ? "隐私" : "Privacy"} 
            description={lang === 'zh' ? "数据被视为敏感资源，必须以负责任且尊重用户的方式处理。我们对道德数据实践有着坚定的承诺。" : "Data is treated as a sensitive resource that must be handled responsibly and with respect for users. We maintain strong commitments to ethical data practices."}
            icon={<Lock />}
            label="SECURITY"
          />
          <Card 
            title={lang === 'zh' ? "负责任的 AI" : "Responsible AI"} 
            description={lang === 'zh' ? "我们构建分析框架，揭示隐藏在大量行为数据中的模式，始终优先考虑可解释性和科学完整性。" : "We build analytical frameworks that reveal patterns hidden within large volumes of behavioral data, always prioritizing interpretability and scientific integrity."}
            icon={<Brain />}
            label="INTELLIGENCE"
          />
        </div>
      </Section>

      <Section>
        <AlertBanner title={lang === 'zh' ? "医疗免责声明" : "Medical Disclaimer"} type="warning">
          {lang === 'zh' ? "SomnoAI Digital Sleep Lab 作为一个以研究为导向的信息平台运行。它不提供医疗建议、诊断或治疗。相反，该平台旨在帮助用户更好地了解与休息和恢复相关的行为趋势。" : "SomnoAI Digital Sleep Lab operates as a research-oriented informational platform. It does not provide medical advice, diagnosis, or treatment. Instead, the platform is designed to help users better understand behavioral trends associated with rest and recovery."}
        </AlertBanner>
      </Section>

      <Section>
        <div className="text-center py-12 hardware-panel relative overflow-hidden">
            <div className="scanline" />
            <TechnicalLabel label="EXTERNAL_RESOURCE" value="GROKPEDIA" className="justify-center mb-6" />
            <p className="text-slate-400 mb-8 max-w-lg mx-auto text-sm">
                {lang === 'zh' ? "SomnoAI Digital Sleep Lab 也被收录在 Grokpedia，这是一个致力于记录前沿科技与创新的百科全书。" : "SomnoAI Digital Sleep Lab is also listed in Grokpedia, an encyclopedia dedicated to documenting cutting-edge technology and innovation."}
            </p>
            <HardwareButton 
                onClick={() => window.open("https://grokipedia.com/page/SomnoAI_Digital_Sleep_Lab#somnoai-digital-sleep-lab", "_blank")}
                variant="outline"
                icon={<ExternalLink size={16} />}
                className="mx-auto"
            >
                grokipedia.com/somnoai
            </HardwareButton>
        </div>
      </Section>

      <div className="text-center pt-12 border-t border-white/5">
        <h3 className="text-2xl font-bold text-white mb-6">{lang === 'zh' ? "对我们的工作感兴趣？" : "Interested in our work?"}</h3>
        <div className="flex items-center justify-center gap-6">
          <InlineCTA text={lang === 'zh' ? "联系我们" : "Contact Us"} link="/contact" />
          <span className="text-white/20">|</span>
          <InlineCTA text={lang === 'zh' ? "合作洽谈" : "Collaboration"} link="/contact" />
        </div>
      </div>
    </MarketingPageTemplate>
  );
};
