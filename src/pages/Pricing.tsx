import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MarketingPageTemplate } from '../components/ui/MarketingPageTemplate';
import { Section, Card } from '../components/ui/Components';
import { Check } from 'lucide-react';
import { Language } from '../types';
import { useAuth } from '../context/AuthContext';

interface PricingProps {
  lang: Language;
}

const Pricing: React.FC<PricingProps> = ({ lang }) => {
  const isZh = lang === 'zh';
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const getPaymentLink = (baseUrl: string, planName: string) => {
    const params = new URLSearchParams();
    if (profile?.id) params.append('client_reference_id', profile.id);
    if (profile?.email) params.append('prefilled_email', profile.email);
    params.append('plan', planName);
    return `${baseUrl}?${params.toString()}`;
  };

  const handlePlanSelect = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    if (!user) {
      e.preventDefault();
      const prefix = lang === 'zh' ? '/cn' : '/en';
      navigate(`${prefix}/auth/login`);
    }
  };
  
  return (
    <MarketingPageTemplate
      title={isZh ? "定价方案" : "Pricing Plans"}
      subtitle={isZh ? "选择最适合您的睡眠分析方案" : "Choose the sleep analysis plan that's right for you"}
    >
      <Section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card 
            title={isZh ? "Go版" : "Go"} 
            description={isZh ? "免费访问核心睡眠分析功能。" : "Free access to core sleep analysis features."}
            icon={<Check className="text-indigo-500" />}
          >
            <div className="text-4xl font-bold mt-4">$0</div>
            <a 
              href={getPaymentLink('https://buy.stripe.com/test_3cI4gyfSSc1g5v41ll6Vq01', 'go')} 
              onClick={(e) => handlePlanSelect(e, getPaymentLink('https://buy.stripe.com/test_3cI4gyfSSc1g5v41ll6Vq01', 'go'))}
              className="mt-4 block bg-indigo-600 text-white text-center py-2 rounded-lg cursor-pointer hover:bg-indigo-700 transition-colors"
            >
              {isZh ? "选择" : "Select"}
            </a>
          </Card>
          <Card 
            title={isZh ? "Pro版" : "Pro"} 
            description={isZh ? "深入的洞察、长期趋势分析和个性化建议。" : "In-depth insights, long-term trend analysis, and personalized recommendations."}
            icon={<Check className="text-indigo-500" />}
          >
            <div className="text-4xl font-bold mt-4">$9.99/mo</div>
            <a 
              href={getPaymentLink('https://buy.stripe.com/test_bJe9AS7mmaXccXw1ll6Vq02', 'pro')} 
              onClick={(e) => handlePlanSelect(e, getPaymentLink('https://buy.stripe.com/test_bJe9AS7mmaXccXw1ll6Vq02', 'pro'))}
              className="mt-4 block bg-indigo-600 text-white text-center py-2 rounded-lg cursor-pointer hover:bg-indigo-700 transition-colors"
            >
              {isZh ? "选择" : "Select"}
            </a>
          </Card>
          <Card 
            title={isZh ? "Plus版" : "Plus"} 
            description={isZh ? "为健康组织提供的高级功能和 API 访问。" : "Advanced features and API access for health organizations."}
            icon={<Check className="text-indigo-500" />}
          >
            <div className="text-4xl font-bold mt-4">Custom</div>
            <a 
              href={getPaymentLink('https://buy.stripe.com/test_14A14mgWWfds9Lke876Vq03', 'plus')} 
              onClick={(e) => handlePlanSelect(e, getPaymentLink('https://buy.stripe.com/test_14A14mgWWfds9Lke876Vq03', 'plus'))}
              className="mt-4 block bg-indigo-600 text-white text-center py-2 rounded-lg cursor-pointer hover:bg-indigo-700 transition-colors"
            >
              {isZh ? "联系我们" : "Contact Us"}
            </a>
          </Card>
        </div>
      </Section>
    </MarketingPageTemplate>
  );
};

export default Pricing;
