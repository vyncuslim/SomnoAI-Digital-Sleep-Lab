import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { useAuth } from '../context/AuthContext';

interface SubscriptionManagementProps {
  lang: Language;
}

const PLAN_LINKS = {
  go: 'https://buy.stripe.com/test_3cI4gyfSSc1g5v41ll6Vq01',
  pro: 'https://buy.stripe.com/test_bJe9AS7mmaXccXw1ll6Vq02',
  plus: 'https://buy.stripe.com/test_14A14mgWWfds9Lke876Vq03'
};

export const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({ lang }) => {
  const { profile } = useAuth();
  const [plan, setPlan] = useState<string>('Go');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile && profile.subscription_plan) {
      const p = profile.subscription_plan;
      // Capitalize first letter
      setPlan(p.charAt(0).toUpperCase() + p.slice(1));
    }
  }, [profile]);

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      if (!profile?.id) {
        setLoading(false);
        return;
      }
      
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: profile.id }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create portal session');
      }
      
      const { url } = await response.json();
      window.location.href = url;
    } catch (error: any) {
      console.error('Error redirecting to portal:', error);
      alert(lang === 'zh' ? '无法连接到订阅管理页面，请稍后再试。' : 'Failed to redirect to subscription management. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentUrl = (baseUrl: string, planName: string) => {
    const params = new URLSearchParams();
    if (profile?.id) params.append('client_reference_id', profile.id);
    if (profile?.email) params.append('prefilled_email', profile.email);
    // Add metadata specifying the plan name
    params.append('plan', planName);
    return `${baseUrl}?${params.toString()}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-white">
      <h1 className="text-3xl font-bold mb-8">{lang === 'zh' ? '订阅管理' : 'Subscription Management'}</h1>
      
      {/* Current Plan Section */}
      <div className="bg-white/5 p-6 rounded-xl border border-white/10 mb-8">
        <h2 className="text-xl font-semibold mb-4">{lang === 'zh' ? '当前计划' : 'Current Plan'}</h2>
        <div className="flex items-center justify-between">
          <p className="text-2xl font-bold text-indigo-400">{plan}</p>
          {profile?.stripe_customer_id && (
            <button 
              onClick={handleManageSubscription}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? (lang === 'zh' ? '加载中...' : 'Loading...') : (lang === 'zh' ? '管理订阅' : 'Manage Subscription')}
            </button>
          )}
        </div>
      </div>

      {/* Upgrade Options */}
      <div className="bg-white/5 p-6 rounded-xl border border-white/10">
        <h2 className="text-xl font-semibold mb-6">{lang === 'zh' ? '升级计划' : 'Upgrade Plan'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Go Plan */}
          <div className="bg-white/5 p-6 rounded-lg border border-white/10 flex flex-col">
            <h3 className="text-lg font-bold mb-2">Go</h3>
            <p className="text-sm text-gray-400 mb-4">Basic features for starters</p>
            <a 
              href={getPaymentUrl(PLAN_LINKS.go, 'go')}
              className="mt-auto bg-white/10 hover:bg-white/20 py-2 px-4 rounded-lg text-center transition-colors block w-full"
            >
              {lang === 'zh' ? '选择 Go' : 'Select Go'}
            </a>
          </div>

          {/* Pro Plan */}
          <div className="bg-white/5 p-6 rounded-lg border border-indigo-500/30 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-indigo-600 text-xs px-2 py-1 rounded-bl-lg">Popular</div>
            <h3 className="text-lg font-bold mb-2">Pro</h3>
            <p className="text-sm text-gray-400 mb-4">Advanced tools for serious users</p>
            <a 
              href={getPaymentUrl(PLAN_LINKS.pro, 'pro')}
              className="mt-auto bg-indigo-600 hover:bg-indigo-700 py-2 px-4 rounded-lg text-center transition-colors block w-full"
            >
              {lang === 'zh' ? '选择 Pro' : 'Select Pro'}
            </a>
          </div>

          {/* Plus Plan */}
          <div className="bg-white/5 p-6 rounded-lg border border-white/10 flex flex-col">
            <h3 className="text-lg font-bold mb-2">Plus</h3>
            <p className="text-sm text-gray-400 mb-4">Maximum power and support</p>
            <a 
              href={getPaymentUrl(PLAN_LINKS.plus, 'plus')}
              className="mt-auto bg-white/10 hover:bg-white/20 py-2 px-4 rounded-lg text-center transition-colors block w-full"
            >
              {lang === 'zh' ? '选择 Plus' : 'Select Plus'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
