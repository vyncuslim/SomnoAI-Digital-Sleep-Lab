import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Brain, Activity, Zap, X, 
  CheckCircle2, Users, Database, ShieldCheck,
  Smartphone, BarChart3, MessageSquare, Github, Twitter, Linkedin
} from 'lucide-react';

import { GlassCard } from './GlassCard.tsx';
import { Language, getTranslation } from '../services/i18n.ts';
import { Logo } from './Logo.tsx';
import { updateMetadata } from '../services/navigation.ts';

interface LandingPageProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ lang, onLanguageChange }) => {
  const navigate = useNavigate();
  const [showBanner, setShowBanner] = useState(true);
  const t = getTranslation(lang, 'landing');

  React.useEffect(() => {
    updateMetadata(t.hero?.title || "AI-Powered Sleep Restoration", t.hero?.subtitle || "SomnoAI Digital Sleep Lab integrates physiological monitoring, AI deep insights, and health recommendations.", "/");
  }, [lang, t]);

  console.log("LandingPage rendering, lang:", lang);

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
    <div className="min-h-screen bg-[#01040a] text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden grainy-bg">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-indigo-600/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-purple-600/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-blue-600/5 blur-[200px] rounded-full" />
      </div>
      
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-indigo-600 text-white overflow-hidden relative z-50"
          >
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
              <a 
                href="https://docs.google.com/forms/d/e/1FAIpQLSf1LB5wOAUW8PioG5HiUW8MYC_a9_Rp4Eb9wjYpaQM2U9SJ4A/viewform"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
              >
                <Brain size={18} className="animate-pulse" />
                <span className="text-sm font-medium underline underline-offset-4 decoration-white/50">{t.banner || 'Join SomnoAI Digital Sleep Lab Early Access — Limited Beta Access'}</span>
              </a>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setShowBanner(false)}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-40">
        <div className="flex items-center gap-3">
          <Logo />
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/10">
            <button 
              onClick={() => onLanguageChange('en')}
              className={`px-3 py-1 rounded-full text-[10px] font-black transition-all ${lang === 'en' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
              EN
            </button>
            <button 
              onClick={() => onLanguageChange('zh')}
              className={`px-3 py-1 rounded-full text-[10px] font-black transition-all ${lang === 'zh' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
              CN
            </button>
          </div>
          <button onClick={() => navigate('/auth/signin')} className="text-sm font-medium text-slate-400 hover:text-white transition-colors hidden md:block">
            {t.nav?.enter || 'LOGIN'}
          </button>
          <button 
            onClick={() => navigate('/auth/signup')}
            className="px-5 py-2 bg-white text-black rounded-full text-sm font-bold hover:bg-slate-200 transition-colors"
          >
            {t.nav?.signup || 'JOIN NOW'}
          </button>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-32 relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none -z-10" />
          
          <div className="max-w-4xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.85] mb-8 uppercase italic"
            >
              {lang === 'zh' ? 'SomnoAI 数字' : 'SomnoAI Digital'} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{lang === 'zh' ? '睡眠实验室' : 'Sleep Lab'}</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-slate-400 max-w-2xl leading-relaxed mb-12 font-medium italic"
            >
              {lang === 'zh' ? '连接您的穿戴设备 → 获取 AI 恢复情报。上传您的睡眠数据，让我们的 AI 进行深度分析，并为您提供可执行的恢复方案。' : 'Connect your wearable → Get AI recovery intelligence. Upload your sleep data, let our AI analyze it, and wake up to actionable recovery protocols.'}
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-start gap-4"
            >
              <button 
                onClick={() => navigate('/auth/signup')}
                className="px-8 py-4 bg-indigo-600 text-white rounded-full font-bold text-lg hover:bg-indigo-500 transition-all flex items-center gap-2 group shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)]"
              >
                {t.ctaPrimary || 'Start Analysis'} <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => navigate('/about')}
                className="px-8 py-4 bg-white/5 text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all border border-white/10"
              >
                {t.ctaSecondary || 'Learn More'}
              </button>
            </motion.div>
          </div>
        </section>

        {/* Visual Evidence / Dashboard Preview */}
        <section className="max-w-7xl mx-auto px-6 py-12 relative z-20 -mt-20">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="relative rounded-3xl overflow-hidden border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-2xl"
          >
            <div className="absolute top-0 left-0 right-0 h-12 bg-black/40 border-b border-white/5 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/50" />
              <div className="w-3 h-3 rounded-full bg-amber-500/50" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
              <div className="ml-4 text-xs font-mono text-slate-500">somnoai-analysis-report.json</div>
            </div>
            <div className="p-8 pt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white">{lang === 'zh' ? '恢复评分' : 'Recovery Score'}</h3>
                    <p className="text-slate-400">{lang === 'zh' ? '基于昨晚的生物特征数据' : 'Based on last night\'s biometrics'}</p>
                  </div>
                  <div className="text-5xl font-black text-emerald-400">87</div>
                </div>
                <div className="h-40 bg-white/5 rounded-xl border border-white/5 flex items-end p-4 gap-2">
                  {/* Mock chart bars */}
                  {[40, 60, 30, 80, 90, 45, 70, 85].map((h, i) => (
                    <div key={i} className="flex-1 bg-indigo-500/50 hover:bg-indigo-400/70 transition-colors rounded-t-sm" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain size={16} className="text-indigo-400" />
                    <span className="text-sm font-bold text-indigo-400">{lang === 'zh' ? 'AI 洞察' : 'AI Insight'}</span>
                  </div>
                  <p className="text-sm text-slate-300">{lang === 'zh' ? '将室温调整至 18°C 后，您的深度睡眠增加了 15%。保持此方案以获得最佳恢复。' : 'Your deep sleep increased by 15% after adjusting room temperature to 18°C. Maintain this protocol for optimal recovery.'}</p>
                </div>
                <div className="p-4 bg-rose-500/10 rounded-xl border border-rose-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity size={16} className="text-rose-400" />
                    <span className="text-sm font-bold text-rose-400">{lang === 'zh' ? '需要采取行动' : 'Action Required'}</span>
                  </div>
                  <p className="text-sm text-slate-300">{lang === 'zh' ? '检测到静息心率升高 (68 bpm)。建议今天降低训练强度。' : 'Elevated resting heart rate detected (68 bpm). Consider reducing training intensity today.'}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Stats Section */}
        <section className="border-y border-white/5 bg-black/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-2">
                  <div className="p-3 bg-indigo-500/10 rounded-full text-indigo-400 mb-2">
                    <stat.icon size={20} />
                  </div>
                  <h3 className="text-3xl font-black tracking-tight">{stat.value}</h3>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="max-w-7xl mx-auto px-6 py-32 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="mb-24">
            <p className="micro-label mb-4">Laboratory Modules</p>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4 italic">{lang === 'zh' ? '核心能力' : 'Core Capabilities'}</h2>
            <p className="text-xl text-slate-500 max-w-xl italic font-medium">{lang === 'zh' ? '由 Gemini 2.5 Pro 模型驱动的高级遥测处理。' : 'Advanced telemetry processing powered by Gemini 2.5 Pro models.'}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { id: 'BIO', icon: Activity, title: t.features?.biometric?.title || "Biometric Tracking", desc: t.features?.biometric?.desc || "Real-time heart rate and movement analysis during sleep cycles." },
              { id: 'NEU', icon: Brain, title: t.features?.neural?.title || "Neural Insights", desc: t.features?.neural?.desc || "AI-driven interpretation of sleep stages and quality metrics." },
              { id: 'REC', icon: Zap, title: t.features?.recovery?.title || "Recovery Optimization", desc: t.features?.recovery?.desc || "Personalized protocols to enhance deep sleep and recovery." }
            ].map((item, i) => (
              <GlassCard key={i} className="p-10 rounded-[3rem] border-white/5 bg-slate-900/40 group hover:border-indigo-500/30 transition-all overflow-hidden relative">
                <div className="absolute -right-8 -top-8 w-48 h-48 bg-indigo-500/5 blur-3xl rounded-full group-hover:bg-indigo-500/10 transition-all" />
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl mb-8 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform shadow-inner">
                    <item.icon size={40} className="text-indigo-400" />
                  </div>
                  <h3 className="text-3xl font-black italic uppercase tracking-tight text-white mb-4">{item.title}</h3>
                  <p className="text-slate-400 leading-relaxed italic font-medium">{item.desc}</p>
                  <div className="mt-10 dashed-line opacity-30" />
                  <div className="mt-6 flex items-center gap-4">
                    <span className="micro-label">Module: {item.id}</span>
                    <div className="h-px flex-1 bg-white/5" />
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="py-32 bg-slate-900/20 border-y border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent opacity-50" />
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">{lang === 'zh' ? '协议流程' : 'The Protocol'}</h2>
              <p className="text-slate-400">{lang === 'zh' ? '实现全面认知恢复的四个步骤。' : 'Four steps to total cognitive restoration.'}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent -z-10" />
              
              {steps.map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-6">
                  <div className="w-24 h-24 rounded-full bg-[#01040a] border border-indigo-500/30 flex items-center justify-center shadow-[0_0_30px_-5px_rgba(79,70,229,0.3)] relative z-10">
                    <step.icon size={32} className="text-indigo-400" />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-xs font-black border-4 border-[#01040a]">
                      {step.step}
                    </div>
                  </div>
                  <div className="space-y-3 px-4">
                    <h3 className="text-xl font-bold">{step.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Supported Devices */}
        <section className="py-20 border-y border-white/5 bg-black/40">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-8">{lang === 'zh' ? '兼容主流设备' : 'Compatible with major devices'}</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Mock logos using text for now */}
              <div className="text-xl font-black tracking-tighter">Apple Watch</div>
              <div className="text-xl font-black tracking-tighter">Oura</div>
              <div className="text-xl font-black tracking-tighter">Garmin</div>
              <div className="text-xl font-black tracking-tighter">Fitbit</div>
              <div className="text-xl font-black tracking-tighter">Whoop</div>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="max-w-7xl mx-auto px-6 py-32 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="mb-24 text-center">
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4 italic">{lang === 'zh' ? '为谁设计？' : 'Who is it for?'}</h2>
            <p className="text-xl text-slate-500 max-w-xl mx-auto italic font-medium">{lang === 'zh' ? '无论您的目标是什么，SomnoAI 都能提供定制化的恢复策略。' : 'Whatever your goal, SomnoAI provides customized recovery strategies.'}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <GlassCard className="p-10 rounded-[3rem] border-white/5 bg-slate-900/40 group hover:border-indigo-500/30 transition-all overflow-hidden relative">
              <div className="absolute -right-8 -top-8 w-48 h-48 bg-indigo-500/5 blur-3xl rounded-full group-hover:bg-indigo-500/10 transition-all" />
              <div className="relative z-10">
                <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl mb-8 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform shadow-inner">
                  <Activity size={40} className="text-indigo-400" />
                </div>
                <h3 className="text-3xl font-black italic uppercase tracking-tight text-white mb-4">{lang === 'zh' ? '高强度运动员' : 'Elite Athletes'}</h3>
                <p className="text-slate-400 leading-relaxed italic font-medium">{lang === 'zh' ? '优化训练负荷，预测疲劳，并在比赛日达到最佳状态。' : 'Optimize training load, predict fatigue, and peak on race day.'}</p>
              </div>
            </GlassCard>
            <GlassCard className="p-10 rounded-[3rem] border-white/5 bg-slate-900/40 group hover:border-emerald-500/30 transition-all overflow-hidden relative">
              <div className="absolute -right-8 -top-8 w-48 h-48 bg-emerald-500/5 blur-3xl rounded-full group-hover:bg-emerald-500/10 transition-all" />
              <div className="relative z-10">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl mb-8 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform shadow-inner">
                  <Brain size={40} className="text-emerald-400" />
                </div>
                <h3 className="text-3xl font-black italic uppercase tracking-tight text-white mb-4">{lang === 'zh' ? '知识工作者' : 'Knowledge Workers'}</h3>
                <p className="text-slate-400 leading-relaxed italic font-medium">{lang === 'zh' ? '最大化深度睡眠，提高白天的认知清晰度和专注力。' : 'Maximize deep sleep to improve daytime cognitive clarity and focus.'}</p>
              </div>
            </GlassCard>
            <GlassCard className="p-10 rounded-[3rem] border-white/5 bg-slate-900/40 group hover:border-rose-500/30 transition-all overflow-hidden relative">
              <div className="absolute -right-8 -top-8 w-48 h-48 bg-rose-500/5 blur-3xl rounded-full group-hover:bg-rose-500/10 transition-all" />
              <div className="relative z-10">
                <div className="w-20 h-20 bg-rose-500/10 rounded-3xl mb-8 flex items-center justify-center border border-rose-500/20 group-hover:scale-110 transition-transform shadow-inner">
                  <ShieldCheck size={40} className="text-rose-400" />
                </div>
                <h3 className="text-3xl font-black italic uppercase tracking-tight text-white mb-4">{lang === 'zh' ? '失眠改善者' : 'Sleep Improvers'}</h3>
                <p className="text-slate-400 leading-relaxed italic font-medium">{lang === 'zh' ? '识别破坏睡眠的隐藏因素，建立健康的作息规律。' : 'Identify hidden factors disrupting sleep and establish healthy routines.'}</p>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* Testimonials */}
        <section className="max-w-7xl mx-auto px-6 py-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((t, i) => (
              <GlassCard key={i} className="p-10 rounded-[2rem] border-white/5 bg-white/[0.02]">
                <MessageSquare size={24} className="text-indigo-500 mb-6 opacity-50" />
                <p className="text-xl md:text-2xl font-medium italic leading-relaxed mb-8 text-slate-200">"{t.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center font-bold text-indigo-400">
                    {t.author[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{t.author}</h4>
                    <p className="text-xs text-slate-500 uppercase tracking-widest">{t.role}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-32 px-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-indigo-600/10 blur-[100px] pointer-events-none" />
          <div className="max-w-3xl mx-auto relative z-10 space-y-8">
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
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
        </section>
      </main>

      <footer className="border-t border-white/5 bg-black py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Logo />
            </div>
            <p className="text-sm text-slate-500 leading-relaxed italic">
              {t.footer?.mission}
            </p>
          </div>
          
          <div>
            <h4 className="font-bold uppercase tracking-widest text-xs mb-6 text-slate-400">{t.footer?.links}</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><a href="/about" className="hover:text-white transition-colors">{t.footer?.about}</a></li>
              <li><a href="/auth/signin" className="hover:text-white transition-colors">{lang === 'zh' ? '登录' : 'Login'}</a></li>
              <li><a href="/auth/signup" className="hover:text-white transition-colors">{lang === 'zh' ? '注册' : 'Sign Up'}</a></li>
              <li><a href="/science" className="hover:text-white transition-colors">{lang === 'zh' ? '科学' : 'Science'}</a></li>
              <li><a href="/blog" className="hover:text-white transition-colors">{t.blog?.title || 'Blog'}</a></li>
              <li><a href="/news" className="hover:text-white transition-colors">{t.news?.title || 'Research'}</a></li>
              <li><a href="/faq" className="hover:text-white transition-colors">{lang === 'zh' ? '常见问题' : 'FAQ'}</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">{t.support?.title || 'Contact'}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-widest text-xs mb-6 text-slate-400">{t.footer?.legal}</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><a href="/privacy" className="hover:text-white transition-colors">{t.footer?.privacy}</a></li>
              <li><a href="/terms" className="hover:text-white transition-colors">{t.footer?.terms}</a></li>
              <li><a href="/policy" className="hover:text-white transition-colors">{t.footer?.policy}</a></li>
              <li><a href="/opensource" className="hover:text-white transition-colors">{t.footer?.opensource}</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-slate-600 font-mono">© 2026 SOMNOAI DIGITAL SLEEP LAB. {t.footer?.rights}.</p>
          <div className="flex items-center gap-6 text-slate-600">
            <a href="#" className="hover:text-white transition-colors"><Github size={18} /></a>
            <a href="#" className="hover:text-white transition-colors"><Twitter size={18} /></a>
            <a href="#" className="hover:text-white transition-colors"><Linkedin size={18} /></a>
          </div>
        </div>
      </footer>
    </div>
  );
};
