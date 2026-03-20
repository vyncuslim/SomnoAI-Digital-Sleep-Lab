import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MarketingPageTemplate } from '../components/ui/MarketingPageTemplate';
import { Section, Card } from '../components/ui/Components';
import { Check, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { useAuth } from '../context/AuthContext';
import { HardwareButton, TechnicalLabel } from '../components/ui/Components';

interface PricingProps {
  lang: Language;
}

const Pricing: React.FC<PricingProps> = ({ lang }) => {
  const isZh = lang === 'zh';
  const { user } = useAuth();
  const navigate = useNavigate();

  const handlePlanSelect = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
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
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-8 mb-16 opacity-40">
          <TechnicalLabel label="SECURE_GATEWAY" value="STRIPE_V3" />
          <div className="h-4 w-px bg-white/10" />
          <TechnicalLabel label="ENCRYPTION" value="AES_256_GCM" />
          <div className="h-4 w-px bg-white/10" />
          <TechnicalLabel label="UPTIME_SLA" value="99.99%" />
        </div>

        <Section>
          <div className="max-w-md mx-auto">
            {/* Pro Plan */}
            <Card 
              title={isZh ? "SomnoAI 数字睡眠实验室分析" : "SomnoAI Digital Sleep Lab Analysis"} 
              description={isZh ? "深入的洞察、长期趋势分析和个性化建议。" : "In-depth insights, long-term trend analysis, and personalized recommendations."}
              icon={<Sparkles className="text-indigo-400" />}
              label="NEURAL_ANALYSIS_V2"
              className="border-indigo-500/40 bg-indigo-950/20 shadow-[0_20px_50px_rgba(79,70,229,0.1)] relative overflow-hidden"
            >
              <div className="scanline" />
              <div className="mb-8 space-y-4">
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <Check size={14} className="text-indigo-400" />
                  <span>{isZh ? "无限 AI 睡眠分析报告" : "Unlimited AI Sleep Analysis Reports"}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <Check size={14} className="text-indigo-400" />
                  <span>{isZh ? "无限数据历史记录" : "Unlimited Data History"}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <Check size={14} className="text-indigo-400" />
                  <span>{isZh ? "无限神经科学洞察" : "Unlimited Neural Insights"}</span>
                </div>
              </div>
              <div className="mt-auto">
                <div className="text-5xl font-black italic tracking-tighter text-white mb-8">
                  MYR 10.00<span className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-2">/mo</span>
                </div>
                <HardwareButton 
                  href="https://checkout.sleepsomno.com/b/eVqaEXeioe9F9U2cx3cwg04" 
                  onClick={(e) => handlePlanSelect(e)}
                  variant="primary"
                  className="w-full"
                >
                  {isZh ? "立即订阅" : "Subscribe Now"}
                </HardwareButton>
              </div>
            </Card>
          </div>
        </Section>

        <div className="mt-20 p-8 hardware-panel bg-slate-900/40 border-white/5 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-12 bg-white/10" />
            <span className="micro-label opacity-40">TRUSTED_BY_LABS</span>
            <div className="h-px w-12 bg-white/10" />
          </div>
          <p className="text-slate-400 text-sm italic">
            {isZh ? "加入全球 50,000+ 名追求卓越睡眠的专业人士。" : "Join 50,000+ professionals worldwide optimizing their sleep performance."}
          </p>
        </div>
      </div>
    </MarketingPageTemplate>
  );
};

export default Pricing;
