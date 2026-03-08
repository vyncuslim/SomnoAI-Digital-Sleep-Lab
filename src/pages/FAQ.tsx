import React from 'react';
import { MarketingPageTemplate } from '../components/ui/MarketingPageTemplate';
import { Section, Accordion, InlineCTA } from '../components/ui/Components';
import { Language, getTranslation } from '../services/i18n';
import { INFO_CONTENT } from '../data/infoContent';

interface FAQProps {
  lang: Language;
}

export const FAQ: React.FC<FAQProps> = ({ lang }) => {
  const content = INFO_CONTENT[lang]?.faq || INFO_CONTENT['en'].faq;
  
  const faqItems = [
    {
      title: lang === 'zh' ? "什么是 SomnoAI Digital Sleep Lab？" : "What is SomnoAI Digital Sleep Lab?",
      content: lang === 'zh' 
        ? "SomnoAI Digital Sleep Lab 是一项以研究为导向的技术倡议，致力于探索人工智能和先进的数据分析如何加深对人类睡眠的理解。我们将来自可穿戴设备的原始行为信号转化为关于休息、恢复和节律的有意义的见解。"
        : "SomnoAI Digital Sleep Lab is a research-driven technology initiative dedicated to exploring how artificial intelligence and advanced data analysis can deepen the understanding of human sleep. We transform raw behavioral signals from wearable devices into meaningful insights about rest, recovery, and rhythms."
    },
    {
      title: lang === 'zh' ? "这是一种医疗设备吗？" : "Is this a medical device?",
      content: lang === 'zh'
        ? "不。SomnoAI Digital Sleep Lab 是一个信息和研究平台。它不旨在诊断、治疗或预防任何医疗状况。对于与睡眠相关的医疗问题，请务必咨询医疗保健专业人员。"
        : "No. SomnoAI Digital Sleep Lab is an informational and research platform. It is not intended to diagnose, treat, or prevent any medical condition. Always consult with a healthcare professional for medical concerns related to sleep."
    },
    {
      title: lang === 'zh' ? "我如何连接我的设备？" : "How do I connect my devices?",
      content: lang === 'zh'
        ? "该平台支持与主要的可穿戴生态系统和健康应用集成。注册后，您可以通过仪表板中的“集成”部分连接您的设备。"
        : "The platform supports integration with major wearable ecosystems and health apps. You can connect your devices through the 'Integrations' section in your dashboard after signing up."
    },
    {
      title: lang === 'zh' ? "我的数据如何受到保护？" : "How is my data protected?",
      content: lang === 'zh'
        ? "我们优先考虑数据隐私和安全。您的数据在存储和传输过程中均经过加密。在执行大规模计算分析之前，我们还会应用匿名化技术。有关更多详细信息，请参阅我们的隐私政策。"
        : "We prioritize data privacy and security. Your data is encrypted at rest and in transit. We also apply anonymization techniques before performing large-scale computational analysis. For more details, please see our Privacy Policy."
    },
    {
      title: lang === 'zh' ? "我将收到什么样的见解？" : "What kind of insights will I receive?",
      content: lang === 'zh'
        ? "您将收到关于您的睡眠一致性、昼夜节律对齐和生理恢复趋势的观察结果。我们不只是提供原始数字，而是提供可解释的摘要，帮助您了解自己的行为睡眠模式。"
        : "You will receive observations about your sleep consistency, circadian alignment, and physiological recovery trends. Instead of just raw numbers, we provide interpretable summaries that help you understand your behavioral sleep patterns."
    },
    {
      title: lang === 'zh' ? "使用该平台需要付费吗？" : "Is there a cost to use the platform?",
      content: lang === 'zh'
        ? "在我们的研究阶段，参与者可以免费使用该平台的基础功能。随着平台的发展，我们将来可能会推出高级功能或订阅模型。"
        : "During our research phase, basic access to the platform is free for participants. We may introduce premium features or subscription models in the future as the platform evolves."
    },
    {
      title: lang === 'zh' ? "AI 预测会出错吗？" : "Can AI predictions be wrong?",
      content: lang === 'zh'
        ? "是的。AI 输出是概率性的，不应被视为明确的结论。我们的模型正在不断完善，但它们并非万无一失。"
        : "Yes. AI outputs are probabilistic and should not be treated as definitive conclusions. Our models are constantly being refined, but they are not infallible."
    }
  ];

  return (
    <MarketingPageTemplate
      title={content.title}
      subtitle={content.subtitle}
    >
      <Section className="max-w-3xl mx-auto">
        <Accordion items={faqItems} />
      </Section>

      <Section title={lang === 'zh' ? "还有其他问题吗？" : "Still have questions?"}>
        <div className="hardware-panel p-12 text-center">
          <div className="hardware-label mb-6">SUPPORT CENTER</div>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">{lang === 'zh' ? "如果您找不到所需的答案，请随时联系我们的团队。" : "If you couldn't find the answer you were looking for, please feel free to reach out to our team."}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <InlineCTA text={lang === 'zh' ? "联系支持" : "Contact Support"} link="/support" />
            <div className="hidden sm:block w-px h-8 bg-white/10" />
            <InlineCTA text={lang === 'zh' ? "给我们发邮件" : "Email Us"} link="/contact" />
          </div>
        </div>
      </Section>
    </MarketingPageTemplate>
  );
};
