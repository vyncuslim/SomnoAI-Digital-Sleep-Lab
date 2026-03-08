import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Brain, Activity, Zap, 
  CheckCircle2, Users, Database, ShieldCheck,
  Smartphone, BarChart3, MessageSquare, Heart,
  Mail
} from 'lucide-react';

import { MarketingPageTemplate } from './ui/MarketingPageTemplate';
import { Section, Card, InlineCTA, HardwareWidget } from './ui/Components';
import { Language, getTranslation } from '../services/i18n';
import { useAuth } from '../context/AuthContext';

interface LandingPageProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  onNavigate: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ lang, onNavigate }) => {
  const { user, profile } = useAuth();
  const t = getTranslation(lang, 'landing');

  const getPaymentLink = (baseUrl: string, planName: string) => {
    try {
      const url = new URL(baseUrl);
      if (profile?.id) url.searchParams.append('client_reference_id', profile.id);
      if (profile?.email) url.searchParams.append('prefilled_email', profile.email);
      url.searchParams.append('plan', planName);
      return url.toString();
    } catch (e) {
      return baseUrl;
    }
  };

  const handlePlanSelect = (url: string) => {
    if (!user) {
      onNavigate('/auth/login');
      return;
    }
    window.location.href = url;
  };

  const stats = [
    { label: t.stats?.analyzed || "Hours Analyzed", value: "10M+", unit: "HRS", icon: Database },
    { label: t.stats?.accuracy || "Sleep Accuracy", value: "98.4", unit: "%", icon: CheckCircle2 },
    { label: t.stats?.users || "Active Users", value: "50", unit: "K+", icon: Users },
    { label: t.stats?.encrypted || "Data Encrypted", value: "100", unit: "%", icon: ShieldCheck },
  ];

  const steps = [
    { 
      step: "01", 
      title: lang === 'zh' ? "连接设备" : "Connect Device", 
      desc: lang === 'zh' ? "同步 Apple Health, Google Fit, 或 Oura Ring 数据。" : "Sync with Apple Health, Google Fit, or Oura Ring.",
      icon: Smartphone 
    },
    { 
      step: "02", 
      title: lang === 'zh' ? "AI 分析" : "AI Analysis", 
      desc: lang === 'zh' ? "Gemini 2.5 Pro 处理您的睡眠和生理数据。" : "Gemini 2.5 Pro processes your sleep and physiological data.",
      icon: Brain 
    },
    { 
      step: "03", 
      title: lang === 'zh' ? "生成报告" : "Generate Report", 
      desc: lang === 'zh' ? "获取深度的睡眠架构和恢复评分。" : "Get deep sleep architecture and recovery scoring.",
      icon: BarChart3 
    },
    { 
      step: "04", 
      title: lang === 'zh' ? "行动建议" : "Actionable Advice", 
      desc: lang === 'zh' ? "获得个性化的作息调整和训练建议。" : "Receive personalized schedule and training recommendations.",
      icon: Zap 
    }
  ];

  const testimonials = [
    {
      quote: lang === 'zh' ? "分析的深度与我见过的任何东西都不同。它不仅仅是追踪；它是真正的指导。" : "The depth of analysis is unlike anything I've seen. It's not just tracking; it's actual coaching.",
      author: lang === 'zh' ? "Sarah Chen 博士" : "Dr. Sarah Chen",
      role: lang === 'zh' ? "神经科学家" : "Neuroscientist"
    },
    {
      quote: lang === 'zh' ? "终于有一个睡眠应用告诉我*为什么*我累，而不仅仅是*我*累了。" : "Finally, a sleep app that tells me *why* I'm tired, not just *that* I'm tired.",
      author: lang === 'zh' ? "Marcus Thorne" : "Marcus Thorne",
      role: lang === 'zh' ? "精英运动员" : "Elite Athlete"
    }
  ];

