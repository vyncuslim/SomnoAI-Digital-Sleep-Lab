import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MarketingPageTemplate } from '../components/ui/MarketingPageTemplate';
import { Section, Card } from '../components/ui/Components';
import { Check, ShieldCheck, Cpu, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { useAuth } from '../context/AuthContext';
import { HardwareButton, TechnicalLabel } from '../components/ui/Components';

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Go Plan */}
            <Card 
              title={isZh ? "Go版" : "Go"} 
              description={isZh ? "免费访问核心睡眠分析功能。" : "Free access to core sleep analysis features."}
              icon={<Cpu className="text-slate-400" />}
              label="STARTER_TIER"
            >
              <div className="mb-8 space-y-4">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <Check size={14} className="text-indigo-500" />
                  <span>{isZh ? "基础睡眠追踪" : "Basic Sleep Tracking"}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <Check size={14} className="text-indigo-500" />
                  <span>{isZh ? "7天历史记录" : "7-Day History"}</span>
                </div>
              </div>
              <div className="mt-auto">
                <div className="text-5xl font-black italic tracking-tighter text-white mb-8">$0</div>
                <HardwareButton 
                  href={getPaymentLink('https://buy.stripe.com/test_3cI4gyfSSc1g5v41ll6Vq01', 'go')} 
                  onClick={(e) => handlePlanSelect(e)}
                  variant="outline"
                  className="w-full"
                >
                  {isZh ? "选择 Go" : "Select Go"}
                </HardwareButton>
              </div>
            </Card>

            {/* Pro Plan */}
            <Card 
              title={isZh ? "Pro版" : "Pro"} 
              description={isZh ? "深入的洞察、长期趋势分析和个性化建议。" : "In-depth insights, long-term trend analysis, and personalized recommendations."}
              icon={<Sparkles className="text-indigo-400" />}
              label="NEURAL_ANALYSIS_V2"
              className="border-indigo-500/40 bg-indigo-950/20 shadow-[0_20px_50px_rgba(79,70,229,0.1)] relative overflow-hidden"
            >
              <div className="scanline" />
              <div className="mb-8 space-y-4">
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <Check size={14} className="text-indigo-400" />
                  <span>{isZh ? "AI 睡眠分析报告" : "AI Sleep Analysis Reports"}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <Check size={14} className="text-indigo-400" />
                  <span>{isZh ? "无限历史记录" : "Unlimited History"}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <Check size={14} className="text-indigo-400" />
                  <span>{isZh ? "神经科学建议" : "Neural Insights"}</span>
                </div>
              </div>
              <div className="mt-auto">
                <div className="text-5xl font-black italic tracking-tighter text-white mb-8">
                  $9.99<span className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-2">/mo</span>
                </div>
                <HardwareButton 
                  href={getPaymentLink('https://buy.stripe.com/test_bJe9AS7mmaXccXw1ll6Vq02', 'pro')} 
                  onClick={(e) => handlePlanSelect(e)}
                  variant="primary"
                  className="w-full"
                >
                  {isZh ? "选择 Pro" : "Select Pro"}
                </HardwareButton>
              </div>
            </Card>

            {/* Plus Plan */}
            <Card 
              title={isZh ? "Plus版" : "Plus"} 
              description={isZh ? "为健康组织提供的高级功能和 API 访问。" : "Advanced features and API access for health organizations."}
              icon={<ShieldCheck className="text-purple-400" />}
              label="ENTERPRISE_ELITE"
            >
              <div className="mb-8 space-y-4">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <Check size={14} className="text-purple-500" />
                  <span>{isZh ? "自定义神经模型" : "Custom Neural Models"}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <Check size={14} className="text-purple-500" />
                  <span>{isZh ? "优先技术支持" : "Priority Support"}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <Check size={14} className="text-purple-500" />
                  <span>{isZh ? "实时遥测 API" : "Real-time Telemetry API"}</span>
                </div>
              </div>
              <div className="mt-auto">
                <div className="text-5xl font-black italic tracking-tighter text-white mb-8">Custom</div>
                <HardwareButton 
                  href={getPaymentLink('https://buy.stripe.com/test_14A14mgWWfds9Lke876Vq03', 'plus')} 
                  onClick={(e) => handlePlanSelect(e)}
                  variant="outline"
                  className="w-full"
                >
                  {isZh ? "联系我们" : "Contact Us"}
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
