import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Brain, Activity, Zap, X, 
  CheckCircle2, Users, Database, ShieldCheck,
  Smartphone, BarChart3, MessageSquare, Github, Twitter, Linkedin
} from 'lucide-react';
import { Logo } from './Logo.tsx';
import { GlassCard } from './GlassCard.tsx';
import { Language, getTranslation } from '../services/i18n.ts';

interface LandingPageProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ lang, onLanguageChange }) => {
  const navigate = useNavigate();
  const [showBanner, setShowBanner] = useState(true);
  const t = getTranslation(lang, 'landing');

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
      title: t.protocol?.step1?.title || "Connect Device", 
      desc: t.protocol?.step1?.desc || "Sync with Apple Health, Google Fit, or Oura Ring in seconds.",
      icon: Smartphone 
    },
    { 
      step: "02", 
      title: t.protocol?.step2?.title || "Neural Analysis", 
      desc: t.protocol?.step2?.desc || "Our AI engine processes 50+ biometric markers during your sleep.",
      icon: Brain 
    },
    { 
      step: "03", 
      title: t.protocol?.step3?.title || "Receive Insights", 
      desc: t.protocol?.step3?.desc || "Wake up to actionable recovery protocols and energy forecasts.",
      icon: BarChart3 
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
    <div className="min-h-screen bg-[#01040a] text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Debug Indicator */}
      <div className="fixed top-0 left-0 w-1 h-1 bg-indigo-500 z-[9999] opacity-50 pointer-events-none" />
      
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
          <motion.div
            whileHover={{ rotate: 15 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Logo size={32} />
          </motion.div>
          <span className="font-bold text-xl tracking-tight">SomnoAI Digital Sleep Lab</span>
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
          <button onClick={() => navigate('/auth')} className="text-sm font-medium text-slate-400 hover:text-white transition-colors hidden md:block">
            {t.nav?.enter || 'LOGIN'}
          </button>
          <button 
            onClick={() => navigate('/auth')}
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
              className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8"
            >
              {lang === 'zh' ? '数字' : 'DIGITAL'} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{t.heroTitle || 'SLEEP LAB'}</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-slate-400 max-w-2xl leading-relaxed mb-12"
            >
              {t.heroSubtitle}
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-start gap-4"
            >
              <button 
                onClick={() => navigate('/auth')}
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
        <section className="max-w-7xl mx-auto px-6 py-32">
          <div className="mb-16">
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">{lang === 'zh' ? '核心能力' : 'Core Capabilities'}</h2>
            <p className="text-slate-400 max-w-xl">{lang === 'zh' ? '由 Gemini 2.5 Pro 模型驱动的高级遥测处理。' : 'Advanced telemetry processing powered by Gemini 2.5 Pro models.'}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Activity, title: t.features?.biometric?.title || "Biometric Tracking", desc: t.features?.biometric?.desc || "Real-time heart rate and movement analysis during sleep cycles." },
              { icon: Brain, title: t.features?.neural?.title || "Neural Insights", desc: t.features?.neural?.desc || "AI-driven interpretation of sleep stages and quality metrics." },
              { icon: Zap, title: t.features?.recovery?.title || "Recovery Optimization", desc: t.features?.recovery?.desc || "Personalized protocols to enhance deep sleep and recovery." }
            ].map((item, i) => (
              <GlassCard key={i} className="p-8 hover:bg-white/[0.07] transition-colors group border-white/10">
                <item.icon className="text-indigo-500 mb-6 group-hover:scale-110 transition-transform" size={32} />
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed">{item.desc}</p>
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
              <p className="text-slate-400">{lang === 'zh' ? '实现全面认知恢复的三个步骤。' : 'Three steps to total cognitive restoration.'}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
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
              onClick={() => navigate('/auth')}
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
              <Logo size={24} />
              <span className="font-bold text-lg tracking-tight">SomnoAI Digital Sleep Lab</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed italic">
              {t.footer?.mission}
            </p>
          </div>
          
          <div>
            <h4 className="font-bold uppercase tracking-widest text-xs mb-6 text-slate-400">{t.footer?.links}</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><a href="/about" className="hover:text-white transition-colors">{t.footer?.about}</a></li>
              <li><a href="/blog" className="hover:text-white transition-colors">{t.blog?.title || 'Blog'}</a></li>
              <li><a href="/news" className="hover:text-white transition-colors">{t.news?.title || 'Research'}</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">{t.support?.title || 'Contact'}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-widest text-xs mb-6 text-slate-400">{t.footer?.legal}</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><a href="/privacy" className="hover:text-white transition-colors">{t.footer?.privacy}</a></li>
              <li><a href="/terms" className="hover:text-white transition-colors">{t.footer?.terms}</a></li>
              <li><a href="/opensource" className="hover:text-white transition-colors">{t.footer?.opensource}</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-slate-600 font-mono">© 2026 SOMNO DIGITAL LABS. {t.footer?.rights}.</p>
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
