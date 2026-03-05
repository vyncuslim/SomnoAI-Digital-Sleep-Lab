import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Brain, Activity, Zap, 
  CheckCircle2, Users, Database, ShieldCheck,
  Smartphone, BarChart3, MessageSquare, Heart
} from 'lucide-react';

import { MarketingPageTemplate } from './ui/MarketingPageTemplate';
import { Section, Card, InlineCTA } from './ui/Components';
import { Language, getTranslation } from '../services/i18n';
import { useAuth } from '../context/AuthContext';

interface LandingPageProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ lang }) => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const t = getTranslation(lang, 'landing');

  const stats = [
    { label: t.stats?.analyzed || "Hours Analyzed", value: "10M+", icon: Database },
    { label: t.stats?.accuracy || "Sleep Accuracy", value: "98.4%", icon: CheckCircle2 },
    { label: t.stats?.users || "Active Users", value: "50k+", icon: Users },
    { label: t.stats?.encrypted || "Data Encrypted", value: "100%", icon: ShieldCheck },
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
              className="text-indigo-400 font-bold uppercase tracking-widest text-sm mb-2"
            >
              {lang === 'zh' ? '欢迎回来,' : 'Welcome back,'} {profile?.email || user.email}
            </motion.p>
          )}
          <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter text-white">
            DIGITAL SLEEP LAB <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
              AI ANALYSIS
            </span>
          </h1>
        </div>
      }
      subtitle={t.heroSubtitle || "Connect your wearable → Get AI recovery intelligence. Upload your sleep data, let our AI analyze it, and wake up to actionable recovery protocols."}
      ctaPrimary={{ text: t.ctaPrimary || "Start Analysis", link: "/auth/signup" }}
      ctaSecondary={{ text: t.ctaSecondary || "Learn More", link: "/about" }}
    >
      {/* Visual Report Preview */}
      <Section className="py-12">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 p-4 shadow-2xl shadow-indigo-500/10">
          <div className="bg-slate-950 rounded-2xl p-6 border border-white/5">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Recovery Score</h3>
              <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">87</div>
            </div>
            <div className="h-48 bg-gradient-to-r from-indigo-900/20 to-purple-900/20 rounded-xl flex items-center justify-center text-slate-500 italic">
              [Report Visualization]
            </div>
          </div>
        </div>
      </Section>
      {/* Stats Section */}
      <Section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-2">
              <div className="p-3 bg-indigo-500/10 rounded-full text-indigo-400 mb-2">
                <stat.icon size={20} />
              </div>
              <h3 className="text-3xl font-black tracking-tight text-white">{stat.value}</h3>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Core Capabilities */}
      <Section 
        title={lang === 'zh' ? '核心能力' : 'Core Capabilities'} 
        description={lang === 'zh' ? '由 Gemini 2.5 Pro 模型驱动的高级遥测处理。' : 'Advanced telemetry processing powered by Gemini 2.5 Pro models.'}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Activity, title: t.features?.biometric?.title || "Biometric Tracking", desc: t.features?.biometric?.desc || "Real-time heart rate and movement analysis during sleep cycles." },
            { icon: Brain, title: t.features?.neural?.title || "Neural Insights", desc: t.features?.neural?.desc || "AI-driven interpretation of sleep stages and quality metrics." },
            { icon: Zap, title: t.features?.recovery?.title || "Recovery Optimization", desc: t.features?.recovery?.desc || "Personalized protocols to enhance deep sleep and recovery." }
          ].map((item, i) => (
            <Card 
              key={i}
              title={item.title}
              description={item.desc}
              icon={<item.icon size={32} />}
            />
          ))}
        </div>
      </Section>

      {/* The Protocol */}
      <Section 
        title={lang === 'zh' ? '协议流程' : 'The Protocol'} 
        description={lang === 'zh' ? '实现全面认知恢复的四个步骤。' : 'Four steps to total cognitive restoration.'}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Activity, title: t.features?.biometric?.title || "Biometric Tracking", desc: t.features?.biometric?.desc || "Real-time heart rate and movement analysis during sleep cycles." },
            { icon: Brain, title: t.features?.neural?.title || "Neural Insights", desc: t.features?.neural?.desc || "AI-driven interpretation of sleep stages and quality metrics." },
            { icon: Zap, title: t.features?.recovery?.title || "Recovery Optimization", desc: t.features?.recovery?.desc || "Personalized protocols to enhance deep sleep and recovery." }
          ].map((item, i) => (
            <Card 
              key={i}
              title={item.title}
              description={item.desc}
              icon={<item.icon size={40} strokeWidth={1.5} />}
            />
          ))}
        </div>
      </Section>

      {/* Who is it for? */}
      <Section 
        title={lang === 'zh' ? '为谁设计？' : 'Who is it for?'} 
        description={lang === 'zh' ? '无论您的目标是什么，Digital Sleep Lab 都能提供定制化的恢复策略。' : 'Whatever your goal, Digital Sleep Lab provides customized recovery strategies.'}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: lang === 'zh' ? '高强度运动员' : 'Elite Athletes', desc: lang === 'zh' ? '优化训练负荷，预测疲劳，并在比赛日达到最佳状态。' : 'Optimize training load, predict fatigue, and peak on race day.', icon: Activity },
            { title: lang === 'zh' ? '知识工作者' : 'Knowledge Workers', desc: lang === 'zh' ? '最大化深度睡眠，提高白天的认知清晰度和专注力。' : 'Maximize deep sleep to improve daytime cognitive clarity and focus.', icon: Brain },
            { title: lang === 'zh' ? '失眠改善者' : 'Sleep Improvers', desc: lang === 'zh' ? '识别破坏睡眠的隐藏因素，建立健康的作息规律。' : 'Identify hidden factors disrupting sleep and establish healthy routines.', icon: ShieldCheck }
          ].map((item, i) => (
            <Card 
              key={i}
              title={item.title}
              description={item.desc}
              icon={<item.icon size={40} strokeWidth={1.5} />}
            />
          ))}
        </div>
      </Section>

      {/* Testimonials */}
      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="p-10 rounded-3xl bg-slate-900/30 border border-white/5 relative">
              <MessageSquare size={24} className="text-indigo-500 mb-6 opacity-50" />
              <p className="text-xl font-medium italic leading-relaxed mb-8 text-slate-200">"{t.quote}"</p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center font-bold text-indigo-400">
                  {t.author[0]}
                </div>
                <div>
                  <h4 className="font-bold text-white">{t.author}</h4>
                  <p className="text-xs text-slate-500 uppercase tracking-widest">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Founder Section */}
      <Section>
        <div className="p-12 rounded-[3rem] border border-white/10 bg-slate-900/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="w-40 h-40 rounded-full bg-slate-800 border-4 border-indigo-500/30 flex items-center justify-center overflow-hidden shadow-2xl shrink-0">
              <span className="text-4xl font-black text-indigo-500 italic">VL</span>
            </div>
            <div className="flex-1 space-y-6 text-center md:text-left">
              <div>
                <p className="text-indigo-400 font-bold uppercase tracking-widest text-xs mb-2">{t.founder?.subtitle || "Visionary Leadership"}</p>
                <h2 className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter">{t.founder?.title || "Meet the Founder"}</h2>
              </div>
              <p className="text-lg text-slate-400 leading-relaxed max-w-2xl italic font-medium">
                {lang === 'zh' 
                  ? 'Digital Sleep Lab 由 Vyncus Lim 创立，旨在通过 AI 解码人类睡眠的复杂性。' 
                  : 'Founded by Vyncus Lim, Digital Sleep Lab is driven by a mission to decode the complexities of human sleep through artificial intelligence.'}
              </p>
              <InlineCTA text={t.founder?.readMore || "Read Founder's Vision"} link="/founder" />
            </div>
          </div>
        </div>
      </Section>

      {/* Newsletter */}
      <Section>
        <div className="p-12 rounded-[3rem] bg-indigo-600/5 border border-indigo-500/10 text-center space-y-8">
          <h3 className="text-3xl font-black uppercase tracking-tight italic text-white">{t.newsletter?.title || "Stay Updated"}</h3>
          <p className="text-slate-400 italic font-medium max-w-xl mx-auto">{t.newsletter?.subtitle || "Join our newsletter for the latest sleep science and AI updates."}</p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={(e) => { 
            e.preventDefault(); 
            const btn = e.currentTarget.querySelector('button');
            if (btn) {
              const originalText = btn.innerText;
              btn.innerText = "Subscribed!";
              btn.classList.add('bg-emerald-600');
              btn.classList.remove('bg-indigo-600');
              setTimeout(() => {
                btn.innerText = originalText;
                btn.classList.remove('bg-emerald-600');
                btn.classList.add('bg-indigo-600');
                (e.target as HTMLFormElement).reset();
              }, 3000);
            }
          }}>
            <input 
              type="email" 
              placeholder={t.newsletter?.placeholder || "Enter your email"} 
              className="flex-1 px-6 py-4 bg-slate-900 border border-white/10 rounded-full focus:outline-none focus:border-indigo-500 transition-colors text-sm text-white placeholder-slate-600"
              required
            />
            <button type="submit" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20">
              {t.newsletter?.button || "Subscribe"}
            </button>
          </form>
        </div>
      </Section>

      {/* Final CTA */}
      <Section className="text-center">
        <div className="space-y-8">
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-white">
            {lang === 'zh' ? '准备好' : 'Ready to'} <br />
            <span className="text-indigo-500">{lang === 'zh' ? '优化了吗？' : 'Optimize?'}</span>
          </h2>
          <p className="text-xl text-slate-400">{lang === 'zh' ? '加入下一代睡眠工程的候补名单。' : 'Join the waitlist for the next generation of sleep engineering.'}</p>
          <button 
            onClick={() => navigate('/auth/signup')}
            className="px-12 py-5 bg-white text-black rounded-full font-black text-lg uppercase tracking-widest hover:scale-105 transition-transform shadow-2xl"
          >
            {lang === 'zh' ? '立即开始' : 'Get Started Now'}
          </button>
        </div>
      </Section>
    </MarketingPageTemplate>
  );
};
