import React from 'react';
import { MarketingPageTemplate } from '../components/ui/MarketingPageTemplate';
import { Section, Card, InlineCTA } from '../components/ui/Components';
import { Mail, MessageSquare, MapPin, Globe } from 'lucide-react';
import { Language, getTranslation } from '../services/i18n';

interface ContactProps {
  lang: Language;
}

export const Contact: React.FC<ContactProps> = ({ lang }) => {
  return (
    <MarketingPageTemplate
      title={lang === 'zh' ? "联系我们" : "Contact Us"}
      subtitle={lang === 'zh' ? "对平台、研究或合作机会有疑问？我们很乐意听取您的意见。" : "Have a question about the platform, research, or collaboration opportunities? We'd love to hear from you."}
    >
      <Section title={lang === 'zh' ? "取得联系" : "Get in Touch"}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card 
            title={lang === 'zh' ? "一般查询" : "General Inquiries"} 
            description={lang === 'zh' ? "关于 Digital Sleep Lab 平台的一般问题。" : "For general questions about the Digital Sleep Lab platform."}
            icon={<Globe />}
          >
            <div className="mt-4 pt-4 border-t border-white/5">
              <a href="mailto:info@digitalsleeplab.com" className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm font-medium">info@digitalsleeplab.com</a>
            </div>
          </Card>
          <Card 
            title={lang === 'zh' ? "研究与合作" : "Research & Collaboration"} 
            description={lang === 'zh' ? "学术查询和研究伙伴关系机会。" : "For academic inquiries and research partnership opportunities."}
            icon={<MessageSquare />}
          >
            <div className="mt-4 pt-4 border-t border-white/5">
              <a href="mailto:research@digitalsleeplab.com" className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm font-medium">research@digitalsleeplab.com</a>
            </div>
          </Card>
          <Card 
            title={lang === 'zh' ? "支持" : "Support"} 
            description={lang === 'zh' ? "技术援助和平台相关支持。" : "For technical assistance and platform-related support."}
            icon={<Mail />}
          >
            <div className="mt-4 pt-4 border-t border-white/5">
              <a href="mailto:support@digitalsleeplab.com" className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm font-medium">support@digitalsleeplab.com</a>
            </div>
          </Card>
          <Card 
            title={lang === 'zh' ? "办公室" : "Office"} 
            description={lang === 'zh' ? "我们的实体研究地点和行政办公室。" : "Our physical research location and administrative office."}
            icon={<MapPin />}
          >
            <div className="mt-4 pt-4 border-t border-white/5">
              <span className="text-slate-400 text-sm">{lang === 'zh' ? "数字睡眠实验室，技术中心，创新路 123 号" : "Digital Sleep Lab, Tech Hub, 123 Innovation Way"}</span>
            </div>
          </Card>
        </div>
      </Section>

      <Section title={lang === 'zh' ? "给我们留言" : "Send us a Message"}>
        <div className="max-w-3xl mx-auto bg-slate-900/50 border border-white/5 p-8 rounded-2xl">
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">{lang === 'zh' ? "全名" : "Full Name"}</label>
                <input type="text" className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" placeholder={lang === 'zh' ? "张三" : "John Doe"} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">{lang === 'zh' ? "电子邮件地址" : "Email Address"}</label>
                <input type="email" className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" placeholder="john@example.com" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">{lang === 'zh' ? "主题" : "Subject"}</label>
              <select className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all">
                <option>{lang === 'zh' ? "一般查询" : "General Inquiry"}</option>
                <option>{lang === 'zh' ? "研究合作" : "Research Collaboration"}</option>
                <option>{lang === 'zh' ? "技术支持" : "Technical Support"}</option>
                <option>{lang === 'zh' ? "新闻与媒体" : "Press & Media"}</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">{lang === 'zh' ? "留言" : "Message"}</label>
              <textarea rows={6} className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none" placeholder={lang === 'zh' ? "我们能为您提供什么帮助？" : "How can we help you?"}></textarea>
            </div>
            <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/25">
              {lang === 'zh' ? "发送留言" : "Send Message"}
            </button>
          </form>
        </div>
      </Section>

      <div className="text-center pt-12 border-t border-white/5">
        <div className="flex items-center justify-center gap-6">
          <InlineCTA text="FAQ" link="/faq" />
          <span className="text-white/20">|</span>
          <InlineCTA text={lang === 'zh' ? "系统状态" : "System Status"} link="/status" />
        </div>
      </div>
    </MarketingPageTemplate>
  );
};
