import React from 'react';
import { MarketingPageTemplate } from '../components/ui/MarketingPageTemplate';
import { Section } from '../components/ui/Components';
import { Language } from '../types';

interface MediaResourcesProps {
  lang: Language;
}

export const MediaResources: React.FC<MediaResourcesProps> = ({ lang }) => {
  return (
    <MarketingPageTemplate
      title="Media Resources"
      subtitle="Official resources for journalists, researchers, and partners."
    >
      <Section>
        <div className="prose prose-invert max-w-none text-slate-300">
          <p className="text-lg leading-relaxed mb-8">
            The Media Resources section provides journalists, researchers, and partners
            with official information about SomnoAI Digital Sleep Lab. The materials
            available here include brand guidelines, executive biographies, and
            organizational fact sheets intended to support accurate media coverage
            and public understanding of the project.
          </p>

          <div className="space-y-4">
            {/* Brand Assets */}
            <details className="group bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-white/5 transition-colors font-bold text-xl text-white list-none select-none">
                <span>Brand Assets</span>
                <span className="transform group-open:rotate-180 transition-transform text-indigo-400">
                  ▼
                </span>
              </summary>
              <div className="p-6 pt-0 border-t border-white/10 mt-4">
                <h3 className="text-xl font-semibold text-white mb-4">Logos, Colors, and Brand Guidelines</h3>
                <p className="mb-4">
                  The SomnoAI Digital Sleep Lab brand represents a research-driven initiative
                  focused on exploring sleep patterns through artificial intelligence and
                  computational analysis. The visual identity of the project is designed
                  to reflect clarity, scientific exploration, and technological innovation.
                </p>
                <p className="mb-4">
                  Brand assets include official logos, typography guidance, and color
                  standards that may be used when referencing SomnoAI Digital Sleep Lab
                  in publications, presentations, or research discussions.
                </p>
                <p className="mb-4">
                  When using brand materials, media outlets and collaborators are encouraged
                  to maintain the original proportions and visual integrity of the logo.
                  Logos should not be modified, distorted, or recolored outside the
                  approved brand palette.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Primary Logo</li>
                  <li>Favicon and small-format logo</li>
                  <li>Color palette and usage guidelines</li>
                  <li>Typography recommendations</li>
                  <li>Visual identity standards</li>
                </ul>
              </div>
            </details>

            {/* Executive Bios */}
            <details className="group bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-white/5 transition-colors font-bold text-xl text-white list-none select-none">
                <span>Executive Bios</span>
                <span className="transform group-open:rotate-180 transition-transform text-indigo-400">
                  ▼
                </span>
              </summary>
              <div className="p-6 pt-0 border-t border-white/10 mt-4">
                <h3 className="text-xl font-semibold text-white mb-4">Leadership Background</h3>
                <p className="mb-6">
                  The leadership team associated with SomnoAI Digital Sleep Lab focuses on
                  technology development, digital research exploration, and the application
                  of artificial intelligence to behavioral data analysis.
                </p>

                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-indigo-400 mb-2">Vyncus Lim</h4>
                  <p className="mb-4">
                    Vyncus Lim is the founder of SomnoAI Digital Sleep Lab and leads the
                    development of the platform’s technological and research direction.
                    His work focuses on exploring how artificial intelligence systems can
                    interpret behavioral data signals related to sleep patterns.
                  </p>
                  <p>
                    Through the SomnoAI Digital Sleep Lab initiative, he investigates how
                    machine learning and computational models can translate complex sleep
                    metrics into structured insights that individuals can understand.
                    The project represents an exploration of how emerging digital
                    technologies can contribute to better awareness of human sleep behavior.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-indigo-400 mb-2">Damocles Tang Yu Liang</h4>
                  <p className="mb-4">
                    Damocles Tang Yu Liang is associated with collaborative initiatives
                    related to SomnoAI Digital Sleep Lab. His contributions involve
                    supporting technological exploration and interdisciplinary discussions
                    around the application of artificial intelligence in digital health
                    and behavioral data analysis.
                  </p>
                  <p>
                    The collaboration reflects a broader interest in understanding how
                    modern computational tools can assist in interpreting patterns in
                    everyday human behavior, including sleep and recovery cycles.
                  </p>
                </div>
              </div>
            </details>

            {/* Fact Sheet */}
            <details className="group bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-white/5 transition-colors font-bold text-xl text-white list-none select-none">
                <span>Fact Sheet</span>
                <span className="transform group-open:rotate-180 transition-transform text-indigo-400">
                  ▼
                </span>
              </summary>
              <div className="p-6 pt-0 border-t border-white/10 mt-4">
                <h3 className="text-xl font-semibold text-white mb-4">SomnoAI Digital Sleep Lab Overview</h3>
                <p className="mb-6">
                  SomnoAI Digital Sleep Lab is a digital research initiative exploring
                  the relationship between artificial intelligence and human sleep
                  behavior. The platform investigates how machine learning models and
                  data analysis techniques can help interpret sleep-related signals
                  generated by digital technologies.
                </p>

                <ul className="space-y-2 mb-6 bg-black/20 p-4 rounded-lg">
                  <li><strong className="text-indigo-300">Project Name:</strong> SomnoAI Digital Sleep Lab</li>
                  <li><strong className="text-indigo-300">Focus Area:</strong> Artificial Intelligence and Sleep Data Analysis</li>
                  <li><strong className="text-indigo-300">Technology:</strong> Machine Learning, Behavioral Data Processing</li>
                  <li><strong className="text-indigo-300">Platform Type:</strong> Digital Research and Analytical Platform</li>
                  <li><strong className="text-indigo-300">Primary Objective:</strong> Explore computational interpretation of sleep patterns</li>
                </ul>

                <p className="mb-4">
                  The platform studies how digital signals such as sleep timing,
                  duration, and behavioral routines may reveal patterns that influence
                  sleep cycles. By applying computational models to these datasets,
                  SomnoAI Digital Sleep Lab aims to generate insights that help users
                  observe trends in their sleep behavior.
                </p>

                <p>
                  The project is part of a broader exploration of how artificial
                  intelligence can assist in interpreting complex behavioral data
                  and contribute to the evolving field of digital health technology.
                </p>
              </div>
            </details>
          </div>
        </div>
      </Section>
    </MarketingPageTemplate>
  );
};
