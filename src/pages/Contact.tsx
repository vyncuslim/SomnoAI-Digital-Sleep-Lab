import React, { useState } from 'react';
import { MarketingPageTemplate } from '../components/ui/MarketingPageTemplate';
import { Section, Card, InlineCTA } from '../components/ui/Components';
import { Mail, MessageSquare, MapPin, Globe, Check } from 'lucide-react';
import { Language } from '../services/i18n';

interface ContactProps {
  lang: Language;
}

export const Contact: React.FC<ContactProps> = ({ lang }) => {
  const [agreed, setAgreed] = useState(false);

  return (
    <MarketingPageTemplate
      title={lang === 'zh' ? "联系我们" : "Contact Us"}
      subtitle={lang === 'zh' ? "对平台、研究或合作机会有疑问？我们很乐意听取您的意见。" : "Have a question about the platform, research, or collaboration opportunities? We'd love to hear from you."}
      ctaPrimary={{ text: lang === 'zh' ? "发送邮件" : "Email Support", link: "mailto:support@sleepsomno.com" }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Left Column: Contact Methods */}
        <div className="space-y-8">
          <Section title={lang === 'zh' ? "联系方式" : "Contact Methods"}>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <Mail className="w-6 h-6 text-indigo-400 mt-1" />
                <div>
                  <h4 className="text-white font-bold mb-1">{lang === 'zh' ? "一般咨询" : "General Inquiries"}</h4>
                  <a href="mailto:admin@sleepsomno.com" className="text-slate-400 hover:text-indigo-400 transition-colors block">admin@sleepsomno.com</a>
                  <a href="mailto:contact@sleepsomno.com" className="text-slate-400 hover:text-indigo-400 transition-colors block">contact@sleepsomno.com</a>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <MessageSquare className="w-6 h-6 text-indigo-400 mt-1" />
                <div>
                  <h4 className="text-white font-bold mb-1">{lang === 'zh' ? "用户支持" : "User Support"}</h4>
                  <a href="mailto:support@sleepsomno.com" className="text-slate-400 hover:text-indigo-400 transition-colors block">support@sleepsomno.com</a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <Globe className="w-6 h-6 text-indigo-400 mt-1" />
                <div>
                  <h4 className="text-white font-bold mb-1">{lang === 'zh' ? "合作与法律" : "Partnerships & Legal"}</h4>
                  <a href="mailto:partners@sleepsomno.com" className="text-slate-400 hover:text-indigo-400 transition-colors block">partners@sleepsomno.com</a>
                  <a href="mailto:legal@sleepsomno.com" className="text-slate-400 hover:text-indigo-400 transition-colors block">legal@sleepsomno.com</a>
                </div>
              </div>
            </div>
          </Section>

          <Card 
            title={lang === 'zh' ? "合作机会" : "Collaboration"} 
            description={lang === 'zh' ? "我们欢迎来自研究人员、开发人员和公众的咨询、反馈和合作机会。请在联系时提供明确的信息，以便我们提供适当的回复。" : "We welcome inquiries, feedback, and collaboration opportunities from researchers, developers, and members of the public. Please provide clear information so we can respond appropriately."}
          />
        </div>

        {/* Right Column: Form */}
        <div>
          <Section title={lang === 'zh' ? "发送消息" : "Send a Message"}>
            <form className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/10" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">{lang === 'zh' ? "主题" : "Topic"}</label>
                <select className="w-full bg-[#01040a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors">
                  <option>{lang === 'zh' ? "一般咨询" : "General Inquiry"}</option>
                  <option>{lang === 'zh' ? "研究合作" : "Research Collaboration"}</option>
                  <option>{lang === 'zh' ? "技术支持" : "Technical Support"}</option>
                  <option>{lang === 'zh' ? "媒体与公关" : "Media & Press"}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">{lang === 'zh' ? "您的邮箱" : "Your Email"}</label>
                <input type="email" placeholder="email@example.com" className="w-full bg-[#01040a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">{lang === 'zh' ? "消息内容" : "Message"}</label>
                <textarea rows={5} placeholder={lang === 'zh' ? "请在此输入您的消息..." : "How can we help you?"} className="w-full bg-[#01040a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"></textarea>
              </div>

              <div className="flex items-start gap-3 py-2">
                <button 
                  type="button"
                  onClick={() => setAgreed(!agreed)}
                  className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors ${agreed ? 'bg-indigo-500 border-indigo-500' : 'bg-[#01040a] border-white/20'}`}
                >
                  {agreed && <Check className="w-3 h-3 text-white" />}
                </button>
                <span className="text-sm text-slate-400 cursor-pointer" onClick={() => setAgreed(!agreed)}>
                  {lang === 'zh' ? "我同意隐私政策并允许处理我的联系信息。" : "I agree to the Privacy Policy and consent to the processing of my contact information."}
                </span>
              </div>

              <button 
                type="submit" 
                disabled={!agreed}
                className={`w-full py-3 rounded-lg font-bold transition-all ${agreed ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-white/5 text-slate-500 cursor-not-allowed'}`}
              >
                {lang === 'zh' ? "发送消息" : "Send Message"}
              </button>
            </form>
          </Section>
        </div>
      </div>

      <div className="text-center pt-12 border-t border-white/5">
        <div className="flex items-center justify-center gap-6">
          <InlineCTA text={lang === 'zh' ? "政策框架" : "Policy Framework"} link="/legal/policy-framework" />
          <span className="text-white/20">|</span>
          <InlineCTA text={lang === 'zh' ? "用户支持" : "Support"} link="/support" />
        </div>
      </div>
    </MarketingPageTemplate>
  );
};
