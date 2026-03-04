import React, { useState } from 'react';
import { MarketingPageTemplate } from '../components/ui/MarketingPageTemplate';
import { Section, Card, InlineCTA } from '../components/ui/Components';
import { Activity, Brain, Clock, Shield, BarChart3, Lock, Zap, Eye } from 'lucide-react';

export const Features: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  
  const filters = ['All', 'Insights', 'Visualization', 'Privacy', 'Reliability'];
  
  const features = [
    {
      title: 'Deep Sleep Analysis',
      description: 'Understand the quality and duration of your deep sleep phases.',
      category: 'Insights',
      icon: <Brain />
    },
    {
      title: 'Rhythm Tracking',
      description: 'Monitor your circadian rhythm and identify social jetlag.',
      category: 'Insights',
      icon: <Clock />
    },
    {
      title: 'Interactive Dashboards',
      description: 'Explore your data through intuitive, interactive visualizations.',
      category: 'Visualization',
      icon: <BarChart3 />
    },
    {
      title: 'Trend Reports',
      description: 'Receive weekly and monthly summaries of your sleep patterns.',
      category: 'Visualization',
      icon: <Activity />
    },
    {
      title: 'End-to-End Encryption',
      description: 'Your sleep data is encrypted both in transit and at rest.',
      category: 'Privacy',
      icon: <Lock />
    },
    {
      title: 'Data Anonymization',
      description: 'We strip personally identifiable information before analysis.',
      category: 'Privacy',
      icon: <Eye />
    },
    {
      title: 'High Availability',
      description: 'Our infrastructure is designed for 99.9% uptime.',
      category: 'Reliability',
      icon: <Zap />
    },
    {
      title: 'Secure Infrastructure',
      description: 'Built on enterprise-grade cloud security standards.',
      category: 'Reliability',
      icon: <Shield />
    }
  ];

  const filteredFeatures = activeFilter === 'All' 
    ? features 
    : features.filter(f => f.category === activeFilter);

  return (
    <MarketingPageTemplate
      title="Platform Features"
      subtitle="Discover the tools and capabilities designed to help you understand your sleep patterns."
      ctaPrimary={{ text: "Explore Product", link: "/product" }}
    >
      <Section>
        <div className="flex flex-wrap gap-2 mb-12 justify-center">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                activeFilter === filter 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' 
                  : 'bg-slate-900 border border-white/10 text-slate-400 hover:text-white hover:border-white/20'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredFeatures.map((feature, idx) => (
            <Card 
              key={idx}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
            >
              <div className="mt-4 pt-4 border-t border-white/5">
                <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">{feature.category}</span>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Use Cases">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-white/10 transition-colors">
            <h3 className="text-xl font-bold text-white mb-3">Athletic Recovery</h3>
            <p className="text-slate-400 leading-relaxed">Optimize training schedules by understanding how different workouts impact your sleep architecture and recovery metrics.</p>
          </div>
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-white/10 transition-colors">
            <h3 className="text-xl font-bold text-white mb-3">Shift Work Management</h3>
            <p className="text-slate-400 leading-relaxed">Navigate irregular schedules by tracking circadian alignment and identifying the most restorative sleep windows.</p>
          </div>
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-white/10 transition-colors">
            <h3 className="text-xl font-bold text-white mb-3">Lifestyle Optimization</h3>
            <p className="text-slate-400 leading-relaxed">Discover how daily habits, caffeine intake, and screen time correlate with your overall sleep quality and consistency.</p>
          </div>
        </div>
      </Section>

      <Section title="Traditional Dashboards vs SomnoAI Digital Sleep Lab">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-2xl bg-slate-900/30 border border-white/5">
            <h3 className="text-xl font-bold text-slate-300 mb-6">Traditional Dashboards</h3>
            <ul className="space-y-4 text-slate-400">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-2 shrink-0" />
                <span>Focus on raw numbers and basic metrics (e.g., total hours slept).</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-2 shrink-0" />
                <span>Provide isolated daily snapshots without long-term context.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-2 shrink-0" />
                <span>Require users to interpret complex graphs and find their own patterns.</span>
              </li>
            </ul>
          </div>
          <div className="p-8 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
            <h3 className="text-xl font-bold text-indigo-400 mb-6">SomnoAI Digital Sleep Lab</h3>
            <ul className="space-y-4 text-indigo-200/80">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                <span>Focuses on behavioral patterns, consistency, and rhythm.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                <span>Analyzes long-term trends to reveal hidden correlations.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                <span>Generates clear, actionable insights in plain language.</span>
              </li>
            </ul>
          </div>
        </div>
      </Section>

      <div className="text-center pt-12 border-t border-white/5">
        <div className="flex items-center justify-center gap-6">
          <InlineCTA text="Contact Us" link="/contact" />
          <span className="text-white/20">|</span>
          <InlineCTA text="Get Support" link="/support" />
        </div>
      </div>
    </MarketingPageTemplate>
  );
};
