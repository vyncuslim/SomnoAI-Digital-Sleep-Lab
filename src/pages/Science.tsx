import React from 'react';
import { MarketingPageTemplate } from '../components/ui/MarketingPageTemplate';
import { Section, Card, InlineCTA } from '../components/ui/Components';
import { Sun, Moon, Activity, CheckCircle2, AlertCircle } from 'lucide-react';

export const Science: React.FC = () => {
  return (
    <MarketingPageTemplate
      title="The Science of Sleep"
      subtitle="A foundational understanding of the biological processes that govern rest, recovery, and human performance."
      ctaPrimary={{ text: "Read Research", link: "/research" }}
    >
      <Section title="Key Concepts">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card 
            title="Circadian Rhythm" 
            description="The internal 24-hour clock that regulates the sleep-wake cycle, primarily influenced by light and temperature. It dictates when you feel alert and when you feel sleepy."
            icon={<Sun />}
          />
          <Card 
            title="Sleep Architecture" 
            description="The cyclical progression through different stages of sleep (Light, Deep, and REM) throughout the night. Each stage serves a distinct restorative function."
            icon={<Moon />}
          />
          <Card 
            title="Physiological Recovery" 
            description="The process by which the body repairs tissue, consolidates memories, and regulates metabolism during sleep, often reflected in metrics like resting heart rate."
            icon={<Activity />}
          />
        </div>
      </Section>

      <Section title="What Consumer Data Can and Cannot Tell Us">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <h3 className="text-xl font-bold text-emerald-400 mb-6 flex items-center gap-2"><CheckCircle2 /> What It Can Tell</h3>
            <ul className="space-y-4 text-emerald-200/80">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                <span><strong>Behavioral Consistency:</strong> How regular your sleep schedule is over weeks or months.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                <span><strong>Total Duration Trends:</strong> Whether you are consistently meeting your sleep goals.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                <span><strong>Resting Heart Rate:</strong> General indicators of cardiovascular recovery and stress.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                <span><strong>Movement Patterns:</strong> Periods of restlessness or wakefulness during the night.</span>
              </li>
            </ul>
          </div>
          <div className="p-8 rounded-2xl bg-rose-500/10 border border-rose-500/20">
            <h3 className="text-xl font-bold text-rose-400 mb-6 flex items-center gap-2"><AlertCircle /> What It Cannot Tell</h3>
            <ul className="space-y-4 text-rose-200/80">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                <span><strong>Clinical Diagnoses:</strong> Cannot diagnose sleep apnea, insomnia, or narcolepsy.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                <span><strong>Exact Sleep Stages:</strong> Wearables estimate stages based on movement and heart rate, but cannot measure brain waves (EEG).</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                <span><strong>Underlying Causes:</strong> Can show poor sleep, but cannot definitively explain *why* (e.g., anxiety, diet, environment).</span>
              </li>
            </ul>
          </div>
        </div>
      </Section>

      <Section title="Conceptual References">
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5">
            <h4 className="font-semibold text-white mb-2">The Two-Process Model of Sleep Regulation</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Proposed by Alexander Borbély in 1982, this model posits that sleep is regulated by two interacting processes: Process S (sleep debt, which builds up during wakefulness) and Process C (the circadian rhythm, which dictates the timing of sleepiness and alertness).
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5">
            <h4 className="font-semibold text-white mb-2">Social Jetlag</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              A concept introduced by Till Roenneberg, describing the discrepancy between an individual's biological clock and their social schedule, often resulting in chronic sleep deprivation and misalignment, particularly on workdays versus free days.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5">
            <h4 className="font-semibold text-white mb-2">The Role of Deep Sleep (Slow-Wave Sleep)</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Deep sleep is widely recognized in sleep science as the most restorative sleep stage, crucial for physical recovery, immune system function, and the clearance of metabolic waste from the brain via the glymphatic system.
            </p>
          </div>
        </div>
      </Section>

      <div className="text-center pt-12 border-t border-white/5">
        <div className="flex items-center justify-center gap-6">
          <InlineCTA text="Medical Disclaimer" link="/medical-disclaimer" />
          <span className="text-white/20">|</span>
          <InlineCTA text="AI Disclaimer" link="/ai-disclaimer" />
        </div>
      </div>
    </MarketingPageTemplate>
  );
};
