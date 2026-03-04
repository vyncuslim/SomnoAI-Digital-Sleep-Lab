import React from 'react';
import { MarketingPageTemplate } from '../components/ui/MarketingPageTemplate';
import { Section, Card, Accordion, InlineCTA } from '../components/ui/Components';
import { Activity, Brain, Clock, Moon, Sun, Zap } from 'lucide-react';

export const Research: React.FC = () => {
  return (
    <MarketingPageTemplate
      title="Research & Methodology"
      subtitle="Exploring the intersection of artificial intelligence, data science, and human sleep behavior to uncover meaningful patterns."
      ctaPrimary={{ text: "Read Science", link: "/science" }}
      ctaSecondary={{ text: "Read Blog", link: "/blog" }}
    >
      <Section title="Research Areas">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card 
            title="Circadian Rhythm" 
            description="Investigating how daily routines and environmental factors influence the body's natural 24-hour cycle."
            icon={<Sun />}
          />
          <Card 
            title="Sleep Consistency" 
            description="Analyzing the impact of irregular sleep schedules on cognitive performance and long-term health markers."
            icon={<Clock />}
          />
          <Card 
            title="Physiological Recovery" 
            description="Studying the relationship between deep sleep phases, resting heart rate, and physical restoration."
            icon={<Activity />}
          />
          <Card 
            title="Sleep Architecture" 
            description="Examining the structure and progression of sleep stages throughout the night."
            icon={<Brain />}
          />
          <Card 
            title="Environmental Factors" 
            description="Understanding how light exposure, temperature, and noise affect sleep onset and maintenance."
            icon={<Moon />}
          />
          <Card 
            title="Energy & Fatigue" 
            description="Correlating subjective energy levels with objective sleep metrics to predict daytime fatigue."
            icon={<Zap />}
          />
        </div>
      </Section>

      <Section title="Methodology">
        <div className="max-w-3xl mx-auto">
          <Accordion items={[
            {
              title: "Data Types & Sources",
              content: "Our models are designed to process diverse data streams, including actigraphy (movement), photoplethysmography (heart rate), and user-reported logs. We focus on longitudinal data to capture long-term behavioral trends rather than isolated nightly snapshots."
            },
            {
              title: "Computational Models",
              content: "We employ a combination of statistical analysis and machine learning techniques, including time-series forecasting, anomaly detection, and clustering algorithms. These models are optimized for interpretability, ensuring that the resulting insights are understandable and actionable."
            },
            {
              title: "Validation & Integrity",
              content: "While we are not a clinical diagnostic tool, we prioritize scientific integrity. Our analytical frameworks are continuously refined by comparing model outputs against established sleep science principles and large-scale anonymized datasets."
            }
          ]} />
        </div>
      </Section>

      <Section title="Open Questions">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-white/5">
            <h3 className="text-xl font-bold text-white mb-4">The Impact of Social Jetlag</h3>
            <p className="text-slate-400 leading-relaxed">
              How does the discrepancy between biological time and social time (e.g., shifting schedules on weekends) affect metabolic health and cognitive function over years or decades?
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-white/5">
            <h3 className="text-xl font-bold text-white mb-4">Personalized Sleep Needs</h3>
            <p className="text-slate-400 leading-relaxed">
              Beyond the standard "8 hours a night" recommendation, how can computational models accurately determine an individual's unique, optimal sleep duration and timing?
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-white/5">
            <h3 className="text-xl font-bold text-white mb-4">Wearable Accuracy vs. Utility</h3>
            <p className="text-slate-400 leading-relaxed">
              How can we extract the most reliable behavioral insights from consumer-grade wearables, acknowledging their limitations compared to clinical polysomnography?
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-white/5">
            <h3 className="text-xl font-bold text-white mb-4">AI in Behavioral Change</h3>
            <p className="text-slate-400 leading-relaxed">
              What role can interpretable AI play in motivating sustainable behavioral changes that lead to improved sleep hygiene and overall well-being?
            </p>
          </div>
        </div>
      </Section>

      <div className="text-center pt-12 border-t border-white/5">
        <div className="flex items-center justify-center gap-6">
          <InlineCTA text="Open Source" link="/opensource" />
          <span className="text-white/20">|</span>
          <InlineCTA text="Policy Framework" link="/policy" />
        </div>
      </div>
    </MarketingPageTemplate>
  );
};
