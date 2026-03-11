
import React from 'react';
import { MarketingPageTemplate } from '../components/ui/MarketingPageTemplate';
import { Section, Card, InlineCTA } from '../components/ui/Components';
import { CreditCard, RefreshCw, Lightbulb, Shield, Mail, Users } from 'lucide-react';
import { Language } from '../services/i18n';

interface SupportViewProps {
  lang: Language;
}

export const SupportView: React.FC<SupportViewProps> = ({ lang }) => {
  const isZh = lang === 'zh';

  return (
    <MarketingPageTemplate
      title={isZh ? "SomnoAI Digital Sleep Lab 支持" : "SomnoAI Digital Sleep Lab Support"}
      subtitle={isZh ? "我们在这里帮助您充分利用您的睡眠数据。" : "We're here to help you get the most out of your sleep data."}
      ctaPrimary={{ text: isZh ? "提交工单" : "Submit a Ticket", link: "/contact" }}
      ctaSecondary={{ text: isZh ? "查看常见问题" : "View FAQ", link: "/faq" }}
    >
      <Section title={isZh ? "支持类别" : "Support Categories"}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card 
            title={isZh ? "账户与计费" : "Account & Billing"}
            description={isZh ? "管理您的个人资料、订阅和付款方式。" : "Manage your profile, subscriptions, and payment methods."}
            icon={<CreditCard />}
          />
          <Card 
            title={isZh ? "数据同步问题" : "Data Syncing Issues"}
            description={isZh ? "解决可穿戴设备和健康应用的连接问题。" : "Troubleshoot connection problems with wearables and health apps."}
            icon={<RefreshCw />}
          />
          <Card 
            title={isZh ? "理解见解" : "Understanding Insights"}
            description={isZh ? "了解如何解释您的睡眠数据和行为模式。" : "Learn how to interpret your sleep data and behavioral patterns."}
            icon={<Lightbulb />}
          />
          <Card 
            title={isZh ? "隐私与安全" : "Privacy & Security"}
            description={isZh ? "了解我们如何保护您的数据和管理您的偏好。" : "Understand how we protect your data and manage your preferences."}
            icon={<Shield />}
          />
        </div>
      </Section>

      <Section title={isZh ? "联系选项" : "Contact Options"}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card 
            title={isZh ? "电子邮件支持" : "Email Support"}
            description={isZh ? "向我们的支持团队发送消息，我们将在 24 小时内回复。" : "Send a message to our support team and we'll respond within 24 hours."}
            icon={<Mail />}
            onClick={() => window.location.href = 'mailto:support@sleepsomno.com'}
            className="cursor-pointer hover:border-indigo-500/50 transition-colors"
          />
          <Card 
            title={isZh ? "社区论坛" : "Community Forum"}
            description={isZh ? "加入我们的 Discord 社区，与其他用户讨论和分享想法。" : "Join our Discord community to discuss and share ideas with other users."}
            icon={<Users />}
            onClick={() => window.open('https://discord.com/invite/9EXJtRmju', '_blank')}
            className="cursor-pointer hover:border-indigo-500/50 transition-colors"
          />
        </div>
      </Section>

      <div className="text-center pt-12 border-t border-white/5">
        <div className="flex items-center justify-center gap-6">
          <InlineCTA text={isZh ? "常见问题" : "FAQ"} link="/faq" />
          <span className="text-white/20">|</span>
          <InlineCTA text={isZh ? "系统状态" : "System Status"} link="/status" />
        </div>
      </div>
    </MarketingPageTemplate>
  );
};
