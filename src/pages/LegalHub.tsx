import React from 'react';
import { Link } from 'react-router-dom';
import { MarketingPageTemplate } from '../components/ui/MarketingPageTemplate';
import { Section, Card, InlineCTA } from '../components/ui/Components';
import { Shield, FileText, Lock, AlertTriangle, Scale, Eye, BrainCircuit, ShieldAlert, Database, Ban, BookOpen, Code } from 'lucide-react';
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
    { title: isZh ? "数据处理协议" : "Data Processing Agreement", description: isZh ? "关于处理个人数据的条款。" : "Terms regarding the processing of personal data.", link: "/legal/data-processing", icon: <Database /> },
    { title: isZh ? "滥用政策" : "Abuse Policy", description: isZh ? "我们如何处理滥用或违反政策的报告。" : "How we handle reports of abuse or policy violations.", link: "/legal/abuse-policy", icon: <ShieldAlert /> },
    { title: isZh ? "账户封禁政策" : "Account Blocking Policy", description: isZh ? "账户可能被暂停或终止的条件。" : "Conditions under which accounts may be suspended or terminated.", link: "/legal/account-blocking", icon: <Ban /> },
    { title: isZh ? "政策框架" : "Policy Framework", description: isZh ? "我们在治理和合规方面的总体方法。" : "Our overarching approach to governance and compliance.", link: "/legal/policy-framework", icon: <BookOpen /> },
    { title: isZh ? "开源" : "Open Source", description: isZh ? "关于我们的开源贡献和许可证的信息。" : "Information about our open-source contributions and licenses.", link: "/legal/open-source", icon: <Code /> }
  ];

  return (
    <MarketingPageTemplate
      title={isZh ? "法律与政策" : "Legal & Policies"}
      subtitle={isZh ? "关于您使用 SomnoAI Digital Sleep Lab 平台的重要信息。" : "Important information regarding your use of the SomnoAI Digital Sleep Lab platform."}
      ctaPrimary={{ text: isZh ? "隐私政策" : "Privacy Policy", link: "/legal/privacy-policy" }}
      ctaSecondary={{ text: isZh ? "服务条款" : "Terms of Service", link: "/legal/terms-of-service" }}
    >
      <Section title={isZh ? "法律文件" : "Legal Documents"}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc, idx) => (
            <Link key={idx} to={doc.link} className="block h-full">
              <Card 
                title={doc.title}
                description={doc.description}
                icon={doc.icon}
                className="h-full cursor-pointer hover:border-indigo-500/50 transition-colors"
              />
            </Link>
          ))}
        </div>
      </Section>

      <div className="text-center pt-12 border-t border-white/5">
        <div className="flex items-center justify-center gap-6">
          <InlineCTA text={isZh ? "联系法务" : "Contact Legal"} link="/contact" />
          <span className="text-white/20">|</span>
          <InlineCTA text={isZh ? "支持" : "Support"} link="/support" />
        </div>
      </div>
    </MarketingPageTemplate>
  );
};
