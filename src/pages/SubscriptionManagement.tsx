import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, ShieldCheck, Zap, Activity, ChevronRight, CreditCard, Settings, ArrowLeft, Sparkles, Cpu, Clock, History, Brain, RefreshCw } from 'lucide-react';
import { Language } from '../types';
import { useAuth } from '../context/AuthContext';
import { GridBackground, HardwareWidget } from '../components/ui/Components';
import { useNavigate } from 'react-router-dom';

interface SubscriptionManagementProps {
  lang: Language;
}

const PLAN_LINKS = {
  go: 'https://buy.stripe.com/test_3cI4gyfSSc1g5v41ll6Vq01',
  pro: 'https://buy.stripe.com/test_bJe9AS7mmaXccXw1ll6Vq02',
  plus: 'https://buy.stripe.com/test_14A14mgWWfds9Lke876Vq03'
};

export const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({ lang }) => {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<string>('Go');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refreshProfile();
  }, []);

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
    try {
      const url = new URL(baseUrl);
      if (profile?.id) url.searchParams.append('client_reference_id', profile.id);
      if (profile?.email) url.searchParams.append('prefilled_email', profile.email);
      // Add metadata specifying the plan name
      url.searchParams.append('plan', planName);
      return url.toString();
    } catch (e) {
      console.error('Invalid payment URL:', baseUrl);
      return baseUrl;
    }
  };

  return (
    <div className="min-h-screen bg-[#01040a] text-white relative overflow-hidden grainy-bg pb-20">
      <GridBackground />
      
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/5 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 blur-[160px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        <div className="mb-12">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{lang === 'zh' ? '返回' : 'Back'}</span>
          </button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="micro-label opacity-40">BILLING_MODULE: ONLINE</span>
                <div className="h-px w-12 bg-white/10" />
                <span className="micro-label text-indigo-400">SECURE_ENCRYPTION: AES-256</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white mb-2 leading-none">
                {lang === 'zh' ? '订阅管理' : 'Subscription Management'}
              </h1>
              <p className="text-slate-400 font-medium text-lg border-l-2 border-indigo-500/20 pl-6 mt-4">
                {lang === 'zh' ? '管理您的实验室访问级别和计费。' : 'Manage your lab access level and billing.'}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <HardwareWidget label="ENCRYPTION_STATUS" value="100" unit="%" status="active" icon={<ShieldCheck size={20} />} />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Current Plan Section */}
          <div className="lg:col-span-4 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hardware-panel p-8 bg-slate-900/40 backdrop-blur-xl relative group"
            >
              <div className="scanline" />
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                <h2 className="text-xl font-black italic uppercase tracking-widest text-white">{lang === 'zh' ? '当前计划' : 'Current Plan'}</h2>
                <button 
                  onClick={refreshProfile}
                  className="ml-auto text-slate-500 hover:text-white transition-colors"
                  title={lang === 'zh' ? '刷新状态' : 'Refresh Status'}
                >
                  <RefreshCw size={16} />
                </button>
              </div>

              <div className="p-8 bg-black/40 rounded-3xl border border-white/5 relative overflow-hidden group/plan">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/plan:opacity-10 transition-opacity">
                  <Crown size={80} />
                </div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Active Tier</p>
                <p className="text-5xl font-black italic text-indigo-400 uppercase tracking-tighter mb-8 drop-shadow-[0_0_15px_rgba(129,140,248,0.3)]">{plan}</p>
                
                {profile?.stripe_customer_id ? (
                  <button 
                    onClick={handleManageSubscription}
                    disabled={loading}
                    className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Settings size={16} />
                        {lang === 'zh' ? '管理订阅' : 'Manage Subscription'}
                      </>
                    )}
                  </button>
                ) : (
                  <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                    <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider leading-relaxed">
                      {lang === 'zh' ? '您目前处于免费试用阶段。升级以解锁完整神经分析。' : 'You are currently on the free tier. Upgrade to unlock full neural analysis.'}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <span>Billing Cycle</span>
                  <span className="text-slate-300">Monthly</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <span>Next Payment</span>
                  <span className="text-slate-300">-- / -- / --</span>
                </div>
              </div>
            </motion.div>

            <div className="p-6 bg-indigo-600/10 border border-indigo-500/20 rounded-3xl">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-indigo-500/20 rounded-xl">
                  <CreditCard className="text-indigo-400" size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-white mb-1">Secure Payments</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    All transactions are processed via Stripe with 256-bit SSL encryption. We never store your card details.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Upgrade Options */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Zap size={20} className="text-indigo-500" />
                <h2 className="text-xl font-black italic uppercase tracking-widest text-white">{lang === 'zh' ? '升级计划' : 'Upgrade Plan'}</h2>
              </div>
              <span className="micro-label opacity-30">SELECT_NEW_TIER</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Go Plan */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="hardware-panel p-8 bg-slate-900/20 border-white/5 flex flex-col group hover:border-indigo-500/30 transition-all"
              >
                <div className="mb-8">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-1">Go</h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Starter Tier</p>
                </div>
                <div className="mb-8 space-y-4">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <Activity size={14} className="text-indigo-500" />
                    <span>Basic Sleep Tracking</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <Clock size={14} className="text-indigo-500" />
                    <span>7-Day History</span>
                  </div>
                </div>
                <div className="mt-auto pt-8">
                  <div className="mb-6">
                    <span className="text-3xl font-black italic text-white">$0</span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">/ Month</span>
                  </div>
                  <a 
                    href={getPaymentUrl(PLAN_LINKS.go, 'go')}
                    className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 group/btn"
                  >
                    {lang === 'zh' ? '选择 Go' : 'Select Go'}
                    <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </a>
                </div>
              </motion.div>

              {/* Pro Plan */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="hardware-panel p-8 bg-indigo-950/20 border-indigo-500/40 flex flex-col relative overflow-hidden group hover:border-indigo-400 transition-all shadow-[0_20px_50px_rgba(79,70,229,0.1)]"
              >
                <div className="absolute top-0 right-0 bg-indigo-600 text-[8px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-bl-xl italic shadow-lg">
                  Recommended
                </div>
                <div className="scanline" />
                <div className="mb-8">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-1">Pro</h3>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Advanced Tier</p>
                </div>
                <div className="mb-8 space-y-4">
                  <div className="flex items-center gap-3 text-xs text-slate-300">
                    <Sparkles size={14} className="text-indigo-400" />
                    <span>AI Sleep Analysis</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-300">
                    <History size={14} className="text-indigo-400" />
                    <span>Unlimited History</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-300">
                    <Brain size={14} className="text-indigo-400" />
                    <span>Neural Insights</span>
                  </div>
                </div>
                <div className="mt-auto pt-8">
                  <div className="mb-6">
                    <span className="text-3xl font-black italic text-white">$19</span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">/ Month</span>
                  </div>
                  <a 
                    href={getPaymentUrl(PLAN_LINKS.pro, 'pro')}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(79,70,229,0.3)] group/btn"
                  >
                    {lang === 'zh' ? '选择 Pro' : 'Select Pro'}
                    <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </a>
                </div>
              </motion.div>

              {/* Plus Plan */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="hardware-panel p-8 bg-slate-900/20 border-white/5 flex flex-col group hover:border-purple-500/30 transition-all"
              >
                <div className="mb-8">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-1">Plus</h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Elite Tier</p>
                </div>
                <div className="mb-8 space-y-4">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <Cpu size={14} className="text-purple-500" />
                    <span>Custom Neural Models</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <ShieldCheck size={14} className="text-purple-500" />
                    <span>Priority Support</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <Zap size={14} className="text-purple-500" />
                    <span>Real-time Telemetry</span>
                  </div>
                </div>
                <div className="mt-auto pt-8">
                  <div className="mb-6">
                    <span className="text-3xl font-black italic text-white">$49</span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">/ Month</span>
                  </div>
                  <a 
                    href={getPaymentUrl(PLAN_LINKS.plus, 'plus')}
                    className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 group/btn"
                  >
                    {lang === 'zh' ? '选择 Plus' : 'Select Plus'}
                    <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
