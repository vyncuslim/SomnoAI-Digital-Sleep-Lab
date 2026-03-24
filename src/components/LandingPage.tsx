import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, Activity, Zap, 
  CheckCircle2, Users, Database, ShieldCheck,
  Smartphone, BarChart3, MessageSquare,
  Mail
} from 'lucide-react';

import { MarketingPageTemplate } from './ui/MarketingPageTemplate';
import { Section, Card, HardwareWidget, HardwareButton, TelemetryStream, Accordion } from './ui/Components';
import { Language, getTranslation } from '../services/i18n';
import { useAuth } from '../context/AuthContext';

interface LandingPageProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  onNavigate: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ lang, onNavigate }) => {
  console.log('LandingPage rendered');
  const { user } = useAuth();
  const t = getTranslation(lang, 'landing');

  const stats = [
    { label: t.stats?.analyzed || "Hours Analyzed", value: "10M+", unit: "HRS", icon: Database },
    { label: t.stats?.accuracy || "Sleep Accuracy", value: "98.4", unit: "%", icon: CheckCircle2 },
    { label: t.stats?.users || "Active Users", value: "50", unit: "K+", icon: Users },
    { label: t.stats?.encrypted || "Data Encrypted", value: "100", unit: "%", icon: ShieldCheck },
  ];

  const steps = [
    { 
      step: "01", 
      title: t.protocol?.step1?.title || "Connect Device", 
      desc: t.protocol?.step1?.desc || "Sync with Apple Health, Google Fit, or Oura Ring.",
      icon: Smartphone 
    },
    { 
      step: "02", 
      title: t.protocol?.step2?.title || "AI Analysis", 
      desc: t.protocol?.step2?.desc || "Gemini 2.5 Pro processes your sleep and physiological data.",
      icon: Brain 
    },
    { 
      step: "03", 
      title: t.protocol?.step3?.title || "Generate Report", 
      desc: t.protocol?.step3?.desc || "Get deep sleep architecture and recovery scoring.",
      icon: BarChart3 
    },
    { 
      step: "04", 
      title: t.protocol?.step4?.title || "Actionable Advice", 
      desc: t.protocol?.step4?.desc || "Receive personalized schedule and training recommendations.",
      icon: Zap 
    }
  ];

