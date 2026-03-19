import React from 'react';
import { LegalPageTemplate } from '../components/ui/LegalPageTemplate';

export const LegalContact: React.FC = () => {
  return (
    <LegalPageTemplate
      title="Contact Us"
      lastUpdated="March 18, 2026"
      breadcrumbs={[{ label: 'Legal', link: '/legal' }, { label: 'Legal Contact' }]}
    >
      <div className="text-slate-300 leading-relaxed space-y-6">
        <p>If you need help, have privacy concerns, or need to submit a legal or compliance request, please contact the appropriate channel below.</p>

        <div className="mt-8 space-y-6">
          <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
            <h3 className="text-xl font-bold text-white mb-2">Legal & Privacy Inquiries</h3>
            <p className="text-slate-400 mb-4">For data requests, privacy concerns, or compliance matters.</p>
            <a href="mailto:legal@sleepsomno.com" className="text-indigo-400 hover:text-indigo-300 font-medium">legal@sleepsomno.com</a>
          </div>

          <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
            <h3 className="text-xl font-bold text-white mb-2">General Support</h3>
            <p className="text-slate-400 mb-4">For account assistance, technical issues, or general questions.</p>
            <a href="mailto:support@sleepsomno.com" className="text-indigo-400 hover:text-indigo-300 font-medium">support@sleepsomno.com</a>
          </div>
          
          <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
            <h3 className="text-xl font-bold text-white mb-2">Partnerships</h3>
            <p className="text-slate-400 mb-4">For business inquiries or collaboration opportunities.</p>
            <a href="mailto:partnership@sleepsomno.com" className="text-indigo-400 hover:text-indigo-300 font-medium">partnership@sleepsomno.com</a>
          </div>
        </div>
      </div>
    </LegalPageTemplate>
  );
};
