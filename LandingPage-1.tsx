import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Zap, ShieldCheck, Activity,
  ArrowRight, Sparkles,
  Menu, X, Globe, Mail, Github, Linkedin,
  Cpu, BrainCircuit, Command,
  LogIn, Target, Moon, Heart, BarChart3,
  Clock, Users, Award, Star, ChevronRight,
  Smartphone, Lock, TrendingUp, Waves,
  ArrowUpRight, Play, CheckCircle2
} from 'lucide-react';
import { Logo } from './components/Logo.tsx';
import { Language, translations } from './services/i18n.ts';
import { GlassCard } from './components/GlassCard.tsx';

const m = motion as any;

interface LandingPageProps {
  lang: Language | string;
  onNavigate: (view: string) => void;
}

/* ─────────────────────────────────────────────
   ANIMATED COUNTER HOOK
   ───────────────────────────────────────────── */
const useCounter = (end: number, duration: number = 2000, startOnView: boolean = true) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref as any, { once: true });

  useEffect(() => {
    if (!startOnView || isInView) {
      let startTime: number | null = null;
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(eased * end));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }
  }, [isInView, end, duration, startOnView]);

  return { count, ref };
};

/* ─────────────────────────────────────────────
   FLOATING PARTICLES
   ───────────────────────────────────────────── */
const FloatingParticles = () => {
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 10,
    opacity: Math.random() * 0.4 + 0.1,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <m.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            background: p.id % 3 === 0 ? '#6366f1' : p.id % 3 === 1 ? '#818cf8' : '#a5b4fc',
          }}
          animate={{
            y: [0, -80, 0],
            x: [0, Math.random() * 40 - 20, 0],
            opacity: [p.opacity, p.opacity * 2, p.opacity],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────
   BACKGROUND EFFECTS
   ───────────────────────────────────────────── */
const BackgroundEffects = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden bg-[#01040a] z-0">
    {/* Aurora Gradient 1 */}
    <m.div
      animate={{
        scale: [1, 1.3, 1],
        opacity: [0.12, 0.25, 0.12],
        x: ['-15%', '10%', '-15%'],
        y: ['-10%', '15%', '-10%']
      }}
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      className="absolute top-[-30%] left-[-20%] w-[140vw] h-[100vh] bg-indigo-600/15 blur-[200px] rounded-full"
    />
    {/* Aurora Gradient 2 */}
    <m.div
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.06, 0.15, 0.06],
        x: ['15%', '-10%', '15%'],
        y: ['15%', '-15%', '15%']
      }}
      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      className="absolute bottom-[-25%] right-[-15%] w-[120vw] h-[90vh] bg-violet-600/10 blur-[250px] rounded-full"
    />
    {/* Aurora Gradient 3 - Cyan accent */}
    <m.div
      animate={{
        scale: [1, 1.4, 1],
        opacity: [0.04, 0.1, 0.04],
        rotate: [0, 45, 0]
      }}
      transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
      className="absolute top-[20%] right-[-5%] w-[60vw] h-[60vh] bg-cyan-600/8 blur-[180px] rounded-full"
    />

    {/* Noise Texture */}
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay" />

    {/* Dot Grid */}
    <div className="absolute inset-0 opacity-[0.03]"
      style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

    <FloatingParticles />
  </div>
);

/* ─────────────────────────────────────────────
   SECTION HEADER COMPONENT
   ───────────────────────────────────────────── */
const SectionHeader = ({ tag, title, accent, subtitle }: { tag: string; title: string; accent: string; subtitle: string }) => (
  <m.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8 }}
    className="text-center space-y-6 mb-24"
  >
    <div className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-500/5 border border-indigo-500/15 rounded-full">
      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
      <span className="text-[9px] font-black uppercase tracking-[0.5em] text-indigo-400 italic">{tag}</span>
    </div>
    <h2 className="text-5xl md:text-8xl font-black italic text-white uppercase tracking-tighter leading-[0.9]">
      {title} <span className="text-indigo-500">{accent}</span>
    </h2>
    <p className="text-lg md:text-xl text-slate-500 font-medium italic max-w-3xl mx-auto leading-relaxed">{subtitle}</p>
  </m.div>
);

/* ─────────────────────────────────────────────
   MAIN LANDING PAGE
   ───────────────────────────────────────────── */
