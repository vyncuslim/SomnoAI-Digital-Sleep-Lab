import React from 'react';
import { MarketingPageTemplate } from '../components/ui/MarketingPageTemplate';
import { Section, Card, Tabs, InlineCTA } from '../components/ui/Components';
import { Activity, Brain, Clock, Shield, Smartphone, Watch, Cloud, CheckCircle2 } from 'lucide-react';

export const Product: React.FC = () => {
  return (
    <MarketingPageTemplate
      title="SomnoAI Digital Sleep Lab Platform"
      subtitle="The SomnoAI Digital Sleep Lab platform is designed to analyze sleep-related information and generate insights about behavioral sleep patterns."
      ctaPrimary={{ text: "View Features", link: "/features" }}
      ctaSecondary={{ text: "Join Waitlist", link: "/auth/signup" }}
    >
      <Section>
        <Tabs tabs={[
          {
            id: 'overview',
            label: 'Overview',
            content: (
              <div className="prose prose-invert max-w-none text-slate-300">
                <p className="text-lg leading-relaxed">
                  Traditional health dashboards often focus on basic metrics such as total sleep duration or activity levels. While these measurements provide useful information, they rarely reveal the deeper behavioral patterns that influence sleep quality. SomnoAI Digital Sleep Lab attempts to move beyond simple measurements by applying computational analysis to detect trends, correlations, and irregularities within sleep data.
                </p>
                <p className="text-lg leading-relaxed">
                  The platform focuses on transforming raw data signals into structured observations that help users better understand their nightly rest cycles and long-term sleep consistency.
                </p>
              </div>
            )
          },
          {
            id: 'inputs',
            label: 'Inputs',
            content: (
              <div className="prose prose-invert max-w-none text-slate-300">
                <p className="text-lg leading-relaxed">
                  The platform may analyze information obtained from compatible devices, digital health ecosystems, or user-provided data records. Using statistical models and artificial intelligence techniques, SomnoAI Digital Sleep Lab processes these signals to identify behavioral patterns that may not be visible through traditional dashboards.
                </p>
              </div>
            )
          },
          {
            id: 'outputs',
            label: 'Outputs',
            content: (
              <div className="prose prose-invert max-w-none text-slate-300">
                <p className="text-lg leading-relaxed">
                  A key design principle of the SomnoAI Digital Sleep Lab platform is interpretability. Data insights should be understandable rather than overwhelming. Instead of presenting large volumes of raw numbers, the system attempts to generate clear observations about sleep consistency, rest cycles, and behavioral rhythms.
                </p>
              </div>
            )
          },
          {
            id: 'privacy',
            label: 'Privacy',
            content: (
              <div className="prose prose-invert max-w-none text-slate-300">
                <p className="text-lg leading-relaxed">
                  The platform is also designed with privacy awareness in mind. Data analysis is performed in ways that prioritize responsible handling of personal information. Security practices and data protection principles are incorporated into the architecture of the system.
                </p>
              </div>
            )
          }
        ]} />
      </Section>

      <Section title="Core Capabilities">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card title="Pattern Detection" description="Applying computational analysis to detect trends, correlations, and irregularities within sleep data." icon={<Brain />} />
          <Card title="Long-term Consistency" description="Identifying recurring trends that may influence how individuals sleep and recover over extended periods." icon={<Clock />} />
          <Card title="Interpretability" description="Generating clear observations rather than presenting large volumes of raw, overwhelming numbers." icon={<CheckCircle2 />} />
          <Card title="Behavioral Rhythms" description="Understanding how routines, environmental conditions, and lifestyle choices influence human sleep." icon={<Activity />} />
          <Card title="Privacy-Aware Architecture" description="Security practices and data protection principles are incorporated directly into the system." icon={<Shield />} />
        </div>
      </Section>

      <Section title="Example Insights">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
            <h4 className="text-indigo-400 font-semibold mb-2">Consistency</h4>
            <p className="text-slate-300 text-sm">"Your sleep onset time has varied by more than 90 minutes over the past week, which may be affecting your deep sleep duration."</p>
          </div>
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <h4 className="text-emerald-400 font-semibold mb-2">Rhythm</h4>
            <p className="text-slate-300 text-sm">"Your weekend sleep schedule is significantly misaligned with your weekday routine, indicating potential social jetlag."</p>
          </div>
          <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <h4 className="text-amber-400 font-semibold mb-2">Recovery</h4>
            <p className="text-slate-300 text-sm">"Despite 8 hours of total sleep, your resting heart rate remained elevated, suggesting incomplete physiological recovery."</p>
          </div>
        </div>
      </Section>

      <Section title="Supported Integrations">
        <div className="flex flex-wrap gap-4 items-center justify-center py-8">
          <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 border border-white/10 text-slate-400"><Watch size={20} /> Wearables</div>
          <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 border border-white/10 text-slate-400"><Smartphone size={20} /> Health Apps</div>
          <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 border border-white/10 text-slate-400"><Cloud size={20} /> Cloud Ecosystems</div>
        </div>
      </Section>

      <Section title="Frequently Asked Questions">
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5">
            <h4 className="font-semibold text-white mb-2">Is this a medical diagnostic tool?</h4>
            <p className="text-slate-400 text-sm">SomnoAI Digital Sleep Lab is not intended to replace professional medical evaluation or clinical sleep laboratories. Instead, the platform focuses on educational insights.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5">
            <h4 className="font-semibold text-white mb-2">What kind of data is required?</h4>
            <p className="text-slate-400 text-sm">The platform analyzes information obtained from compatible devices, digital health ecosystems, or user-provided data records.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5">
            <h4 className="font-semibold text-white mb-2">How is my privacy protected?</h4>
            <p className="text-slate-400 text-sm">Data analysis is performed in ways that prioritize responsible handling of personal information, with security practices incorporated into the architecture.</p>
          </div>
        </div>
      </Section>

      <div className="text-center pt-12 border-t border-white/5">
        <div className="flex items-center justify-center gap-6">
          <InlineCTA text="Get Support" link="/support" />
          <span className="text-white/20">|</span>
          <InlineCTA text="System Status" link="/status" />
        </div>
      </div>
    </MarketingPageTemplate>
  );
};
