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

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-white">
      <h1 className="text-3xl font-bold mb-8">{lang === 'zh' ? '订阅管理' : 'Subscription Management'}</h1>
      <div className="bg-white/5 p-6 rounded-xl border border-white/10">
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
    </div>
  );
};
