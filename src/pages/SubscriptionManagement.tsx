import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Language } from '../types';

interface SubscriptionManagementProps {
  lang: Language;
}

export const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({ lang }) => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const isZh = lang === 'zh';

  // Placeholder for plan data
  const plan = {
    name: 'Pro Plan',
    status: 'active',
    renewalDate: '2026-04-07',
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    // Logic to redirect to Stripe Customer Portal
    // await fetch('/api/stripe/create-portal-session', { method: 'POST' });
    setLoading(false);
    alert(isZh ? '正在跳转至订阅管理页面...' : 'Redirecting to subscription management...');
  };

  return (
    <div className="min-h-screen bg-[#01040a] text-white p-8">
      <h1 className="text-3xl font-bold mb-6">{isZh ? '订阅管理' : 'Subscription Management'}</h1>
      <div className="bg-white/5 p-6 rounded-xl border border-white/10">
        <h2 className="text-xl font-semibold mb-4">{isZh ? '当前计划' : 'Current Plan'}</h2>
        <p className="mb-2">{isZh ? '计划名称：' : 'Plan Name: '} {plan.name}</p>
        <p className="mb-2">{isZh ? '状态：' : 'Status: '} {plan.status}</p>
        <p className="mb-6">{isZh ? '续订日期：' : 'Renewal Date: '} {plan.renewalDate}</p>
        <button 
          onClick={handleManageSubscription}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {loading ? (isZh ? '加载中...' : 'Loading...') : (isZh ? '管理订阅' : 'Manage Subscription')}
        </button>
      </div>
    </div>
  );
};
