import React from 'react';
import { Link } from 'react-router-dom';
import { PageLayout } from '../components/ui/PageLayout';
import { Hero, Card, InlineCTA } from '../components/ui/Components';
import { Shield, FileText, Lock, AlertTriangle, Scale, Eye } from 'lucide-react';

export const LegalHub: React.FC = () => {
  return (
    <PageLayout>
      <Hero 
        title="Legal & Policy Center" 
        subtitle="SomnoAI Digital Sleep Lab operates under a comprehensive legal framework designed to protect both the platform and its users. This section provides an overview of our legal standing and governing principles." 
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Core Documents</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Link to="/legal/terms-of-service"><Card title="Terms of Service" description="Rules and guidelines for using the SomnoAI Digital Sleep Lab platform." icon={<FileText />} className="cursor-pointer hover:bg-slate-800/50 h-full" /></Link>
                <Link to="/legal/privacy-policy"><Card title="Privacy Policy" description="How we collect, use, and protect your personal information." icon={<Lock />} className="cursor-pointer hover:bg-slate-800/50 h-full" /></Link>
                <Link to="/legal/cookies"><Card title="Cookie Policy" description="Information about how we use cookies and tracking technologies." icon={<Eye />} className="cursor-pointer hover:bg-slate-800/50 h-full" /></Link>
                <Link to="/legal/security"><Card title="Security Policy" description="Our approach to protecting infrastructure and user data." icon={<Shield />} className="cursor-pointer hover:bg-slate-800/50 h-full" /></Link>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Disclaimers & Usage</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Link to="/legal/medical-disclaimer"><Card title="Medical Disclaimer" description="Important information regarding the non-medical nature of our service." icon={<AlertTriangle />} className="cursor-pointer hover:bg-slate-800/50 h-full" /></Link>
                <Link to="/legal/ai-disclaimer"><Card title="AI Usage Disclaimer" description="Understanding the probabilistic nature of AI-generated insights." icon={<BrainCircuit />} className="cursor-pointer hover:bg-slate-800/50 h-full" /></Link>
                <Link to="/legal/acceptable-use"><Card title="Acceptable Use" description="Community standards and prohibited activities on the platform." icon={<Scale />} className="cursor-pointer hover:bg-slate-800/50 h-full" /></Link>
                <Link to="/legal/abuse-policy"><Card title="Abuse Policy" description="How to report misuse and our process for handling violations." icon={<ShieldAlert />} className="cursor-pointer hover:bg-slate-800/50 h-full" /></Link>
              </div>
            </div>
          </div>

          <aside className="space-y-8">
            <div className="p-8 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
              <h3 className="text-xl font-bold text-indigo-400 mb-4">Transparency Commitments</h3>
              <ul className="space-y-4 text-slate-300 text-sm">
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                  <span>We only collect data you explicitly authorize.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                  <span>We do not sell your personal data to third parties.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                  <span>You can delete your account and data at any time.</span>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900/50 border border-white/5">
              <h3 className="text-lg font-bold text-white mb-4">Need Legal Help?</h3>
              <p className="text-sm text-slate-400 mb-6">
                For specific legal inquiries or requests related to your data, please contact our legal team.
              </p>
              <InlineCTA text="Contact Legal" link="/contact" />
            </div>
          </aside>
        </div>
      </div>
    </PageLayout>
  );
};

// Mock icons for the ones not imported above to avoid errors in this snippet
const BrainCircuit = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M9 13a4.5 4.5 0 0 0 3-4"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M10.8 17.59a4 4 0 0 0 .5 1.378"/><path d="M14 19c3 0 4.6-1.6 4.6-1.6"/><path d="M15.5 15c1.5 0 3 1.5 3 1.5"/><path d="M18.6 17.4c2 0 3.4-2.2 3.4-2.2"/><path d="M15.5 15c-1.5 0-3 1.5-3 1.5"/><path d="M14 19c-3 0-4.6-1.6-4.6-1.6"/><path d="M18.6 17.4c-2 0-3.4-2.2-3.4-2.2"/></svg>;
const ShieldAlert = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>;
const CheckCircle2 = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>;
