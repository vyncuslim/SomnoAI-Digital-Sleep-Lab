import React from 'react';
import { Link } from 'react-router-dom';
import { MarketingPageTemplate } from '../components/ui/MarketingPageTemplate';
import { Section, Card, InlineCTA } from '../components/ui/Components';
import { Shield, FileText, Lock, AlertTriangle, Scale, Eye, BrainCircuit, ShieldAlert, Database, Ban, BookOpen, Code, CreditCard, RefreshCcw, Bug, MessageSquare, Copyright, Users, FileCheck } from 'lucide-react';
import { Language } from '../services/i18n';

interface LegalHubProps {
  lang: Language;
}

export const LegalHub: React.FC<LegalHubProps> = ({ lang }) => {
  const isZh = lang === 'zh';

  const documents = [
    { title: isZh ? "隐私政策" : "Privacy Policy", description: isZh ? "我们如何收集、使用和保护您的数据。" : "How we collect, use, and protect your data.", link: "/legal/privacy-policy", icon: <Lock /> },
    { title: isZh ? "服务条款" : "Terms of Service", description: isZh ? "使用我们平台的规则和指南。" : "Rules and guidelines for using our platform.", link: "/legal/terms-of-service", icon: <FileText /> },
    { title: isZh ? "Cookie 政策" : "Cookie Policy", description: isZh ? "关于我们如何使用 Cookie 和跟踪技术的信息。" : "Information about how we use cookies and tracking technologies.", link: "/legal/cookies", icon: <Eye /> },
    { title: isZh ? "安全概述" : "Security Overview", description: isZh ? "关于我们的基础设施和数据保护措施的详细信息。" : "Details on our infrastructure and data protection measures.", link: "/legal/security", icon: <Shield /> },
    { title: isZh ? "可接受使用政策" : "Acceptable Use Policy", description: isZh ? "在我们平台上适当行为的指南。" : "Guidelines for appropriate behavior on our platform.", link: "/legal/acceptable-use", icon: <Scale /> },
    { title: isZh ? "AI 免责声明" : "AI Disclaimer", description: isZh ? "关于我们计算模型局限性的重要信息。" : "Important information regarding the limitations of our computational models.", link: "/legal/ai-disclaimer", icon: <BrainCircuit /> },
    { title: isZh ? "医疗免责声明" : "Medical Disclaimer", description: isZh ? "澄清我们的平台不是医疗设备。" : "Clarification that our platform is not a medical device.", link: "/legal/medical-disclaimer", icon: <AlertTriangle /> },
    { title: isZh ? "数据处理说明" : "Data Handling Notice", description: isZh ? "关于我们如何处理用户数据的说明。" : "Summary of how we handle user data in practical terms.", link: "/legal/data-handling", icon: <Database /> },
    { title: isZh ? "滥用政策" : "Abuse Policy", description: isZh ? "我们如何处理滥用或违反政策的报告。" : "How we handle reports of abuse or policy violations.", link: "/legal/abuse-policy", icon: <ShieldAlert /> },
    { title: isZh ? "账户封禁政策" : "Account Blocking Policy", description: isZh ? "账户可能被暂停或终止的条件。" : "Conditions under which accounts may be suspended or terminated.", link: "/legal/account-blocking", icon: <Ban /> },
    { title: isZh ? "政策框架" : "Policy Framework", description: isZh ? "我们在治理和合规方面的总体方法。" : "Our overarching approach to governance and compliance.", link: "/legal/policy-framework", icon: <BookOpen /> },
    { title: isZh ? "开源" : "Open Source", description: isZh ? "关于我们的开源贡献和许可证的信息。" : "Information about our open-source contributions and licenses.", link: "/legal/open-source", icon: <Code /> },
    { title: isZh ? "定价与计费政策" : "Pricing & Billing Policy", description: isZh ? "关于定价、订阅和计费的条款。" : "Terms regarding pricing, subscriptions, and billing.", link: "/legal/pricing-and-billing", icon: <CreditCard /> },
    { title: isZh ? "退款与取消政策" : "Refund & Cancellation Policy", description: isZh ? "关于退款请求和订阅取消的规则。" : "Rules regarding refund requests and subscription cancellations.", link: "/legal/refund-and-cancellation", icon: <RefreshCcw /> },
    { title: isZh ? "漏洞披露政策" : "Vulnerability Disclosure Policy", description: isZh ? "如何安全地报告安全漏洞。" : "How to securely report security vulnerabilities.", link: "/legal/vulnerability-disclosure", icon: <Bug /> },
    { title: isZh ? "申诉与投诉政策" : "Appeals & Complaints Policy", description: isZh ? "处理申诉和正式投诉的流程。" : "Process for handling appeals and formal complaints.", link: "/legal/appeals-and-complaints", icon: <MessageSquare /> },
    { title: isZh ? "知识产权政策" : "Intellectual Property Policy", description: isZh ? "关于所有权、版权和商标的信息。" : "Information about ownership, copyright, and trademarks.", link: "/legal/intellectual-property", icon: <Copyright /> },
    { title: isZh ? "子处理者" : "Sub-processors", description: isZh ? "我们使用的第三方服务提供商列表。" : "List of third-party service providers we use.", link: "/legal/subprocessors", icon: <Users /> },
    { title: isZh ? "数据处理协议 (DPA)" : "Data Processing Agreement (DPA)", description: isZh ? "关于处理个人数据的协议条款。" : "Agreement terms regarding the processing of personal data.", link: "/legal/dpa", icon: <FileCheck /> },
    { title: isZh ? "儿童隐私政策" : "Children’s Privacy", description: isZh ? "我们如何保护儿童的隐私。" : "How we protect children's privacy.", link: "/legal/children-privacy", icon: <Users /> }
  ];

  return (
    <MarketingPageTemplate
      title={isZh ? "法律中心" : "Legal Hub"}
      subtitle={isZh ? "在一个地方访问 SomnoAI Digital Sleep Lab 的法律、隐私、安全、合规和平台治理资源。" : "Access SomnoAI Digital Sleep Lab's legal, privacy, security, compliance, and platform governance resources in one place."}
      ctaPrimary={{ text: isZh ? "隐私政策" : "Privacy Policy", link: "/legal/privacy-policy" }}
      ctaSecondary={{ text: isZh ? "服务条款" : "Terms of Service", link: "/legal/terms-of-service" }}
    >
      <div className="max-w-4xl mx-auto mb-16 text-slate-400 leading-relaxed space-y-4">
        <p>
          {isZh 
            ? "欢迎来到 SomnoAI Digital Sleep Lab 的法律中心。" 
            : "Welcome to the Legal Hub of SomnoAI Digital Sleep Lab."}
        </p>
        <p>
          {isZh
            ? "本页面是我们的法律、隐私、安全、合规和平台治理资源的中央访问点。我们相信信任建立在透明度的基础上，我们致力于使我们的政策易于访问、易于理解且实用。"
            : "This page serves as the central access point for our legal, privacy, security, compliance, and platform governance resources. We believe trust is built through transparency, and we are committed to making our policies accessible, understandable, and practical."}
        </p>
        <p>
          {isZh
            ? "通过此法律中心，您可以查看管理我们的网站、产品、服务和相关数字体验使用的条款。您还可以了解我们如何处理数据、我们如何处理安全和负责任的 AI 使用、我们如何保护平台完整性，以及如何就法律、隐私或安全事宜与我们联系。"
            : "Through this Legal Hub, you can review the terms that govern the use of our website, products, services, and related digital experiences. You can also learn how we handle data, how we approach safety and responsible AI use, how we protect platform integrity, and how to contact us regarding legal, privacy, or security matters."}
        </p>
      </div>

      <Section title={isZh ? "可用资源" : "Available Resources"}>
        <div className="space-y-12">
          <div>
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              {isZh ? "核心法律文件" : "Core Legal Documents"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[documents[0], documents[1], documents[2], documents[3]].map((doc, idx) => (
                <Link key={idx} to={doc.link} className="block h-full">
                  <Card 
                    title={doc.title}
                    description={doc.description}
                    icon={doc.icon}
                    label="CORE"
                    className="h-full cursor-pointer hover:border-indigo-500/50 transition-colors"
                  />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-400" />
              {isZh ? "计费与商业" : "Billing & Commercial"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[documents[12], documents[13]].map((doc, idx) => (
                <Link key={idx} to={doc.link} className="block h-full">
                  <Card 
                    title={doc.title}
                    description={doc.description}
                    icon={doc.icon}
                    label="COMMERCIAL"
                    className="h-full cursor-pointer hover:border-indigo-500/50 transition-colors"
                  />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-400" />
              {isZh ? "治理与合规" : "Governance & Compliance"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[documents[5], documents[6], documents[7], documents[10], documents[14], documents[15], documents[16], documents[17], documents[18], documents[19]].map((doc, idx) => (
                <Link key={idx} to={doc.link} className="block h-full">
                  <Card 
                    title={doc.title}
                    description={doc.description}
                    icon={doc.icon}
                    label="COMPLIANCE"
                    className="h-full cursor-pointer hover:border-indigo-500/50 transition-colors"
                  />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-400" />
              {isZh ? "平台完整性" : "Platform Integrity"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[documents[4], documents[8], documents[9], documents[11]].map((doc, idx) => (
                <Link key={idx} to={doc.link} className="block h-full">
                  <Card 
                    title={doc.title}
                    description={doc.description}
                    icon={doc.icon}
                    label="INTEGRITY"
                    className="h-full cursor-pointer hover:border-indigo-500/50 transition-colors"
                  />
                </Link>
              ))}
            </div>
          </div>

          <div className="p-8 hardware-panel border-indigo-500/20 bg-indigo-500/5">
            <h3 className="text-xl font-bold text-white mb-4">{isZh ? "法律联系" : "Legal Contact"}</h3>
            <p className="text-slate-400 mb-6">
              {isZh 
                ? "如果您有特定的法律查询或需要提交正式请求，请访问我们的法律联系页面。" 
                : "If you have specific legal inquiries or need to submit a formal request, please visit our Legal Contact page."}
            </p>
            <Link 
              to="/legal/contact" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-sm font-bold transition-all"
            >
              {isZh ? "访问法律联系页面" : "Visit Legal Contact Page"}
            </Link>
          </div>
        </div>
      </Section>

      <div className="text-center pt-12 border-t border-white/5">
        <div className="flex items-center justify-center gap-6">
          <InlineCTA text={isZh ? "支持" : "Support"} link="/support" />
        </div>
      </div>
    </MarketingPageTemplate>
  );
};
