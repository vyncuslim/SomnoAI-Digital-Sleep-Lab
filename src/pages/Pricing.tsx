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
            label="STARTER"
          >
            <div className="text-5xl font-black italic tracking-tighter text-white mt-4">$0</div>
            <a 
              href={getPaymentLink('https://buy.stripe.com/test_3cI4gyfSSc1g5v41ll6Vq01', 'go')} 
              onClick={(e) => handlePlanSelect(e, getPaymentLink('https://buy.stripe.com/test_3cI4gyfSSc1g5v41ll6Vq01', 'go'))}
              className="mt-8 block bg-white text-black text-center py-4 rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform"
            >
              {isZh ? "选择" : "Select"}
            </a>
          </Card>
          <Card 
            title={isZh ? "Pro版" : "Pro"} 
            description={isZh ? "深入的洞察、长期趋势分析和个性化建议。" : "In-depth insights, long-term trend analysis, and personalized recommendations."}
            icon={<Check className="text-indigo-500" />}
            label="MOST POPULAR"
            className="border-indigo-500/30 bg-indigo-500/5 shadow-[0_0_40px_rgba(79,70,229,0.1)]"
          >
            <div className="text-5xl font-black italic tracking-tighter text-white mt-4">$9.99<span className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-2">/mo</span></div>
            <a 
              href={getPaymentLink('https://buy.stripe.com/test_bJe9AS7mmaXccXw1ll6Vq02', 'pro')} 
              onClick={(e) => handlePlanSelect(e, getPaymentLink('https://buy.stripe.com/test_bJe9AS7mmaXccXw1ll6Vq02', 'pro'))}
              className="mt-8 block bg-indigo-600 text-white text-center py-4 rounded-full font-black uppercase tracking-widest text-xs hover:bg-indigo-500 transition-all shadow-[0_0_30px_rgba(79,70,229,0.3)]"
            >
              {isZh ? "选择" : "Select"}
            </a>
          </Card>
          <Card 
            title={isZh ? "Plus版" : "Plus"} 
            description={isZh ? "为健康组织提供的高级功能和 API 访问。" : "Advanced features and API access for health organizations."}
            icon={<Check className="text-indigo-500" />}
            label="ENTERPRISE"
          >
            <div className="text-5xl font-black italic tracking-tighter text-white mt-4">Custom</div>
            <a 
              href={getPaymentLink('https://buy.stripe.com/test_14A14mgWWfds9Lke876Vq03', 'plus')} 
              onClick={(e) => handlePlanSelect(e, getPaymentLink('https://buy.stripe.com/test_14A14mgWWfds9Lke876Vq03', 'plus'))}
              className="mt-8 block bg-white/5 border border-white/10 text-white text-center py-4 rounded-full font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
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
