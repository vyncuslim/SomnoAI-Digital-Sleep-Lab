import React from 'react';
import { MarketingPageTemplate } from '../components/ui/MarketingPageTemplate';
import { Section, Accordion, InlineCTA } from '../components/ui/Components';

export const FAQ: React.FC = () => {
  const faqItems = [
    {
      title: "What is SomnoAI Digital Sleep Lab?",
      content: "SomnoAI Digital Sleep Lab is a research-driven technology initiative dedicated to exploring how artificial intelligence and advanced data analysis can deepen the understanding of human sleep. We transform raw behavioral signals from wearable devices into meaningful insights about rest, recovery, and rhythms."
    },
    {
      title: "Is this a medical device?",
      content: "No. SomnoAI Digital Sleep Lab is an informational and research platform. It is not intended to diagnose, treat, or prevent any medical condition. Always consult with a healthcare professional for medical concerns related to sleep."
    },
    {
      title: "How do I connect my devices?",
      content: "The platform supports integration with major wearable ecosystems and health apps. You can connect your devices through the 'Integrations' section in your dashboard after signing up."
    },
    {
      title: "How is my data protected?",
      content: "We prioritize data privacy and security. Your data is encrypted at rest and in transit. We also apply anonymization techniques before performing large-scale computational analysis. For more details, please see our Privacy Policy."
    },
    {
      title: "What kind of insights will I receive?",
      content: "You will receive observations about your sleep consistency, circadian alignment, and physiological recovery trends. Instead of just raw numbers, we provide interpretable summaries that help you understand your behavioral sleep patterns."
    },
    {
      title: "Is there a cost to use the platform?",
      content: "During our research phase, basic access to the platform is free for participants. We may introduce premium features or subscription models in the future as the platform evolves."
    }
  ];

  return (
    <MarketingPageTemplate
      title="Frequently Asked Questions"
      subtitle="Find answers to common questions about the SomnoAI Digital Sleep Lab platform, research, and data practices."
    >
      <Section className="max-w-3xl mx-auto">
        <Accordion items={faqItems} />
      </Section>

      <Section title="Still have questions?">
        <div className="bg-slate-900/50 border border-white/5 p-8 rounded-2xl text-center">
          <p className="text-slate-400 mb-6">If you couldn't find the answer you were looking for, please feel free to reach out to our team.</p>
          <div className="flex items-center justify-center gap-6">
            <InlineCTA text="Contact Support" link="/support" />
            <span className="text-white/20">|</span>
            <InlineCTA text="Email Us" link="/contact" />
          </div>
        </div>
      </Section>
    </MarketingPageTemplate>
  );
};
