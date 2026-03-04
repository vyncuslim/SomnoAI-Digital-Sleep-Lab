import React from 'react';
import { MarketingPageTemplate } from '../components/ui/MarketingPageTemplate';
import { Section, AlertBanner, InlineCTA } from '../components/ui/Components';
import { Database, Cpu, BrainCircuit, LineChart } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  return (
    <MarketingPageTemplate
      title="How the SomnoAI Digital Sleep Lab Platform Works"
      subtitle="The SomnoAI Digital Sleep Lab platform analyzes sleep-related information through a structured analytical process designed to transform raw behavioral signals into interpretable insights."
      ctaPrimary={{ text: "See Method", link: "/science" }}
      ctaSecondary={{ text: "Read Science", link: "/research" }}
    >
      <div className="flex flex-col lg:flex-row gap-12 relative">
        <div className="flex-grow lg:w-3/4">
          <Section title="The Analytical Process">
            <p className="text-lg text-slate-400 leading-relaxed mb-12">
              This process involves several stages that work together to extract meaningful patterns from data. Through this multi-stage analytical workflow, SomnoAI Digital Sleep Lab seeks to provide a deeper understanding of sleep behavior by transforming complex data into interpretable observations.
            </p>

            <div className="space-y-12 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-indigo-500/50 before:via-indigo-500/20 before:to-transparent">
              {/* Step 1 */}
              <div className="relative flex items-start gap-6">
                <div className="w-12 h-12 rounded-full bg-slate-900 border-2 border-indigo-500 flex items-center justify-center text-indigo-400 shrink-0 z-10 shadow-[0_0_0_8px_#01040a]">
                  <Database size={20} />
                </div>
                <div className="bg-slate-900/50 border border-white/5 p-8 rounded-2xl flex-grow">
                  <h3 className="text-2xl font-bold text-white mb-4">1. Data Input</h3>
                  <p className="text-slate-400 leading-relaxed mb-6">
                    Users may provide sleep-related data from compatible wearable devices, health platforms, or manually recorded activity logs. These signals often include movement patterns, rest cycles, or behavioral timing indicators that can be used to infer sleep trends.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <h4 className="text-emerald-400 font-semibold text-sm mb-1">What it does</h4>
                      <p className="text-slate-300 text-xs">Collects movement, rest cycles, and timing indicators.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                      <h4 className="text-rose-400 font-semibold text-sm mb-1">What it doesn't</h4>
                      <p className="text-slate-300 text-xs">Does not collect clinical-grade EEG or polysomnography data.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative flex items-start gap-6">
                <div className="w-12 h-12 rounded-full bg-slate-900 border-2 border-indigo-500 flex items-center justify-center text-indigo-400 shrink-0 z-10 shadow-[0_0_0_8px_#01040a]">
                  <Cpu size={20} />
                </div>
                <div className="bg-slate-900/50 border border-white/5 p-8 rounded-2xl flex-grow">
                  <h3 className="text-2xl font-bold text-white mb-4">2. Signal Processing</h3>
                  <p className="text-slate-400 leading-relaxed mb-6">
                    Once data is collected, the SomnoAI Digital Sleep Lab system begins signal processing. In this stage, the platform organizes incoming data and prepares it for computational analysis. Raw signals may contain noise, irregularities, or inconsistencies. Pre-processing techniques help ensure that the data can be interpreted reliably.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <h4 className="text-emerald-400 font-semibold text-sm mb-1">What it does</h4>
                      <p className="text-slate-300 text-xs">Filters noise, normalizes formats, and aligns timestamps.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                      <h4 className="text-rose-400 font-semibold text-sm mb-1">What it doesn't</h4>
                      <p className="text-slate-300 text-xs">Does not alter the fundamental physiological measurements.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative flex items-start gap-6">
                <div className="w-12 h-12 rounded-full bg-slate-900 border-2 border-indigo-500 flex items-center justify-center text-indigo-400 shrink-0 z-10 shadow-[0_0_0_8px_#01040a]">
                  <BrainCircuit size={20} />
                </div>
                <div className="bg-slate-900/50 border border-white/5 p-8 rounded-2xl flex-grow">
                  <h3 className="text-2xl font-bold text-white mb-4">3. Pattern Detection</h3>
                  <p className="text-slate-400 leading-relaxed mb-6">
                    Artificial intelligence algorithms and statistical models evaluate both short-term and long-term trends in behavioral signals. These models look for recurring structures within the data that may indicate stable sleep rhythms or irregular patterns.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <h4 className="text-emerald-400 font-semibold text-sm mb-1">What it does</h4>
                      <p className="text-slate-300 text-xs">Identifies recurring structures and long-term behavioral trends.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                      <h4 className="text-rose-400 font-semibold text-sm mb-1">What it doesn't</h4>
                      <p className="text-slate-300 text-xs">Does not diagnose sleep disorders like apnea or insomnia.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative flex items-start gap-6">
                <div className="w-12 h-12 rounded-full bg-slate-900 border-2 border-indigo-500 flex items-center justify-center text-indigo-400 shrink-0 z-10 shadow-[0_0_0_8px_#01040a]">
                  <LineChart size={20} />
                </div>
                <div className="bg-slate-900/50 border border-white/5 p-8 rounded-2xl flex-grow">
                  <h3 className="text-2xl font-bold text-white mb-4">4. Insights & Visualization</h3>
                  <p className="text-slate-400 leading-relaxed mb-6">
                    After patterns have been identified, the platform generates insights. Instead of presenting raw data streams, the system produces structured summaries designed to highlight relevant behavioral observations. Visualization tools are often used to present insights in a clear format. Charts, summaries, and trend indicators help users understand how their sleep behavior evolves over time.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <h4 className="text-emerald-400 font-semibold text-sm mb-1">What it does</h4>
                      <p className="text-slate-300 text-xs">Produces structured summaries and visual trend indicators.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                      <h4 className="text-rose-400 font-semibold text-sm mb-1">What it doesn't</h4>
                      <p className="text-slate-300 text-xs">Does not prescribe medical treatments or lifestyle interventions.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          <Section>
            <AlertBanner title="Model Limitations" type="warning">
              The analytical process used by SomnoAI Digital Sleep Lab focuses on observational insights rather than clinical conclusions. While computational models can reveal interesting patterns within behavioral data, they cannot replace professional medical evaluation.
            </AlertBanner>
          </Section>
        </div>

        <aside className="w-full lg:w-1/4 flex-shrink-0">
          <div className="sticky top-24 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 shadow-2xl">
              <h4 className="text-lg font-bold text-white mb-4">Data Responsibility</h4>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                We handle your data with the utmost care, ensuring privacy and security throughout the analytical process.
              </p>
              <div className="space-y-3">
                <InlineCTA text="Privacy Policy" link="/privacy" />
                <br />
                <InlineCTA text="Data Processing" link="/data-processing" />
              </div>
            </div>
            
            <div className="pt-6 border-t border-white/5">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Further Reading</h4>
              <div className="space-y-3">
                <InlineCTA text="Research Focus" link="/research" />
                <br />
                <InlineCTA text="FAQ" link="/faq" />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </MarketingPageTemplate>
  );
};
