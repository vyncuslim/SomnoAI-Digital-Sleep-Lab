import React from 'react';
import { MarketingPageTemplate } from '../components/ui/MarketingPageTemplate';
import { Section, Card } from '../components/ui/Components';
import { Check } from 'lucide-react';
import { Language } from '../types';

interface PricingProps {
  lang: Language;
}

const Pricing: React.FC<PricingProps> = ({ lang }) => {
  const isZh = lang === 'zh';
  
  return (
    <MarketingPageTemplate
      title={isZh ? "定价方案" : "Pricing Plans"}
      subtitle={isZh ? "选择最适合您的睡眠分析方案" : "Choose the sleep analysis plan that's right for you"}
    >
      <Section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card 
            title={isZh ? "基础版" : "Basic"} 
            description={isZh ? "免费访问核心睡眠分析功能。" : "Free access to core sleep analysis features."}
            icon={<Check className="text-indigo-500" />}
          >
            <div className="text-4xl font-bold mt-4">$0</div>
          </Card>
          <Card 
            title={isZh ? "专业版" : "Pro"} 
            description={isZh ? "深入的洞察、长期趋势分析和个性化建议。" : "In-depth insights, long-term trend analysis, and personalized recommendations."}
            icon={<Check className="text-indigo-500" />}
          >
            <div className="text-4xl font-bold mt-4">$9.99/mo</div>
          </Card>
          <Card 
            title={isZh ? "企业版" : "Enterprise"} 
            description={isZh ? "为健康组织提供的高级功能和 API 访问。" : "Advanced features and API access for health organizations."}
            icon={<Check className="text-indigo-500" />}
          >
            <div className="text-4xl font-bold mt-4">Custom</div>
          </Card>
        </div>
      </Section>
    </MarketingPageTemplate>
  );
};

export default Pricing;
