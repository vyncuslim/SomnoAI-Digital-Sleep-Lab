import React from 'react';
import { Link } from 'react-router-dom';
import { PageLayout } from '../components/ui/PageLayout';
import { Hero, Card, InlineCTA } from '../components/ui/Components';
import { Shield, FileText, Lock, AlertTriangle, Scale, Eye, BrainCircuit, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Language, getTranslation } from '../services/i18n';

interface LegalHubProps {
  lang: Language;
}

export const LegalHub: React.FC<LegalHubProps> = ({ lang }) => {
  return (
    <PageLayout>
      <Hero 
        title={lang === 'zh' ? "法律与政策中心" : "Legal & Policy Center"} 
        subtitle={lang === 'zh' ? "Digital Sleep Lab 在旨在保护平台及其用户的综合法律框架下运营。本节概述了我们的法律地位和管理原则。" : "Digital Sleep Lab operates under a comprehensive legal framework designed to protect both the platform and its users. This section provides an overview of our legal standing and governing principles."} 
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">{lang === 'zh' ? "核心文件" : "Core Documents"}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Link to="/legal/terms-of-service"><Card title={lang === 'zh' ? "服务条款" : "Terms of Service"} description={lang === 'zh' ? "使用 Digital Sleep Lab 平台的规则和准则。" : "Rules and guidelines for using the Digital Sleep Lab platform."} icon={<FileText />} className="cursor-pointer hover:bg-slate-800/50 h-full" /></Link>
                <Link to="/legal/privacy-policy"><Card title={lang === 'zh' ? "隐私政策" : "Privacy Policy"} description={lang === 'zh' ? "我们如何收集、使用和保护您的个人信息。" : "How we collect, use, and protect your personal information."} icon={<Lock />} className="cursor-pointer hover:bg-slate-800/50 h-full" /></Link>
                <Link to="/legal/cookies"><Card title={lang === 'zh' ? "Cookie 政策" : "Cookie Policy"} description={lang === 'zh' ? "关于我们如何使用 Cookie 和跟踪技术的信息。" : "Information about how we use cookies and tracking technologies."} icon={<Eye />} className="cursor-pointer hover:bg-slate-800/50 h-full" /></Link>
                <Link to="/legal/security"><Card title={lang === 'zh' ? "安全政策" : "Security Policy"} description={lang === 'zh' ? "我们保护基础设施和用户数据的方法。" : "Our approach to protecting infrastructure and user data."} icon={<Shield />} className="cursor-pointer hover:bg-slate-800/50 h-full" /></Link>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-6">{lang === 'zh' ? "免责声明与使用" : "Disclaimers & Usage"}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Link to="/legal/medical-disclaimer"><Card title={lang === 'zh' ? "医疗免责声明" : "Medical Disclaimer"} description={lang === 'zh' ? "关于我们服务的非医疗性质的重要信息。" : "Important information regarding the non-medical nature of our service."} icon={<AlertTriangle />} className="cursor-pointer hover:bg-slate-800/50 h-full" /></Link>
                <Link to="/legal/ai-disclaimer"><Card title={lang === 'zh' ? "AI 使用免责声明" : "AI Usage Disclaimer"} description={lang === 'zh' ? "了解 AI 生成见解的概率性质。" : "Understanding the probabilistic nature of AI-generated insights."} icon={<BrainCircuit />} className="cursor-pointer hover:bg-slate-800/50 h-full" /></Link>
                <Link to="/legal/acceptable-use"><Card title={lang === 'zh' ? "可接受使用" : "Acceptable Use"} description={lang === 'zh' ? "平台上的社区标准和禁止活动。" : "Community standards and prohibited activities on the platform."} icon={<Scale />} className="cursor-pointer hover:bg-slate-800/50 h-full" /></Link>
                <Link to="/legal/abuse-policy"><Card title={lang === 'zh' ? "滥用政策" : "Abuse Policy"} description={lang === 'zh' ? "如何报告滥用行为以及我们处理违规行为的流程。" : "How to report misuse and our process for handling violations."} icon={<ShieldAlert />} className="cursor-pointer hover:bg-slate-800/50 h-full" /></Link>
              </div>
            </div>
          </div>

          <aside className="space-y-8">
            <div className="p-8 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
              <h3 className="text-xl font-bold text-indigo-400 mb-4">{lang === 'zh' ? "透明度承诺" : "Transparency Commitments"}</h3>
              <ul className="space-y-4 text-slate-300 text-sm">
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                  <span>{lang === 'zh' ? "我们仅收集您明确授权的数据。" : "We only collect data you explicitly authorize."}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                  <span>{lang === 'zh' ? "我们不会将您的个人数据出售给第三方。" : "We do not sell your personal data to third parties."}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                  <span>{lang === 'zh' ? "您可以随时删除您的帐户和数据。" : "You can delete your account and data at any time."}</span>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900/50 border border-white/5">
              <h3 className="text-lg font-bold text-white mb-4">{lang === 'zh' ? "需要法律帮助？" : "Need Legal Help?"}</h3>
              <p className="text-sm text-slate-400 mb-6">
                {lang === 'zh' ? "对于特定的法律查询或与您的数据相关的请求，请联系我们的法律团队。" : "For specific legal inquiries or requests related to your data, please contact our legal team."}
              </p>
              <InlineCTA text={lang === 'zh' ? "联系法务" : "Contact Legal"} link="/contact" />
            </div>
          </aside>
        </div>
      </div>
    </PageLayout>
  );
};
