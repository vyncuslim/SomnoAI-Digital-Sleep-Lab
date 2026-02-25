import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Brain, Activity, Zap, X } from 'lucide-react';
import { Logo } from './Logo.tsx';
import { GlassCard } from './GlassCard.tsx';

const m = motion as any;

export const LandingPage: React.FC<any> = () => {
  const navigate = useNavigate();
  const [showBanner, setShowBanner] = useState(true);

  return (
    <div className="min-h-screen bg-[#01040a] text-white font-sans selection:bg-indigo-500/30">
      <AnimatePresence>
        {showBanner && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-indigo-600 text-white overflow-hidden relative"
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

      <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo size={32} />
          <span className="font-bold text-xl tracking-tight">SomnoAI</span>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/auth')} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
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

      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="max-w-4xl">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
            DIGITAL <br />
            <span className="text-indigo-500">SLEEP LAB</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl leading-relaxed mb-12">
            Integrating physiological monitoring, AI deep insights, and health recommendations to provide users with a comprehensive digital sleep laboratory experience.
          </p>
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <button 
              onClick={() => navigate('/auth')}
              className="px-8 py-4 bg-indigo-600 text-white rounded-full font-bold text-lg hover:bg-indigo-500 transition-all flex items-center gap-2 group"
            >
              Start Analysis <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => navigate('/about')}
              className="px-8 py-4 bg-white/5 text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all border border-white/10"
            >
              Learn More
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32">
          {[
            { icon: Activity, title: "Biometric Tracking", desc: "Real-time heart rate and movement analysis during sleep cycles." },
            { icon: Brain, title: "Neural Insights", desc: "AI-driven interpretation of sleep stages and quality metrics." },
            { icon: Zap, title: "Recovery Optimization", desc: "Personalized protocols to enhance deep sleep and recovery." }
          ].map((item, i) => (
            <GlassCard key={i} className="p-8 hover:bg-white/[0.07] transition-colors group">
              <item.icon className="text-indigo-500 mb-6 group-hover:scale-110 transition-transform" size={32} />
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-slate-400 leading-relaxed">{item.desc}</p>
            </GlassCard>
          ))}
        </div>
      </main>
    </div>
  );
};