  const testimonials = t.testimonials || [
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
              {t.welcomeBack || 'Welcome back,'} {user.email}
            </motion.p>
          )}
          <h1 className="text-6xl md:text-9xl font-black italic uppercase tracking-tighter text-white leading-[0.85] animate-float">
            SOMNOAI <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
              SLEEP LAB
            </span>
          </h1>
        </div>
      }
      subtitle={t.heroSubtitle || "Use your existing wearable data to get AI-powered sleep insights — no hardware lock-in, privacy-first, actionable from day one."}
      ctaPrimary={{ text: t.ctaPrimary || "Upload Sleep Data", link: "/auth/signup" }}
      ctaSecondary={{ text: t.ctaSecondary || "Explore How It Works", link: "/how-it-works" }}
      ctaTertiary={{ text: t.waitlist || "Join Waitlist", link: "/contact" }}
    >
      {/* Stats Section */}
      <Section moduleID="STATS_01">
        <div className="flex justify-between items-center mb-12">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="px-8">
            <TelemetryStream />
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
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

      {/* Trust Assets & Brand Clarification */}
      <Section moduleID="TRUST_01" className="border-y border-white/5 bg-indigo-900/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          <div>
            <div className="text-indigo-400 mb-4 flex justify-center md:justify-start"><ShieldCheck size={32} /></div>
            <h3 className="text-xl font-bold text-white mb-2">{t.trust?.labTitle || 'A Digital Sleep Lab, Not Just a Tracker'}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t.trust?.labDesc || 'There are many hardware trackers named Somno/Sonno. We don\'t make hardware. We are the hardware-agnostic AI brain that uncovers the truth behind your data.'}
            </p>
          </div>
          <div>
            <div className="text-indigo-400 mb-4 flex justify-center md:justify-start"><Database size={32} /></div>
            <h3 className="text-xl font-bold text-white mb-2">{t.trust?.sourcesTitle || 'Supported Data Sources'}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t.trust?.sourcesDesc || 'Seamlessly integrates with Apple Health, Google Fit, Oura, Garmin, Fitbit, and more. You are never locked into a single brand.'}
            </p>
          </div>
          <div>
            <div className="text-indigo-400 mb-4 flex justify-center md:justify-start"><Users size={32} /></div>
            <h3 className="text-xl font-bold text-white mb-2">{t.trust?.teamTitle || 'Built by Researchers & Engineers'}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t.trust?.teamDesc || 'Our team is dedicated to bringing clinical-grade sleep insights to everyone. View our public roadmap or contact the founding team directly.'}
            </p>
            <div className="mt-4 flex gap-4 justify-center md:justify-start">
              <button onClick={() => onNavigate('/about')} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-wider">{t.trust?.aboutUs || 'About Us →'}</button>
              <button onClick={() => onNavigate('/contact')} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-wider">{t.trust?.contactTeam || 'Contact Team →'}</button>
            </div>
          </div>
        </div>
      </Section>

      {/* Core Capabilities */}
      <Section 
        moduleID="CORE_01"
        title={t.capabilities?.title || 'Solving Real Sleep Problems'} 
        description={t.capabilities?.subtitle || 'We solve the problem of interpretation, not just tracking.'}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8">
            <Card 
              title={t.capabilities?.tiredTitle || "Why are you still tired after 8 hours of sleep?"}
              description={t.capabilities?.tiredDesc || "We go beyond simple duration tracking. Our AI analyzes your sleep architecture, HRV, and lifestyle factors to pinpoint the root cause of your fatigue."}
              icon={<Activity size={32} />}
              label="ROOT_CAUSE_ANALYSIS"
              className="h-full"
            >
              <div className="mt-8 p-6 bg-black/40 rounded-2xl border border-white/5 relative overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <span className="micro-label">HEART_RATE_VARIABILITY</span>
                  <span className="text-indigo-400 font-mono text-xs">84ms</span>
                </div>
                <div className="flex gap-1 h-12 items-end">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div key={i} className="flex-1 bg-indigo-500/20 rounded-full" style={{ height: `${Math.random() * 100}%` }} />
                  ))}
                </div>
                <div className="absolute inset-0 data-stream opacity-5" />
              </div>
            </Card>
          </div>
          <div className="md:col-span-4">
            <Card 
              title={t.capabilities?.unifiedTitle || "Why can't different tracker data be explained together?"}
              description={t.capabilities?.unifiedDesc || "We aggregate data from Apple Health, Oura, Garmin, and more into a single, unified intelligence layer."}
              icon={<Database size={32} />}
              label="DATA_AGGREGATION"
              className="h-full"
            />
          </div>
          <div className="md:col-span-4">
            <Card 
              title={t.capabilities?.noRingTitle || "No smart ring? You still deserve smart sleep analysis."}
              description={t.capabilities?.noRingDesc || "Even with basic phone tracking or manual logs, our AI can identify patterns and provide actionable recovery protocols."}
              icon={<Brain size={32} />}
              label="ACCESSIBLE_AI"
              className="h-full"
            />
          </div>
          <div className="md:col-span-8">
            <Card 
              title={t.capabilities?.privacyTitle || "Your Data, Your Rules (Local-first & Encrypted)"}
              description={t.capabilities?.privacyDesc || "We are a research lab, not a data broker. Your raw biometrics NEVER leave your device. All processing is edge-processed, ensuring privacy-first analysis."}
              icon={<ShieldCheck size={32} />}
              label="PRIVACY_FIRST"
              className="h-full bg-emerald-500/[0.02] border-emerald-500/10"
            >
              <div className="mt-6">
                <button onClick={() => onNavigate('/privacy')} className="text-xs font-bold text-emerald-400 hover:text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                  {t.capabilities?.privacyPolicy || 'View our Data Handling Policy →'}
                </button>
              </div>
            </Card>
          </div>
        </div>
      </Section>

      {/* What You Get / Real Report Example */}
      <Section 
        moduleID="REPORT_01"
        title={t.report?.title || 'What You Get'} 
        description={t.report?.subtitle || 'No more confusing numbers. Get clear, actionable insights that tell you exactly what to do.'}
        className="bg-indigo-900/5 border-y border-white/5"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30">
                <Brain className="text-indigo-400" size={24} />
              </div>
              <div>
                <h4 className="text-xl font-bold text-white mb-2">{t.report?.anomalyTitle || 'Anomaly Root Cause'}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {t.report?.anomalyDesc || '"Your deep sleep dropped by 30% last night. This highly correlates with the late workout you logged 2 hours before bed. Recommendation: Shift high-intensity training to the afternoon."'}
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Zap className="text-emerald-400" size={24} />
              </div>
              <div>
                <h4 className="text-xl font-bold text-white mb-2">{t.report?.priorityTitle || 'Prioritized Actions'}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {t.report?.priorityDesc || 'Stop getting overwhelmed by dozens of tips. We give you exactly 1-2 highest-impact action items for the day.'}
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 border border-purple-500/30">
                <BarChart3 className="text-purple-400" size={24} />
              </div>
              <div>
                <h4 className="text-xl font-bold text-white mb-2">{t.report?.trendsTitle || 'Long-term Trends & Consistency'}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {t.report?.trendsDesc || 'Track your "Sleep Consistency Score", a far more important metric for recovery than single-night duration.'}
                </p>
              </div>
            </div>
          </div>

          {/* Mockup Dashboard */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 rounded-3xl blur-2xl" />
            <div className="relative bg-[#0a0f1c] border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="text-xs font-mono text-slate-500">SomnoAI Analysis Report</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-900/50 rounded-2xl p-4 border border-white/5">
                  <div className="text-xs text-slate-400 mb-1 uppercase tracking-wider">Recovery Score</div>
                  <div className="text-4xl font-black text-emerald-400">82<span className="text-lg text-slate-500">/100</span></div>
                </div>
                <div className="bg-slate-900/50 rounded-2xl p-4 border border-white/5">
                  <div className="text-xs text-slate-400 mb-1 uppercase tracking-wider">Sleep Debt</div>
                  <div className="text-4xl font-black text-yellow-400">-1.2<span className="text-lg text-slate-500">h</span></div>
                </div>
              </div>

              <div className="bg-indigo-500/10 rounded-2xl p-5 border border-indigo-500/20 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain size={16} className="text-indigo-400" />
                  <span className="text-sm font-bold text-indigo-300 uppercase tracking-wider">AI Insight</span>
                </div>
                <p className="text-sm text-indigo-100/80 leading-relaxed">
                  Your REM sleep was optimal, but deep sleep was fragmented between 2 AM and 4 AM. This pattern correlates with the late meal logged at 9 PM. 
                </p>
              </div>

              <div className="bg-slate-900/50 rounded-2xl p-5 border border-white/5">
                <div className="text-xs text-slate-400 mb-3 uppercase tracking-wider">Action Plan for Today</div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-sm text-slate-300">
                    <div className="mt-0.5 w-4 h-4 rounded-full border border-emerald-500/50 flex items-center justify-center bg-emerald-500/10 shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </div>
                    Stop caffeine intake by 2:00 PM to improve deep sleep continuity.
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-300">
                    <div className="mt-0.5 w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center shrink-0" />
                    Aim for 15 mins of direct sunlight before 9:00 AM.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* The Protocol */}
      <Section 
        moduleID="PROC_01"
        title={t.protocol?.title || 'The Protocol'} 
        description={t.protocol?.subtitle || 'Four steps to total cognitive restoration.'}
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
        title={t.techSpecs?.title || 'Technical Specifications'} 
        description={t.techSpecs?.subtitle || 'The underlying architecture and telemetry metrics of SomnoAI Lab.'}
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

      {/* Who is it for? */}
      <Section 
        moduleID="USER_01"
        title={t.whoIsItFor?.title || 'Who is it for?'} 
        description={t.whoIsItFor?.subtitle || 'Whatever your goal, SomnoAI Digital Sleep Lab provides customized recovery strategies.'}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: t.whoIsItFor?.athleteTitle || 'Elite Athletes', desc: t.whoIsItFor?.athleteDesc || 'Optimize training load, predict fatigue, and peak on race day.', icon: Activity, label: "PERFORMANCE" },
            { title: t.whoIsItFor?.workerTitle || 'Knowledge Workers', desc: t.whoIsItFor?.workerDesc || 'Maximize deep sleep to improve daytime cognitive clarity and focus.', icon: Brain, label: "COGNITION" },
            { title: t.whoIsItFor?.improverTitle || 'Sleep Improvers', desc: t.whoIsItFor?.improverDesc || 'Identify hidden factors disrupting sleep and establish healthy routines.', icon: ShieldCheck, label: "WELLNESS" }
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
          {testimonials.map((t: any, i: number) => (
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

      {/* Pricing Section */}
      <Section className="relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 blur-[160px] rounded-full pointer-events-none" />
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white mb-6">
            {t.pricing?.title || "Pricing Plans"}
          </h2>
          <p className="text-xl text-slate-400 italic font-medium max-w-2xl mx-auto">
            {t.pricing?.subtitle || "Choose the sleep analysis plan that's right for you"}
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <Card 
            title={t.pricing?.planTitle || "SomnoAI Digital Sleep Lab Analysis"} 
            description={t.pricing?.planDesc || "In-depth insights, long-term trend analysis, and personalized recommendations."}
            icon={<Zap className="text-indigo-400" />}
            label="NEURAL_ANALYSIS_V2"
            className="border-indigo-500/40 bg-indigo-950/20 shadow-[0_20px_50px_rgba(79,70,229,0.1)] relative overflow-hidden"
          >
            <div className="scanline" />
            <div className="mb-8 space-y-4">
              {(t.pricing?.features || ["AI Sleep Analysis Reports", "Unlimited History", "Neural Insights"]).map((feature: string, idx: number) => (
                <div key={idx} className="flex items-center gap-3 text-xs text-slate-300">
                  <CheckCircle2 size={14} className="text-indigo-400" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
            <div className="mt-auto">
              <div className="text-5xl font-black italic tracking-tighter text-white mb-8">
                {t.pricing?.price || "MYR 10.00"}<span className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-2">{t.pricing?.period || "/mo"}</span>
              </div>
              <HardwareButton 
                href="https://checkout.sleepsomno.com/b/eVqaEXeioe9F9U2cx3cwg04" 
                variant="primary"
                className="w-full"
              >
                {t.pricing?.button || "Subscribe Now"}
              </HardwareButton>
            </div>
          </Card>
        </div>
      </Section>

      {/* FAQ Section */}
      <Section 
        moduleID="FAQ_01"
        title={t.faq?.title || "Frequently Asked Questions"}
        description={t.faq?.subtitle || "Everything you need to know about the SomnoAI Digital Sleep Lab."}
      >
        <div className="max-w-3xl mx-auto">
          <Accordion 
            items={(t.faq?.items || []).map((item: any) => ({
              title: item.q,
              content: item.a
            }))}
          />
        </div>
      </Section>

      {/* Final CTA */}
      <Section className="text-center">
        <div className="space-y-12 py-12">
          <h2 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-[0.85] text-white">
            {t.readyTo || 'Ready to'} <br />
            <span className="text-indigo-500">{t.optimize || 'Optimize?'}</span>
          </h2>
          <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto font-medium">{t.stopGuessing || 'Stop guessing about your sleep. Upload your data and get real insights.'}</p>
          <HardwareButton 
            onClick={() => onNavigate('/auth/signup')}
            variant="secondary"
            className="mx-auto !px-16 !py-8 !text-xl shadow-[0_20px_60px_rgba(255,255,255,0.15)]"
          >
            {t.ctaPrimary || 'Upload Sleep Data'}
          </HardwareButton>
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
          <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto" onSubmit={async (e) => { 
            e.preventDefault(); 
            const btn = e.currentTarget.querySelector('button');
            const input = e.currentTarget.querySelector('input');
            if (btn && input && input.value) {
              const originalText = btn.innerText;
              btn.disabled = true;
              btn.innerText = t.subscribing || "Subscribing...";
              
              try {
                const res = await fetch('/api/subscribe', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: input.value })
                });
                
                if (res.ok) {
                  btn.innerText = t.subscribed || "Subscribed!";
                  btn.classList.add('bg-emerald-600');
                  btn.classList.remove('bg-indigo-600');
                  input.value = '';
                } else {
                  btn.innerText = "Error";
                }
              } catch (err) {
                btn.innerText = "Error";
              }
              
              setTimeout(() => {
                btn.innerText = originalText;
                btn.classList.remove('bg-emerald-600');
                btn.classList.add('bg-indigo-600');
                btn.disabled = false;
              }, 5000);
            }
          }}>
            <input 
              type="email" 
              placeholder={t.newsletter?.placeholder || "Enter your email"} 
              className="flex-1 px-8 py-5 bg-slate-900 border border-white/10 rounded-full focus:outline-none focus:border-indigo-500 transition-colors text-lg text-white placeholder-slate-600"
              required
            />
            <button type="submit" className="px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
              {t.newsletter?.button || "Subscribe"}
            </button>
          </form>
          <div className="hardware-label opacity-30">
            {t.unsubscribeNote || "You can unsubscribe at any time. View our Privacy Policy."}
          </div>
        </div>
      </Section>
    </MarketingPageTemplate>
  );
};
