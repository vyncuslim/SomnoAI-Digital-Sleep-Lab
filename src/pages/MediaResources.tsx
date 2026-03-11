import React from 'react';
import { MarketingPageTemplate } from '../components/ui/MarketingPageTemplate';
import { Section } from '../components/ui/Components';
import { Language } from '../types';

interface MediaResourcesProps {
  lang: Language;
}

export const MediaResources: React.FC<MediaResourcesProps> = () => {
  return (
    <MarketingPageTemplate
      title="Media Resources"
      subtitle="Official resources for journalists, researchers, and partners."
    >
      <Section>
        <div className="space-y-12">
          <p className="text-xl leading-relaxed text-slate-400 max-w-3xl">
            The Media Resources section provides journalists, researchers, and partners
            with official information about SomnoAI Digital Sleep Lab. The materials
            available here include brand guidelines, executive biographies, and
            organizational fact sheets intended to support accurate media coverage
            and public understanding of the project.
          </p>

          {/* Brand Assets */}
          <div className="hardware-panel p-8">
            <div className="hardware-label mb-6">BRAND ASSETS</div>
            <div className="prose prose-invert max-w-none text-slate-300">
              <h3 className="text-white font-bold text-2xl mb-4">Logos, Colors, and Brand Guidelines</h3>
              <p>
                The SomnoAI Digital Sleep Lab brand represents a research-driven initiative
                focused on exploring sleep patterns through artificial intelligence and
                computational analysis. The visual identity of the project is designed
                to reflect clarity, scientific exploration, and technological innovation.
              </p>
              <p>
                Brand assets include official logos, typography guidance, and color
                standards that may be used when referencing SomnoAI Digital Sleep Lab
                in publications, presentations, or research discussions.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                <ul className="space-y-2 list-none p-0">
                  <li className="flex items-center gap-2 text-sm font-medium text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    Primary Logo
                  </li>
                  <li className="flex items-center gap-2 text-sm font-medium text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    Favicon and small-format logo
                  </li>
                  <li className="flex items-center gap-2 text-sm font-medium text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    Color palette and usage guidelines
                  </li>
                </ul>
                <ul className="space-y-2 list-none p-0">
                  <li className="flex items-center gap-2 text-sm font-medium text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    Typography recommendations
                  </li>
                  <li className="flex items-center gap-2 text-sm font-medium text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    Visual identity standards
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Executive Bios */}
          <div className="hardware-panel p-8">
            <div className="hardware-label mb-6">EXECUTIVE BIOS</div>
            <div className="prose prose-invert max-w-none text-slate-300">
              <h3 className="text-white font-bold text-2xl mb-4">Leadership Background</h3>
              <p className="mb-8">
                The leadership team associated with SomnoAI Digital Sleep Lab focuses on
                technology development, digital research exploration, and the application
                of artificial intelligence to behavioral data analysis.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <h4 className="text-indigo-400 font-black italic uppercase tracking-tighter text-xl">Vyncus Lim</h4>
                  <p className="text-sm leading-relaxed">
                    Vyncus Lim is the founder of SomnoAI Digital Sleep Lab and leads the
                    development of the platform’s technological and research direction.
                    His work focuses on exploring how artificial intelligence systems can
                    interpret behavioral data signals related to sleep patterns.
                  </p>
                </div>
                <div className="space-y-4">
                  <h4 className="text-indigo-400 font-black italic uppercase tracking-tighter text-xl">Damocles Tang Yu Liang</h4>
                  <p className="text-sm leading-relaxed">
                    Damocles Tang Yu Liang is associated with collaborative initiatives
                    related to SomnoAI Digital Sleep Lab. His contributions involve
                    supporting technological exploration and interdisciplinary discussions
                    around the application of artificial intelligence in digital health
                    and behavioral data analysis.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Fact Sheet */}
          <div className="hardware-panel p-8">
            <div className="hardware-label mb-6">FACT SHEET</div>
            <div className="prose prose-invert max-w-none text-slate-300">
              <h3 className="text-white font-bold text-2xl mb-4">SomnoAI Digital Sleep Lab Overview</h3>
              <p className="mb-8">
                SomnoAI Digital Sleep Lab is a digital research initiative exploring
                the relationship between artificial intelligence and human sleep
                behavior.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Project Name", value: "SomnoAI Digital Sleep Lab" },
                  { label: "Focus Area", value: "Artificial Intelligence and Sleep Data Analysis" },
                  { label: "Technology", value: "Machine Learning, Behavioral Data Processing" },
                  { label: "Platform Type", value: "Digital Research and Analytical Platform" },
                  { label: "Primary Objective", value: "Explore computational interpretation of sleep patterns" }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col p-4 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">{item.label}</span>
                    <span className="text-sm font-bold text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>
    </MarketingPageTemplate>
  );
};
