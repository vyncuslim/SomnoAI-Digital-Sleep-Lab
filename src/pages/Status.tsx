import React from 'react';
import { MarketingPageTemplate } from '../components/ui/MarketingPageTemplate';
import { Section, StatusBadge, Timeline } from '../components/ui/Components';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Language } from '../services/i18n';

interface StatusProps {
  lang: Language;
}

export const Status: React.FC<StatusProps> = ({ lang }) => {
  const systems = [
    { name: lang === 'zh' ? '数据摄取 API' : 'Data Ingestion API', status: 'operational' as const },
    { name: lang === 'zh' ? '计算分析引擎' : 'Computational Analysis Engine', status: 'operational' as const },
    { name: lang === 'zh' ? '用户仪表板' : 'User Dashboard', status: 'operational' as const },
    { name: lang === 'zh' ? '移动应用同步' : 'Mobile App Sync', status: 'degraded' as const },
    { name: lang === 'zh' ? '研究数据库' : 'Research Database', status: 'operational' as const },
    { name: lang === 'zh' ? '身份验证服务' : 'Authentication Service', status: 'operational' as const },
  ];

  const incidents = [
    {
      date: '2024-05-20',
      title: lang === 'zh' ? '移动应用同步延迟' : 'Mobile App Sync Latency',
      description: lang === 'zh' 
        ? '我们正在调查有关移动应用与云平台之间数据同步延迟的报告。我们的团队正在努力修复。'
        : 'We are investigating reports of delayed data synchronization between the mobile app and the cloud platform. Our team is working on a fix.',
      icon: <Clock className="text-amber-400" />
    },
    {
      date: '2024-05-15',
      title: lang === 'zh' ? '计划维护已完成' : 'Scheduled Maintenance Completed',
      description: lang === 'zh'
        ? '计算分析引擎的计划维护已成功完成。所有系统均已恢复正常。'
        : 'The scheduled maintenance for the Computational Analysis Engine has been successfully completed. All systems are back to normal.',
      icon: <CheckCircle2 className="text-emerald-400" />
    },
    {
      date: '2024-05-10',
      title: lang === 'zh' ? '间歇性 API 连接问题' : 'Intermittent API Connectivity Issues',
      description: lang === 'zh'
        ? '部分用户在连接数据摄取 API 时遇到了间歇性问题。根本原因已确定并解决。'
        : 'Some users experienced intermittent connectivity issues with the Data Ingestion API. The root cause was identified and resolved.',
      icon: <AlertCircle className="text-rose-400" />
    }
  ];

  return (
    <MarketingPageTemplate
      title={lang === 'zh' ? "系统状态" : "System Status"}
      subtitle={lang === 'zh' ? "SomnoAI Digital Sleep Lab 服务性能和可用性的实时信息。" : "Real-time information on the performance and availability of SomnoAI Digital Sleep Lab services."}
    >
      <Section title={lang === 'zh' ? "当前状态" : "Current Status"}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {systems.map((system, idx) => (
            <div key={idx} className="p-6 hardware-panel flex items-center justify-between group hover:border-indigo-500/30 transition-colors">
              <div className="flex flex-col">
                <div className="hardware-label mb-1 text-[8px]">SYSTEM NODE {idx + 1}</div>
                <span className="text-white font-bold tracking-tight">{system.name}</span>
              </div>
              <StatusBadge status={system.status} />
            </div>
          ))}
        </div>
      </Section>

      <Section title={lang === 'zh' ? "事件历史" : "Incident History"}>
        <div className="max-w-3xl mx-auto hardware-panel p-8">
          <div className="hardware-label mb-8">LOG HISTORY</div>
          <Timeline events={incidents} />
        </div>
      </Section>

      <Section title={lang === 'zh' ? "运行时间统计" : "Uptime Stats"}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-10 hardware-panel text-center group hover:border-indigo-500/30 transition-colors">
            <div className="hardware-label mb-4">AVAILABILITY</div>
            <div className="text-4xl font-black italic italic uppercase tracking-tighter text-white mb-2 group-hover:text-indigo-400 transition-colors">99.98%</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{lang === 'zh' ? "过去 30 天" : "Last 30 Days"}</div>
          </div>
          <div className="p-10 hardware-panel text-center group hover:border-indigo-500/30 transition-colors">
            <div className="hardware-label mb-4">RELIABILITY</div>
            <div className="text-4xl font-black italic italic uppercase tracking-tighter text-white mb-2 group-hover:text-indigo-400 transition-colors">99.95%</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{lang === 'zh' ? "过去 90 天" : "Last 90 Days"}</div>
          </div>
          <div className="p-10 hardware-panel text-center group hover:border-indigo-500/30 transition-colors">
            <div className="hardware-label mb-4">INCIDENTS</div>
            <div className="text-4xl font-black italic italic uppercase tracking-tighter text-white mb-2 group-hover:text-indigo-400 transition-colors">0</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{lang === 'zh' ? "重大故障" : "Major Outages"}</div>
          </div>
        </div>
      </Section>

      <div className="text-center pt-16 border-t border-white/5">
        <div className="hardware-label mb-6">NOTIFICATIONS</div>
        <p className="text-slate-500 text-sm mb-8 max-w-md mx-auto">{lang === 'zh' ? "想要接收事件通知吗？订阅我们的状态更新。" : "Want to be notified of incidents? Subscribe to our real-time status updates."}</p>
        <button className="px-10 py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-full hover:bg-indigo-500 hover:text-white transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]">
          {lang === 'zh' ? "订阅更新" : "Subscribe to Updates"}
        </button>
      </div>
    </MarketingPageTemplate>
  );
};
