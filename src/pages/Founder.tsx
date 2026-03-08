import React from 'react';
import { MarketingPageTemplate } from '../components/ui/MarketingPageTemplate';
import { Section, InlineCTA } from '../components/ui/Components';
import { Linkedin, Globe, MessageSquare } from 'lucide-react';
import { Language } from '../services/i18n';
import { INFO_CONTENT } from '../data/infoContent';

interface FounderProps {
  lang: Language;
}

export const Founder: React.FC<FounderProps> = ({ lang }) => {
  const content = INFO_CONTENT[lang]?.founder || INFO_CONTENT['en'].founder;

  return (
    <MarketingPageTemplate
      title={content.title}
      subtitle={content.subtitle}
    >
      <Section>
        <div className="flex flex-col md:flex-row gap-12 items-start">
          <div className="w-full md:w-1/3 sticky top-32">
            <div className="aspect-square rounded-3xl overflow-hidden bg-slate-900 border border-white/10 relative group mb-6">
              <img 
                src="https://picsum.photos/seed/founder/800/800" 
                alt="Founder" 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#01040a] via-transparent to-transparent opacity-60" />
            </div>
            
            <div className="space-y-4">
              <div className="p-8 hardware-panel">
                <h4 className="hardware-label mb-6">{lang === 'zh' ? "官方渠道" : "Official Channels"}</h4>
                <div className="grid grid-cols-1 gap-4">
                  <a href="https://www.linkedin.com/in/vyncuslim-lim-761300375" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-400 hover:text-indigo-400 transition-colors text-sm font-medium group">
                    <div className="p-2 bg-white/5 rounded-lg group-hover:bg-indigo-500/10 transition-colors">
                      <Linkedin size={16} />
                    </div>
                    LinkedIn
                  </a>
                  <a href="https://sleepsomno.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-400 hover:text-indigo-400 transition-colors text-sm font-medium group">
                    <div className="p-2 bg-white/5 rounded-lg group-hover:bg-indigo-500/10 transition-colors">
                      <Globe size={16} />
                    </div>
                    Website
                  </a>
                  <a href="https://discord.gg/McrBeJXG8" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-400 hover:text-indigo-400 transition-colors text-sm font-medium group">
                    <div className="p-2 bg-white/5 rounded-lg group-hover:bg-indigo-500/10 transition-colors">
                      <MessageSquare size={16} />
                    </div>
                    Discord
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-2/3">
            <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap text-lg leading-relaxed">
              {content.content}
            </div>
          </div>
        </div>
      </Section>

      <div className="text-center pt-12 border-t border-white/5">
        <InlineCTA text={lang === 'zh' ? "阅读我们的使命" : "Read our Mission"} link="/about" />
      </div>
    </MarketingPageTemplate>
  );
};