export const LandingPage: React.FC<LandingPageProps> = ({ lang, onNavigate }) => {
  const currentLang = (lang || 'en') as Language;
  const isZh = currentLang === 'zh';

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: isZh ? '科学协议' : 'SCIENCE', view: 'science' },
    { label: isZh ? '实验室 FAQ' : 'FAQ', view: 'faq' },
    { label: isZh ? '关于项目' : 'ABOUT', view: 'about' },
    { label: isZh ? '技术支持' : 'SUPPORT', view: 'support' },
  ];

  const stat1 = useCounter(98, 2200);
  const stat2 = useCounter(50, 2400);
  const stat3 = useCounter(24, 1800);
  const stat4 = useCounter(4, 2000);

  return (
    <div className="min-h-screen bg-[#01040a] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden relative flex flex-col">
      <BackgroundEffects />

      {/* ═══════════════════════════════════════════
          NAVIGATION
          ═══════════════════════════════════════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 px-6 md:px-12 ${scrolled ? 'bg-[#01040a]/85 backdrop-blur-2xl py-4 border-b border-white/5 shadow-[0_10px_40px_rgba(0,0,0,0.5)]' : 'py-7'}`}>
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <Logo size={42} animated={true} />
            <div className="flex flex-col text-left">
              <span className="text-xl font-black italic tracking-tighter uppercase leading-none text-white group-hover:text-indigo-400 transition-colors">Somno<span className="text-indigo-400">AI</span></span>
              <span className="text-[7px] font-black uppercase tracking-[0.5em] text-slate-600 mt-0.5">{isZh ? '数字化睡眠实验室' : 'Digital Sleep Lab'}</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <button
                key={link.view}
                onClick={() => onNavigate(link.view)}
                className="text-[10px] font-bold text-slate-500 hover:text-white transition-all tracking-[0.2em] uppercase relative group/nav py-2"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-px bg-indigo-500 group-hover/nav:w-full transition-all duration-300" />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <m.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate('login')}
              className="hidden sm:flex px-8 py-3 bg-white/[0.04] border border-white/10 text-white rounded-full text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-white/[0.08] hover:border-white/20 transition-all items-center gap-2.5"
            >
              <LogIn size={13} /> {isZh ? '登录' : 'Sign In'}
            </m.button>
            <m.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate('signup')}
              className="hidden sm:flex px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-[10px] font-bold uppercase tracking-[0.15em] transition-all items-center gap-2.5 shadow-[0_8px_30px_rgba(99,102,241,0.3)]"
            >
              {isZh ? '免费试用' : 'Get Started'} <ArrowRight size={13} />
            </m.button>
            <button className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(true)}><Menu size={26} /></button>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════ */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center pt-24 pb-20">
        <m.div
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-6xl space-y-10"
        >
          {/* Status Badge */}
          <m.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.6 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 bg-indigo-600/[0.06] border border-indigo-500/20 rounded-full"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_12px_rgba(52,211,153,0.6)]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-indigo-300">{isZh ? '神经智能引擎 v2.8 已激活' : 'Neural Intelligence Engine v2.8 • Active'}</span>
          </m.div>

          {/* Main Headline */}
          <m.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }}
            className="hero-title text-6xl sm:text-8xl md:text-[10rem] lg:text-[13rem] font-black italic tracking-[-0.06em] text-white uppercase leading-[0.82] select-none"
          >
            {isZh ? '工程级' : 'ENGINEER'} <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-500 bg-clip-text text-transparent">{isZh ? '恢复方案' : 'RECOVERY'}</span>
          </m.h1>

          {/* Subtitle */}
          <m.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.8 }}
            className="text-lg md:text-2xl text-slate-400 font-medium max-w-3xl mx-auto leading-relaxed"
          >
            {isZh
              ? "融合生理监测与 Google Gemini AI 深度分析，为您提供全方位数字化睡眠实验室体验。"
              : "Advanced sleep architecture analysis powered by Google Gemini AI. Integrate wearable telemetry to reconstruct your restoration window and optimize human performance."}
          </m.p>

          {/* CTA Buttons */}
          <m.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4"
          >
            <m.button
              whileHover={{ scale: 1.04, y: -3 }} whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('signup')}
              className="group px-12 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-sm uppercase tracking-[0.2em] shadow-[0_20px_60px_rgba(79,70,229,0.35)] transition-all flex items-center justify-center gap-3"
            >
              {isZh ? '开始优化' : 'Start Optimization'}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </m.button>
            <button
              onClick={() => onNavigate('login')}
              className="group px-12 py-5 bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-white/15 text-slate-300 rounded-2xl font-bold text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3"
            >
              <Command size={16} className="text-indigo-400" /> {isZh ? '访问终端' : 'Access Terminal'}
            </button>
          </m.div>

          {/* Trust Chips */}
          <m.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-8 pt-12 opacity-40"
          >
            {[
              { icon: Sparkles, label: isZh ? 'Gemini 驱动' : 'Built with Gemini' },
              { icon: ShieldCheck, label: isZh ? '隐私优先' : 'Privacy First' },
              { icon: Cpu, label: isZh ? '边缘计算' : 'Edge Computing' },
              { icon: Lock, label: isZh ? '端到端加密' : 'E2E Encrypted' }
            ].map((pill, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <pill.icon size={14} />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{pill.label}</span>
              </div>
            ))}
          </m.div>
        </m.div>

        {/* Scroll indicator */}
        <m.div
          initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 2 }}
          className="absolute bottom-10"
        >
          <m.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2">
              <div className="w-1 h-2.5 bg-white/40 rounded-full" />
            </div>
          </m.div>
        </m.div>
      </section>

      {/* ═══════════════════════════════════════════
          STATS BAR
          ═══════════════════════════════════════════ */}
      <section className="relative z-10 py-16 px-6 border-y border-white/[0.04]">
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {[
            { ref: stat1.ref, value: `${stat1.count}%`, label: isZh ? '分析准确率' : 'Analysis Accuracy', icon: Target },
            { ref: stat2.ref, value: `${stat2.count}K+`, label: isZh ? '睡眠分析报告' : 'Sleep Reports', icon: BarChart3 },
            { ref: stat3.ref, value: `${stat3.count}/7`, label: isZh ? '全天候监控' : 'Always On', icon: Clock },
            { ref: stat4.ref, value: `${stat4.count}.9`, label: isZh ? '用户评分' : 'User Rating', icon: Star },
          ].map((stat, i) => (
            <m.div
              key={i}
              ref={stat.ref}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="text-center space-y-3 group"
            >
              <div className="flex items-center justify-center gap-3">
                <stat.icon size={18} className="text-indigo-500 opacity-60" />
                <span className="text-3xl md:text-5xl font-black italic text-white tracking-tighter">{stat.value}</span>
              </div>
              <p className="text-[10px] md:text-xs font-bold text-slate-600 uppercase tracking-[0.3em]">{stat.label}</p>
            </m.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PROTOCOL SECTION
          ═══════════════════════════════════════════ */}
      <section className="py-32 md:py-48 px-6 relative z-10">
        <div className="max-w-[1300px] mx-auto">
          <SectionHeader
            tag={isZh ? '工作流程' : 'How It Works'}
            title={isZh ? '实验' : 'THE'}
            accent={isZh ? '协议' : 'PROTOCOL'}
            subtitle={isZh ? '三步流程，将原始穿戴设备数据转化为可执行的恢复方案。' : 'Three-step pipeline transforming raw wearable data into actionable recovery protocols.'}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              { id: '01', title: isZh ? '遥测接入' : 'Telemetry Ingress', icon: Activity, desc: isZh ? '通过安全加密的 Health Connect 网关同步原始穿戴设备生理指标，保护您的每一项数据。' : 'Sync raw wearable physiological metrics via secure encrypted Health Connect gateway. Your data stays protected.', color: 'from-indigo-500 to-violet-600' },
              { id: '02', title: isZh ? '神经合成分析' : 'Neural Synthesis', icon: BrainCircuit, desc: isZh ? '利用 Google Gemini AI 大模型深度解构您的睡眠架构，提供专业级洞察。' : 'Leverage Google Gemini AI models to decode and reconstruct your complete sleep architecture with clinical-grade insights.', color: 'from-violet-500 to-purple-600' },
              { id: '03', title: isZh ? '精准恢复协议' : 'Precision Protocol', icon: Target, desc: isZh ? '接收量身定制的个性化实验方案，科学提升恢复质量与人体表现。' : 'Receive tailored experimental protocols scientifically designed to enhance recovery quality and peak human performance.', color: 'from-purple-500 to-pink-600' }
            ].map((step, i) => (
              <m.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.7 }}
              >
                <GlassCard className="p-10 md:p-12 rounded-[3rem] border-white/[0.04] hover:border-indigo-500/20 transition-all duration-700 h-full group" intensity={1}>
                  <div className="flex justify-between items-start mb-12">
                    <div className={`p-5 bg-gradient-to-br ${step.color} rounded-2xl text-white shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-500`}>
                      <step.icon size={28} />
                    </div>
                    <span className="text-5xl font-black italic text-white/[0.04] group-hover:text-indigo-500/20 transition-colors duration-500 select-none">{step.id}</span>
                  </div>
                  <h3 className="text-2xl font-black italic text-white uppercase tracking-tight mb-5 leading-none">{step.title}</h3>
                  <p className="text-slate-500 text-base leading-relaxed font-medium">{step.desc}</p>
                </GlassCard>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          WHY SOMNOAI - FEATURES GRID
          ═══════════════════════════════════════════ */}
      <section className="py-32 md:py-40 px-6 relative z-10">
        <div className="max-w-[1300px] mx-auto">
          <SectionHeader
            tag={isZh ? '核心优势' : 'Core Advantages'}
            title={isZh ? '为什么选择' : 'WHY'}
            accent="SOMNOAI"
            subtitle={isZh ? '融合尖端 AI 技术与临床级睡眠科学，重新定义数字化睡眠实验室。' : 'Cutting-edge AI meets clinical sleep science. Redefining the digital sleep laboratory experience.'}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: BrainCircuit, title: isZh ? 'Gemini AI 引擎' : 'Gemini AI Engine', desc: isZh ? '由 Google 最先进的 AI 模型驱动，提供深度睡眠架构分析。' : 'Powered by Google\'s most advanced AI model for deep sleep architecture analysis.' },
              { icon: ShieldCheck, title: isZh ? '隐私安全架构' : 'Privacy by Design', desc: isZh ? '端到端加密，数据仅存储在您的设备上，完全可控。' : 'End-to-end encryption. Your data stays on your device, fully under your control.' },
              { icon: Smartphone, title: isZh ? '传感器无关' : 'Sensor Agnostic', desc: isZh ? '兼容所有主流穿戴设备，通过 Health Connect 无缝接入。' : 'Compatible with all major wearables. Seamless integration via Health Connect.' },
              { icon: TrendingUp, title: isZh ? '趋势分析' : 'Trend Analytics', desc: isZh ? '跟踪长期睡眠模式变化，自动识别异常与改善机会。' : 'Track long-term sleep pattern changes. Auto-detect anomalies and improvement opportunities.' },
              { icon: Heart, title: isZh ? '生命体征监控' : 'Vital Monitoring', desc: isZh ? '实时追踪心率、HRV、呼吸率等关键生理指标。' : 'Real-time tracking of heart rate, HRV, respiratory rate, and key vital signs.' },
              { icon: Award, title: isZh ? '科学验证' : 'Scientifically Backed', desc: isZh ? '基于经过同行评审的睡眠医学研究，提供循证建议。' : 'Based on peer-reviewed sleep medicine research. Evidence-based recommendations.' },
            ].map((feature, i) => (
              <m.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.6 }}
                className="group p-8 rounded-3xl bg-white/[0.02] border border-white/[0.04] hover:border-indigo-500/15 hover:bg-white/[0.04] transition-all duration-500 cursor-default"
              >
                <div className="flex items-start gap-5">
                  <div className="p-3.5 bg-indigo-500/10 rounded-xl text-indigo-400 group-hover:bg-indigo-500/15 group-hover:scale-105 transition-all duration-300 shrink-0">
                    <feature.icon size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">{feature.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">{feature.desc}</p>
                  </div>
                </div>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          TESTIMONIAL / SOCIAL PROOF
          ═══════════════════════════════════════════ */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-[1100px] mx-auto">
          <SectionHeader
            tag={isZh ? '用户反馈' : 'Testimonials'}
            title={isZh ? '用户' : 'USER'}
            accent={isZh ? '信赖' : 'VOICES'}
            subtitle={isZh ? '来自真实用户的睡眠改善反馈。' : 'Real feedback from users who transformed their sleep quality.'}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { quote: isZh ? '"SomnoAI 彻底改变了我理解自己睡眠的方式。AI 教练的建议让我的深度睡眠时间增加了 40%。"' : '"SomnoAI completely transformed how I understand my sleep. The AI coach\'s recommendations increased my deep sleep by 40%."', name: isZh ? '李明' : 'Alex Chen', role: isZh ? '软件工程师' : 'Software Engineer', rating: 5 },
              { quote: isZh ? '"作为医学专业人士，我对 SomnoAI 的临床级分析精度印象深刻。它真正做到了将专业睡眠实验室带到你的手机上。"' : '"As a medical professional, I\'m impressed by SomnoAI\'s clinical-grade analysis accuracy. It truly brings the sleep lab to your phone."', name: 'Dr. Sarah M.', role: isZh ? '睡眠医学研究员' : 'Sleep Researcher', rating: 5 },
              { quote: isZh ? '"直观的界面让追踪睡眠变得简单而有趣。我的整体睡眠效率从 78% 提升到了 92%。"' : '"The intuitive interface makes tracking sleep simple and engaging. My overall sleep efficiency went from 78% to 92%."', name: isZh ? '王芳' : 'Maria K.', role: isZh ? '健身教练' : 'Fitness Coach', rating: 5 },
            ].map((t, i) => (
              <m.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.6 }}
                className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.04] hover:border-indigo-500/10 transition-all duration-500 flex flex-col"
              >
                <div className="flex gap-1 mb-5">
                  {Array(t.rating).fill(0).map((_, j) => (
                    <Star key={j} size={14} className="fill-indigo-400 text-indigo-400" />
                  ))}
                </div>
                <p className="text-slate-400 text-sm leading-relaxed font-medium flex-1 italic">{t.quote}</p>
                <div className="mt-6 pt-5 border-t border-white/[0.04]">
                  <p className="text-white font-bold text-sm">{t.name}</p>
                  <p className="text-slate-600 text-xs font-medium">{t.role}</p>
                </div>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CTA BANNER
          ═══════════════════════════════════════════ */}
      <section className="py-32 md:py-40 px-6 relative z-10">
        <m.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-[1100px] mx-auto relative overflow-hidden rounded-[3rem] border border-white/[0.06]"
        >
          {/* CTA Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-violet-600/10 to-transparent" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.12] mix-blend-overlay" />
          <m.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-[-50%] right-[-20%] w-[80%] h-[200%] bg-indigo-500/10 blur-[120px] rounded-full"
          />

          <div className="relative z-10 p-12 md:p-20 text-center space-y-8">
            <h2 className="text-4xl md:text-7xl font-black italic text-white uppercase tracking-tighter leading-[0.9]">
              {isZh ? '准备好优化' : 'READY TO'} <br />
              <span className="bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">{isZh ? '您的睡眠了吗？' : 'OPTIMIZE?'}</span>
            </h2>
            <p className="text-lg text-slate-400 font-medium max-w-xl mx-auto">
              {isZh ? '加入数千名正在用 AI 重新定义睡眠质量的用户。免费开始，无需信用卡。' : 'Join thousands of users redefining sleep quality with AI. Start free, no credit card required.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <m.button
                whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate('signup')}
                className="group px-12 py-5 bg-white text-[#01040a] rounded-2xl font-bold text-sm uppercase tracking-[0.15em] shadow-[0_20px_50px_rgba(255,255,255,0.1)] transition-all flex items-center gap-3 hover:shadow-[0_20px_60px_rgba(255,255,255,0.15)]"
              >
                {isZh ? '免费注册' : 'Create Free Account'}
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </m.button>
              <button
                onClick={() => onNavigate('science')}
                className="px-12 py-5 text-white/70 hover:text-white font-bold text-sm uppercase tracking-[0.15em] transition-all flex items-center gap-2"
              >
                {isZh ? '了解更多' : 'Learn More'} <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </m.div>
      </section>

      {/* ═══════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════ */}
      <footer className="py-20 px-8 border-t border-white/[0.04] bg-[#01040a] relative z-20">
        <div className="max-w-[1300px] mx-auto">
          {/* Footer Top */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-16 pb-16 border-b border-white/[0.04]">
            {/* Brand */}
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <Logo size={44} />
                <div className="flex flex-col text-left">
                  <span className="text-xl font-black italic text-white uppercase leading-none">Somno<span className="text-indigo-400">AI</span></span>
                  <span className="text-[8px] font-bold uppercase tracking-[0.4em] text-slate-600 mt-1">{isZh ? '数字化睡眠实验室' : 'Digital Sleep Lab'}</span>
                </div>
              </div>
              <p className="text-sm text-slate-600 max-w-xs leading-relaxed font-medium">
                {isZh ? '融合 AI 与临床睡眠科学的下一代数字化睡眠实验室。' : 'Next-generation digital sleep laboratory fusing AI with clinical sleep science.'}
              </p>
              <div className="flex gap-3 pt-2">
                {[
                  { icon: Github, href: 'https://github.com/vyncuslim/SomnoAI-Digital-Sleep-Lab' },
                  { icon: Linkedin, href: 'https://www.linkedin.com/company/somnoai-digital-sleep-lab/' },
                  { icon: Mail, href: 'mailto:contact@sleepsomno.com' }
                ].map((social, i) => (
                  <a key={i} href={social.href} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white/[0.03] border border-white/[0.05] rounded-xl text-slate-500 hover:text-white hover:bg-white/[0.06] hover:border-white/10 transition-all">
                    <social.icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            {/* Footer Links */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12 md:gap-16">
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">{isZh ? '产品' : 'Product'}</h4>
                <div className="space-y-3">
                  {[
                    { label: isZh ? '功能' : 'Features', view: 'science' },
                    { label: isZh ? '常见问题' : 'FAQ', view: 'faq' },
                    { label: isZh ? '技术支持' : 'Support', view: 'support' },
                  ].map((link, i) => (
                    <button key={i} onClick={() => onNavigate(link.view)} className="block text-sm text-slate-600 hover:text-white transition-colors font-medium">{link.label}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">{isZh ? '公司' : 'Company'}</h4>
                <div className="space-y-3">
                  {[
                    { label: isZh ? '关于我们' : 'About', view: 'about' },
                    { label: isZh ? '科学' : 'Science', view: 'science' },
                  ].map((link, i) => (
                    <button key={i} onClick={() => onNavigate(link.view)} className="block text-sm text-slate-600 hover:text-white transition-colors font-medium">{link.label}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">{isZh ? '法律' : 'Legal'}</h4>
                <div className="space-y-3">
                  <a href="/privacy.html" className="block text-sm text-slate-600 hover:text-white transition-colors font-medium">{isZh ? '隐私政策' : 'Privacy Policy'}</a>
                  <a href="/terms.html" className="block text-sm text-slate-600 hover:text-white transition-colors font-medium">{isZh ? '服务条款' : 'Terms of Service'}</a>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10">
            <p className="text-xs text-slate-700 font-medium">© 2026 SomnoAI Digital Sleep Lab. All rights reserved.</p>
            <div className="flex items-center gap-3 px-5 py-2.5 bg-white/[0.02] border border-white/[0.04] rounded-full">
              <ShieldCheck size={13} className="text-indigo-500" />
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.15em]">Powered by Google Gemini</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ═══════════════════════════════════════════
          MOBILE MENU
          ═══════════════════════════════════════════ */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <m.div
            initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[200] bg-[#010409]/95 backdrop-blur-2xl p-8 flex flex-col"
          >
            <div className="flex justify-between items-center mb-16">
              <div className="flex items-center gap-3">
                <Logo size={40} />
                <span className="text-lg font-black italic text-white uppercase">Somno<span className="text-indigo-400">AI</span></span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors"><X size={24} /></button>
            </div>
            <div className="flex flex-col gap-6 flex-1">
              {navLinks.map((link, i) => (
                <m.button
                  key={link.view}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => { onNavigate(link.view); setMobileMenuOpen(false); }}
                  className="text-left text-4xl sm:text-5xl font-black italic uppercase tracking-tighter hover:text-indigo-400 transition-all py-2"
                >
                  {link.label}
                </m.button>
              ))}
            </div>
            <div className="space-y-4 pt-8 border-t border-white/5">
              <button
                onClick={() => { onNavigate('signup'); setMobileMenuOpen(false); }}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3"
              >
                {isZh ? '免费注册' : 'Get Started'} <ArrowRight size={16} />
              </button>
              <button
                onClick={() => { onNavigate('login'); setMobileMenuOpen(false); }}
                className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-sm uppercase tracking-[0.2em]"
              >
                {isZh ? '登录' : 'Sign In'}
              </button>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};
