import React from 'react';
import { MarketingPageTemplate } from '../components/ui/MarketingPageTemplate';
import { Section, StatusBadge, Timeline } from '../components/ui/Components';
import { CheckCircle2, AlertCircle, XCircle, Clock } from 'lucide-react';

export const Status: React.FC = () => {
  const systems = [
    { name: 'Data Ingestion API', status: 'operational' as const },
    { name: 'Computational Analysis Engine', status: 'operational' as const },
    { name: 'User Dashboard', status: 'operational' as const },
    { name: 'Mobile App Sync', status: 'degraded' as const },
    { name: 'Research Database', status: 'operational' as const },
    { name: 'Authentication Service', status: 'operational' as const },
  ];

  const incidents = [
    {
      date: '2024-05-20',
      title: 'Mobile App Sync Latency',
      content: 'We are investigating reports of delayed data synchronization between the mobile app and the cloud platform. Our team is working on a fix.',
      icon: <Clock className="text-amber-400" />
    },
    {
      date: '2024-05-15',
      title: 'Scheduled Maintenance Completed',
      content: 'The scheduled maintenance for the Computational Analysis Engine has been successfully completed. All systems are back to normal.',
      icon: <CheckCircle2 className="text-emerald-400" />
    },
    {
      date: '2024-05-10',
      title: 'Intermittent API Connectivity Issues',
      content: 'Some users experienced intermittent connectivity issues with the Data Ingestion API. The root cause was identified and resolved.',
      icon: <AlertCircle className="text-rose-400" />
    }
  ];

  return (
    <MarketingPageTemplate
      title="System Status"
      subtitle="Real-time information on the performance and availability of SomnoAI Digital Sleep Lab services."
    >
      <Section title="Current Status">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {systems.map((system, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 flex items-center justify-between">
              <span className="text-white font-medium">{system.name}</span>
              <StatusBadge status={system.status} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Incident History">
        <div className="max-w-3xl mx-auto">
          <Timeline items={incidents} />
        </div>
      </Section>

      <Section title="Uptime Stats">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-2xl bg-slate-900/30 border border-white/5 text-center">
            <div className="text-3xl font-bold text-white mb-2">99.98%</div>
            <div className="text-sm text-slate-500 uppercase tracking-wider">Last 30 Days</div>
          </div>
          <div className="p-8 rounded-2xl bg-slate-900/30 border border-white/5 text-center">
            <div className="text-3xl font-bold text-white mb-2">99.95%</div>
            <div className="text-sm text-slate-500 uppercase tracking-wider">Last 90 Days</div>
          </div>
          <div className="p-8 rounded-2xl bg-slate-900/30 border border-white/5 text-center">
            <div className="text-3xl font-bold text-white mb-2">0</div>
            <div className="text-sm text-slate-500 uppercase tracking-wider">Major Outages</div>
          </div>
        </div>
      </Section>

      <div className="text-center pt-12 border-t border-white/5">
        <p className="text-slate-500 text-sm mb-6">Want to be notified of incidents?</p>
        <button className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-slate-200 transition-colors">
          Subscribe to Updates
        </button>
      </div>
    </MarketingPageTemplate>
  );
};
