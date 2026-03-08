import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { useAuth } from '../context/AuthContext';

interface SubscriptionManagementProps {
  lang: Language;
}

export const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({ lang }) => {
  const { profile } = useAuth();
  const [plan, setPlan] = useState<string>('Free');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile && profile.subscription_plan) {
      setPlan(profile.subscription_plan);
    }
  }, [profile]);

  const handleManageSubscription = async () => {
    setLoading(true);
    // TODO: Implement Stripe Customer Portal redirect
    alert("Redirecting to Stripe Customer Portal...");
    setLoading(false);
  };

  const getPaymentLink = (baseUrl: string, planName: string) => {
    const params = new URLSearchParams();
    if (profile?.id) params.append('client_reference_id', profile.id);
    if (profile?.email) params.append('prefilled_email', profile.email);
    // Note: 'plan' is added as a URL parameter for reference. 
    // For the webhook to receive this in session.metadata, the Payment Link must be configured 
    // in the Stripe Dashboard with this metadata, as URL params don't automatically map to metadata.
    params.append('plan', planName);
    return `${baseUrl}?${params.toString()}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-white">
      <h1 className="text-3xl font-bold mb-8">{lang === 'zh' ? '订阅管理' : 'Subscription Management'}</h1>
      <div className="bg-white/5 p-6 rounded-xl border border-white/10 mb-8">
        <h2 className="text-xl font-semibold mb-4">{lang === 'zh' ? '当前计划' : 'Current Plan'}</h2>
        <p className="text-2xl font-bold text-indigo-400 mb-6">{plan}</p>
        <button 
          onClick={handleManageSubscription}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          {loading ? (lang === 'zh' ? '加载中...' : 'Loading...') : (lang === 'zh' ? '管理订阅' : 'Manage Subscription')}
        </button>
      </div>

      <div className="bg-white/5 p-6 rounded-xl border border-white/10">
        <h2 className="text-xl font-semibold mb-4">{lang === 'zh' ? '升级计划' : 'Upgrade Plan'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a 
            href={getPaymentLink('https://checkout.sleepsomno.com/b/5kQcN50ry8Pl9U28gNcwg03', 'go')}
            className="bg-white/10 hover:bg-white/20 p-4 rounded-lg text-center transition-colors"
          >
            Go
          </a>
          <a 
            href={getPaymentLink('https://checkout.sleepsomno.com/b/5kQaEXcagc1x8PYfJfcwg02', 'pro')}
            className="bg-white/10 hover:bg-white/20 p-4 rounded-lg text-center transition-colors"
          >
            Pro
          </a>
          <a 
            href={getPaymentLink('https://checkout.sleepsomno.com/b/4gM7sL3DK9Tp7LUeFbcwg01', 'plus')}
            className="bg-white/10 hover:bg-white/20 p-4 rounded-lg text-center transition-colors"
          >
            Plus
          </a>
        </div>
      </div>
    </div>
  );
};