  return (
    <MarketingPageTemplate
      title={
        <div className="mb-6">
          {user && (
            <motion.p 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-indigo-400 font-bold uppercase tracking-widest text-sm mb-4 flex items-center justify-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              {lang === 'zh' ? '欢迎回来,' : 'Welcome back,'} {profile?.email || user.email}
            </motion.p>
          )}
          <h1 className="text-6xl md:text-9xl font-black italic uppercase tracking-tighter text-white leading-[0.9]">
            SOMNOAI <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
              SLEEP LAB
            </span>
          </h1>
        </div>
      }
      subtitle={t.heroSubtitle || "Connect your wearable → Get AI recovery intelligence. Upload your sleep data, let our AI analyze it, and wake up to actionable recovery protocols."}
      ctaPrimary={{ text: t.ctaPrimary || "Start Analysis", link: "/auth/signup" }}
      ctaSecondary={{ text: t.ctaSecondary || "Learn More", link: "/about" }}
    >
      {/* Stats Section */}
      <Section moduleID="STATS_01">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <HardwareWidget 
              key={i}
              label={stat.label}
              value={stat.value}
              unit={stat.unit}
              icon={<stat.icon size={24} />}
              status={i === 0 ? 'active' : 'idle'}
            />
          ))}
        </div>
      </Section>

      {/* Core Capabilities */}
      <Section 
        moduleID="CORE_01"
        title={lang === 'zh' ? '核心能力' : 'Core Capabilities'} 
        description={lang === 'zh' ? '由 Gemini 2.5 Pro 模型驱动的高级遥测处理。' : 'Advanced telemetry processing powered by Gemini 2.5 Pro models.'}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Activity, title: t.features?.biometric?.title || "Biometric Tracking", desc: t.features?.biometric?.desc || "Real-time heart rate and movement analysis during sleep cycles.", label: "TELEMETRY" },
            { icon: Brain, title: t.features?.neural?.title || "Neural Insights", desc: t.features?.neural?.desc || "AI-driven interpretation of sleep stages and quality metrics.", label: "COGNITIVE" },
            { icon: Zap, title: t.features?.recovery?.title || "Recovery Optimization", desc: t.features?.recovery?.desc || "Personalized protocols to enhance deep sleep and recovery.", label: "PROTOCOL" }
          ].map((item, i) => (
            <Card 
              key={i}
              title={item.title}
              description={item.desc}
              icon={<item.icon size={32} />}
              label={item.label}
            />
          ))}
        </div>
      </Section>

      {/* The Protocol */}
      <Section 
        moduleID="PROC_01"
        title={lang === 'zh' ? '协议流程' : 'The Protocol'} 
        description={lang === 'zh' ? '实现全面认知恢复的四个步骤。' : 'Four steps to total cognitive restoration.'}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col gap-6 p-8 rounded-[2rem] border border-white/5 bg-slate-900/30 hover:bg-slate-900/50 transition-colors group">
              <div className="text-5xl font-black text-indigo-500/20 group-hover:text-indigo-500/40 transition-colors font-mono">{step.step}</div>
              <div className="p-4 bg-indigo-500/10 rounded-2xl w-fit text-indigo-400 group-hover:scale-110 transition-transform">
                <step.icon size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Compatible with Major Devices */}
      <Section moduleID="ECO_01" className="text-center">
        <div className="hardware-label mb-12 opacity-50">Compatible Ecosystem</div>
        <div className="flex flex-wrap justify-center gap-8 md:gap-20">
          {['Apple Watch', 'Oura', 'Garmin', 'Fitbit', 'Whoop'].map((device) => (
            <span key={device} className="text-2xl md:text-4xl font-black italic tracking-tighter text-white/20 hover:text-indigo-400 transition-all duration-500 cursor-default select-none hover:scale-110">
              {device}
            </span>
          ))}
        </div>
      </Section>

      {/* Technical Specifications */}
      <Section 
        moduleID="TECH_01"
        title={t.techSpecs?.title || (lang === 'zh' ? '技术规格' : 'Technical Specifications')} 
        description={t.techSpecs?.subtitle || (lang === 'zh' ? 'SomnoAI 实验室的底层架构与遥测指标。' : 'The underlying architecture and telemetry metrics of SomnoAI Lab.')}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <HardwareWidget label={t.techSpecs?.modelVersion || "MODEL_VERSION"} value="G2.5" unit="PRO" status="active" />
          <HardwareWidget label={t.techSpecs?.latency || "LATENCY_MS"} value="120" unit="AVG" status="active" />
          <HardwareWidget label={t.techSpecs?.encryption || "ENCRYPTION"} value="AES" unit="256" status="active" />
          <HardwareWidget label={t.techSpecs?.uptime || "UPTIME"} value="99.9" unit="%" status="active" />
          <HardwareWidget label={t.techSpecs?.samplingRate || "SAMPLING_RATE"} value="1" unit="HZ" />
          <HardwareWidget label={t.techSpecs?.neuralLayers || "NEURAL_LAYERS"} value="128" unit="CORE" />
          <HardwareWidget label={t.techSpecs?.dataPoints || "DATA_POINTS"} value="1.2" unit="M/D" />
          <HardwareWidget label={t.techSpecs?.recoveryIndex || "RECOVERY_INDEX"} value="V4" unit="BETA" status="active" />
        </div>
      </Section>

      {/* Pricing Section */}
      <Section moduleID="PRIC_01" title="Pricing" description="Choose the plan that fits your needs.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card title="Go" description="Basic plan" icon={<Zap size={32} />} onClick={() => handlePlanSelect(getPaymentLink('https://buy.stripe.com/test_3cI4gyfSSc1g5v41ll6Vq01', 'go'))} label="STARTER" />
          <Card title="Pro" description="Pro plan" icon={<Zap size={32} />} onClick={() => handlePlanSelect(getPaymentLink('https://buy.stripe.com/test_bJe9AS7mmaXccXw1ll6Vq02', 'pro'))} label="MOST POPULAR" className="border-indigo-500/30 bg-indigo-500/5" />
          <Card title="Plus" description="Plus plan" icon={<Zap size={32} />} onClick={() => handlePlanSelect(getPaymentLink('https://buy.stripe.com/test_14A14mgWWfds9Lke876Vq03', 'plus'))} label="ENTERPRISE" />
        </div>
      </Section>

      {/* Who is it for? */}
      <Section 
        moduleID="USER_01"
        title={lang === 'zh' ? '为谁设计？' : 'Who is it for?'} 
        description={lang === 'zh' ? '无论您的目标是什么，SomnoAI Digital Sleep Lab 都能提供定制化的恢复策略。' : 'Whatever your goal, SomnoAI Digital Sleep Lab provides customized recovery strategies.'}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: lang === 'zh' ? '高强度运动员' : 'Elite Athletes', desc: lang === 'zh' ? '优化训练负荷，预测疲劳，并在比赛日达到最佳状态。' : 'Optimize training load, predict fatigue, and peak on race day.', icon: Activity, label: "PERFORMANCE" },
            { title: lang === 'zh' ? '知识工作者' : 'Knowledge Workers', desc: lang === 'zh' ? '最大化深度睡眠，提高白天的认知清晰度和专注力。' : 'Maximize deep sleep to improve daytime cognitive clarity and focus.', icon: Brain, label: "COGNITION" },
            { title: lang === 'zh' ? '失眠改善者' : 'Sleep Improvers', desc: lang === 'zh' ? '识别破坏睡眠的隐藏因素，建立健康的作息规律。' : 'Identify hidden factors disrupting sleep and establish healthy routines.', icon: ShieldCheck, label: "WELLNESS" }
          ].map((item, i) => (
            <Card 
              key={i}
              title={item.title}
              description={item.desc}
              icon={<item.icon size={40} strokeWidth={1.5} />}
              label={item.label}
            />
          ))}
        </div>
      </Section>

      {/* Testimonials */}
      <Section moduleID="TEST_01">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="p-12 rounded-[2.5rem] bg-slate-900/30 border border-white/5 relative group hover:border-indigo-500/20 transition-all duration-500">
              <MessageSquare size={32} className="text-indigo-500 mb-8 opacity-20 group-hover:opacity-50 transition-opacity" />
              <p className="text-2xl font-medium italic leading-relaxed mb-10 text-slate-200">"{t.quote}"</p>
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center font-black text-xl text-indigo-400 border border-indigo-500/20">
                  {t.author[0]}
                </div>
                <div>
                  <h4 className="font-bold text-lg text-white">{t.author}</h4>
                  <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Final CTA */}
      <Section className="text-center">
        <div className="space-y-12 py-12">
          <h2 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-[0.85] text-white">
            {lang === 'zh' ? '准备好' : 'Ready to'} <br />
            <span className="text-indigo-500">{lang === 'zh' ? '优化了吗？' : 'Optimize?'}</span>
          </h2>
          <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto font-medium">{lang === 'zh' ? '加入下一代睡眠工程的候补名单。' : 'Join the waitlist for the next generation of sleep engineering.'}</p>
          <button 
            onClick={() => onNavigate('/auth/signup')}
            className="group px-16 py-6 bg-white text-black rounded-full font-black text-xl uppercase tracking-widest hover:scale-105 transition-all shadow-[0_20px_60px_rgba(255,255,255,0.15)] flex items-center gap-4 mx-auto"
          >
            {lang === 'zh' ? '立即开始' : 'Get Started Now'}
            <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </Section>

      {/* Newsletter */}
      <Section>
        <div className="p-16 rounded-[4rem] bg-indigo-600/5 border border-indigo-500/10 text-center space-y-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 dashed-line opacity-10" />
          <div className="inline-block p-4 rounded-2xl bg-indigo-500/10 text-indigo-400 mb-4">
            <Mail size={40} />
          </div>
          <div className="space-y-4">
            <h3 className="text-4xl font-black uppercase tracking-tight italic text-white">{t.newsletter?.title || "Stay Updated"}</h3>
            <p className="text-xl text-slate-400 italic font-medium max-w-xl mx-auto">{t.newsletter?.subtitle || "Join our newsletter for the latest sleep science and AI updates."}</p>
          </div>
          <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto" onSubmit={(e) => { 
            e.preventDefault(); 
            const btn = e.currentTarget.querySelector('button');
            const input = e.currentTarget.querySelector('input');
            if (btn && input) {
              const originalText = btn.innerText;
              btn.disabled = true;
              btn.innerText = lang === 'zh' ? "正在订阅..." : "Subscribing...";
              
              setTimeout(() => {
                btn.innerText = lang === 'zh' ? "已订阅！" : "Subscribed!";
                btn.classList.add('bg-emerald-600');
                btn.classList.remove('bg-indigo-600');
                input.value = '';
                
                setTimeout(() => {
                  btn.innerText = originalText;
                  btn.classList.remove('bg-emerald-600');
                  btn.classList.add('bg-indigo-600');
                  btn.disabled = false;
                }, 5000);
              }, 1500);
            }
          }}>
            <input 
              type="email" 
              placeholder={t.newsletter?.placeholder || (lang === 'zh' ? "输入您的电子邮件" : "Enter your email")} 
              className="flex-1 px-8 py-5 bg-slate-900 border border-white/10 rounded-full focus:outline-none focus:border-indigo-500 transition-colors text-lg text-white placeholder-slate-600"
              required
            />
            <button type="submit" className="px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
              {t.newsletter?.button || (lang === 'zh' ? "订阅" : "Subscribe")}
            </button>
          </form>
          <div className="hardware-label opacity-30">
            {lang === 'zh' ? "您可以随时取消订阅。查看我们的隐私政策。" : "You can unsubscribe at any time. View our Privacy Policy."}
          </div>
        </div>
      </Section>
    </MarketingPageTemplate>
  );
};
