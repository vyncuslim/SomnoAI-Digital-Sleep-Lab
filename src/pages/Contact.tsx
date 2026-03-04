import React from 'react';
import { MarketingPageTemplate } from '../components/ui/MarketingPageTemplate';
import { Section, Card, InlineCTA } from '../components/ui/Components';
import { Mail, MessageSquare, MapPin, Globe } from 'lucide-react';

export const Contact: React.FC = () => {
  return (
    <MarketingPageTemplate
      title="Contact Us"
      subtitle="Have a question about the platform, research, or collaboration opportunities? We'd love to hear from you."
    >
      <Section title="Get in Touch">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card 
            title="General Inquiries" 
            description="For general questions about the SomnoAI Digital Sleep Lab platform."
            icon={<Globe />}
          >
            <div className="mt-4 pt-4 border-t border-white/5">
              <a href="mailto:info@somnoai.com" className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm font-medium">info@somnoai.com</a>
            </div>
          </Card>
          <Card 
            title="Research & Collaboration" 
            description="For academic inquiries and research partnership opportunities."
            icon={<MessageSquare />}
          >
            <div className="mt-4 pt-4 border-t border-white/5">
              <a href="mailto:research@somnoai.com" className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm font-medium">research@somnoai.com</a>
            </div>
          </Card>
          <Card 
            title="Support" 
            description="For technical assistance and platform-related support."
            icon={<Mail />}
          >
            <div className="mt-4 pt-4 border-t border-white/5">
              <a href="mailto:support@somnoai.com" className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm font-medium">support@somnoai.com</a>
            </div>
          </Card>
          <Card 
            title="Office" 
            description="Our physical research location and administrative office."
            icon={<MapPin />}
          >
            <div className="mt-4 pt-4 border-t border-white/5">
              <span className="text-slate-400 text-sm">Digital Sleep Lab, Tech Hub, 123 Innovation Way</span>
            </div>
          </Card>
        </div>
      </Section>

      <Section title="Send us a Message">
        <div className="max-w-3xl mx-auto bg-slate-900/50 border border-white/5 p-8 rounded-2xl">
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Full Name</label>
                <input type="text" className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Email Address</label>
                <input type="email" className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" placeholder="john@example.com" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Subject</label>
              <select className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all">
                <option>General Inquiry</option>
                <option>Research Collaboration</option>
                <option>Technical Support</option>
                <option>Press & Media</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Message</label>
              <textarea rows={6} className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none" placeholder="How can we help you?"></textarea>
            </div>
            <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/25">
              Send Message
            </button>
          </form>
        </div>
      </Section>

      <div className="text-center pt-12 border-t border-white/5">
        <div className="flex items-center justify-center gap-6">
          <InlineCTA text="FAQ" link="/faq" />
          <span className="text-white/20">|</span>
          <InlineCTA text="System Status" link="/status" />
        </div>
      </div>
    </MarketingPageTemplate>
  );
};
