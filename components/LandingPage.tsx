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

const m = motion as any;

export const LandingPage: React.FC<any> = () => {
  const navigate = useNavigate();
  const [showBanner, setShowBanner] = useState(true);

  const stats = [
    { label: "Hours Analyzed", value: "10M+", icon: Database },
    { label: "Sleep Accuracy", value: "98.4%", icon: CheckCircle2 },
    { label: "Active Users", value: "50k+", icon: Users },
    { label: "Data Encrypted", value: "100%", icon: ShieldCheck },
  ];

  const steps = [
    { 
      step: "01", 
      title: "Connect Device", 
      desc: "Sync with Apple Health, Google Fit, or Oura Ring in seconds.",
      icon: Smartphone 
    },
    { 
      step: "02", 
      title: "Neural Analysis", 
      desc: "Our AI engine processes 50+ biometric markers during your sleep.",
      icon: Brain 
    },
    { 
      step: "03", 
      title: "Receive Insights", 
      desc: "Wake up to actionable recovery protocols and energy forecasts.",
      icon: BarChart3 
    }
  ];

  const testimonials = [
    {
      quote: "The depth of analysis is unlike anything I've seen. It's not just tracking; it's actual coaching.",
      author: "Dr. Sarah Chen",
      role: "Neuroscientist"
    },
    {
      quote: "Finally, a sleep app that tells me *why* I'm tired, not just *that* I'm tired.",
      author: "Marcus Thorne",
      role: "Elite Athlete"
    }
  ];

  return (
    <div className="min-h-screen bg-[#01040a] text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      <AnimatePresence>
        {showBanner && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-indigo-600 text-white overflow-hidden relative z-50"
          >
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Brain size={18} className="animate-pulse" />
                <span className="text-sm font-medium">Join SomnoAI Early Access — Limited Beta Access</span>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => navigate('/auth')}
                  className="px-4 py-1 bg-white text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-indigo-50 transition-colors"
                >
                  Apply Now
                </button>
                <button 
                  onClick={() => setShowBanner(false)}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-40">
        <div className="flex items-center gap-3">
          <Logo size={32} />
          <span className="font-bold text-xl tracking-tight">SomnoAI</span>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/auth')} className="text-sm font-medium text-slate-400 hover:text-white transition-colors hidden md:block">
            LOGIN
          </button>
          <button 
            onClick={() => navigate('/auth')}
            className="px-5 py-2 bg-white text-black rounded-full text-sm font-bold hover:bg-slate-200 transition-colors"
          >
            JOIN NOW
          </button>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-32 relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none -z-10" />
          
          <div className="max-w-4xl">
            <m.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8"
            >
              DIGITAL <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">SLEEP LAB</span>
            </m.h1>
            <m.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-slate-400 max-w-2xl leading-relaxed mb-12"
            >
              Integrating physiological monitoring, AI deep insights, and health recommendations to provide users with a comprehensive digital sleep laboratory experience.
            </m.p>
            <m.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-start gap-4"
            >
              <button 
                onClick={() => navigate('/auth')}
                className="px-8 py-4 bg-indigo-600 text-white rounded-full font-bold text-lg hover:bg-indigo-500 transition-all flex items-center gap-2 group shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)]"
              >
                Start Analysis <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => navigate('/about')}
                className="px-8 py-4 bg-white/5 text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all border border-white/10"
              >
                Learn More
              </button>
            </m.div>
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
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">Core Capabilities</h2>
            <p className="text-slate-400 max-w-xl">Advanced telemetry processing powered by Gemini 2.5 Pro models.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Activity, title: "Biometric Tracking", desc: "Real-time heart rate and movement analysis during sleep cycles." },
              { icon: Brain, title: "Neural Insights", desc: "AI-driven interpretation of sleep stages and quality metrics." },
              { icon: Zap, title: "Recovery Optimization", desc: "Personalized protocols to enhance deep sleep and recovery." }
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
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">The Protocol</h2>
              <p className="text-slate-400">Three steps to total cognitive restoration.</p>
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
              Ready to <br />
              <span className="text-indigo-500">Optimize?</span>
            </h2>
            <p className="text-xl text-slate-400">Join the waitlist for the next generation of sleep engineering.</p>
            <button 
              onClick={() => navigate('/auth')}
              className="px-12 py-5 bg-white text-black rounded-full font-black text-lg uppercase tracking-widest hover:scale-105 transition-transform shadow-2xl"
            >
              Get Started Now
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 bg-black py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Logo size={24} />
              <span className="font-bold text-lg tracking-tight">SomnoAI</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Pioneering the future of digital sleep medicine through artificial intelligence and biological telemetry.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold uppercase tracking-widest text-xs mb-6 text-slate-400">Platform</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API Access</a></li>
              <li><a href="/changelog" className="hover:text-white transition-colors">Changelog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-widest text-xs mb-6 text-slate-400">Company</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
              <li><a href="/blog" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="/news" className="hover:text-white transition-colors">Research</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-widest text-xs mb-6 text-slate-400">Legal</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="/opensource" className="hover:text-white transition-colors">Open Source</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-slate-600 font-mono">© 2026 SOMNO DIGITAL LABS. ALL RIGHTS RESERVED.</p>
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
