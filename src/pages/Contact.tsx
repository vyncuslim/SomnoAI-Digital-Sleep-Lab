import React, { useState } from 'react';
import { MarketingPageTemplate } from '../components/ui/MarketingPageTemplate';
import { Section, Card, InlineCTA } from '../components/ui/Components';
import { Mail, MessageSquare, MapPin, Globe, Check, AlertCircle, CheckCircle } from 'lucide-react';
import { Language } from '../services/i18n';
import { notificationService } from '../services/notificationService';

interface ContactProps {
  lang: Language;
}

export const Contact: React.FC<ContactProps> = ({ lang }) => {
  const [formData, setFormData] = useState({
    subject: 'General Inquiry',
    email: '',
    message: '',
    privacyAgreed: false
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.privacyAgreed) {
      setError(lang === 'zh' ? '请同意隐私政策' : 'Please agree to the privacy policy');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await notificationService.sendContactMessage({
        subject: formData.subject,
        email: formData.email,
        message: formData.message
      });
      setSuccess(true);
      setFormData({ ...formData, message: '', email: '', privacyAgreed: false });
    } catch (err) {
      setError(lang === 'zh' ? '发送失败，请稍后重试' : 'Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

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
            {success ? (
              <div className="bg-white/5 p-8 rounded-2xl border border-white/10 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="text-emerald-500" size={32} />
                </div>
                <h3 className="text-xl font-bold text-white">
                  {lang === 'zh' ? '消息已发送' : 'Message Sent'}
                </h3>
                <p className="text-slate-400">
                  {lang === 'zh' ? '我们会尽快回复您的邮件。' : 'We will get back to you shortly via email.'}
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm font-bold uppercase tracking-wider"
                >
                  {lang === 'zh' ? '发送另一条消息' : 'Send Another Message'}
                </button>
              </div>
            ) : (
              <form className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/10" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">{lang === 'zh' ? "主题" : "Subject"}</label>
                  <select 
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-[#01040a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="General Inquiry">{lang === 'zh' ? "一般咨询" : "General Inquiry"}</option>
                    <option value="Research Collaboration">{lang === 'zh' ? "研究合作" : "Research Collaboration"}</option>
                    <option value="Technical Support">{lang === 'zh' ? "技术支持" : "Technical Support"}</option>
                    <option value="Media & Press">{lang === 'zh' ? "媒体与公关" : "Media & Press"}</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">{lang === 'zh' ? "您的邮箱" : "Your Email"}</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com" 
                    required
                    className="w-full bg-[#01040a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">{lang === 'zh' ? "消息内容" : "Message Content"}</label>
                  <textarea 
                    rows={5} 
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={lang === 'zh' ? "请在此输入您的消息..." : "Please enter your message here..."} 
                    required
                    className="w-full bg-[#01040a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                  ></textarea>
                </div>

                <div className="flex items-start gap-3 py-2">
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, privacyAgreed: !formData.privacyAgreed })}
                    className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.privacyAgreed ? 'bg-indigo-500 border-indigo-500' : 'bg-[#01040a] border-white/20'}`}
                  >
                    {formData.privacyAgreed && <Check className="w-3 h-3 text-white" />}
                  </button>
                  <span className="text-sm text-slate-400 cursor-pointer" onClick={() => setFormData({ ...formData, privacyAgreed: !formData.privacyAgreed })}>
                    {lang === 'zh' ? "我同意隐私政策并允许处理我的联系信息。" : "I agree to the Privacy Policy and consent to the processing of my contact information."}
                  </span>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wide bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading || !formData.privacyAgreed}
                  className={`w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${formData.privacyAgreed ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-white/5 text-slate-500 cursor-not-allowed'}`}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    lang === 'zh' ? "发送消息" : "Send Message"
                  )}
                </button>
              </form>
            )}
          </Section>
        </div>
      </div>

      <div className="text-center pt-12 border-t border-white/5">
        <div className="flex items-center justify-center gap-6">
          <InlineCTA text={lang === 'zh' ? "政策框架" : "Policy Framework"} link="/legal/policy-framework" />
          <span className="text-white/20">|</span>
          <InlineCTA text={lang === 'zh' ? "用户支持" : "User Support"} link="/support" />
        </div>
      </div>
    </MarketingPageTemplate>
  );
};
