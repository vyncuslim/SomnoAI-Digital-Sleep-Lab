import React, { useState } from 'react';
import { MarketingPageTemplate } from '../components/ui/MarketingPageTemplate';
import { Section, Card, InlineCTA } from '../components/ui/Components';
import { Mail, MessageSquare, Globe, Check, AlertCircle, CheckCircle } from 'lucide-react';
import { Language } from '../services/i18n';
import { notificationService } from '../services/notificationService';
import { OFFICIAL_LINKS } from '../constants/links';

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
    } catch (err: any) {
      const errorMsg = err.response?.data?.details || err.message || 'Failed to send message. Please try again later.';
      setError(lang === 'zh' ? `发送失败: ${errorMsg}` : `Failed to send message: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MarketingPageTemplate
      title={lang === 'zh' ? "联系我们" : "Contact Us"}
      subtitle={lang === 'zh' ? "对平台、研究或合作机会有疑问？我们很乐意听取您的意见。" : "Have a question about the platform, research, or collaboration opportunities? We'd love to hear from you."}
      ctaPrimary={{ text: lang === 'zh' ? "发送邮件" : "Email Support", link: `mailto:${OFFICIAL_LINKS.email}` }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Left Column: Contact Methods */}
        <div className="space-y-8">
          <Section title={lang === 'zh' ? "联系方式" : "Contact Methods"}>
            <div className="space-y-4">
              <div className="flex items-start gap-6 p-6 hardware-panel group hover:border-indigo-500/30 transition-colors">
                <div className="p-3 bg-white/5 rounded-xl text-indigo-400 group-hover:bg-indigo-500/10 transition-colors">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <div className="hardware-label mb-2">INQUIRIES</div>
                  <h4 className="text-white font-bold mb-2">{lang === 'zh' ? "一般咨询" : "General Inquiries"}</h4>
                  <a href={`mailto:${OFFICIAL_LINKS.email}`} className="text-slate-400 hover:text-indigo-400 transition-colors block text-sm">{OFFICIAL_LINKS.email}</a>
                </div>
              </div>
              
              <div className="flex items-start gap-6 p-6 hardware-panel group hover:border-indigo-500/30 transition-colors">
                <div className="p-3 bg-white/5 rounded-xl text-indigo-400 group-hover:bg-indigo-500/10 transition-colors">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <div className="hardware-label mb-2">SUPPORT</div>
                  <h4 className="text-white font-bold mb-2">{lang === 'zh' ? "用户支持" : "User Support"}</h4>
                  <a href={OFFICIAL_LINKS.support} className="text-slate-400 hover:text-indigo-400 transition-colors block text-sm">{lang === 'zh' ? "访问支持中心" : "Visit Support Center"}</a>
                </div>
              </div>

              <div className="flex items-start gap-6 p-6 hardware-panel group hover:border-indigo-500/30 transition-colors">
                <div className="p-3 bg-white/5 rounded-xl text-indigo-400 group-hover:bg-indigo-500/10 transition-colors">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <div className="hardware-label mb-2">WHATSAPP</div>
                  <h4 className="text-white font-bold mb-2">{lang === 'zh' ? "AI 助手" : "AI Assistant"}</h4>
                  <p className="text-slate-400 text-sm mb-2">
                    {lang === 'zh' 
                      ? "您可以通过我们的官方 WhatsApp 频道联系我们，获取 AI 助手的即时回复。" 
                      : "You can reach us via our official WhatsApp channel for instant responses from our AI assistant."}
                  </p>
                  <a href={OFFICIAL_LINKS.whatsappChannel} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors block text-sm font-bold">
                    {lang === 'zh' ? `点击打开 WhatsApp 的 ${OFFICIAL_LINKS.whatsappChannel}` : `Contact via WhatsApp ${OFFICIAL_LINKS.whatsappChannel}`}
                  </a>
                </div>
              </div>
              
              <div className="flex items-start gap-6 p-6 hardware-panel group hover:border-indigo-500/30 transition-colors">
                <div className="p-3 bg-white/5 rounded-xl text-indigo-400 group-hover:bg-indigo-500/10 transition-colors">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <div className="hardware-label mb-2">LEGAL</div>
                  <h4 className="text-white font-bold mb-2">{lang === 'zh' ? "合作与法律" : "Partnerships & Legal"}</h4>
                  <a href="mailto:partners@sleepsomno.com" className="text-slate-400 hover:text-indigo-400 transition-colors block text-sm">partners@sleepsomno.com</a>
                  <a href="mailto:legal@sleepsomno.com" className="text-slate-400 hover:text-indigo-400 transition-colors block text-sm">legal@sleepsomno.com</a>
                </div>
              </div>
            </div>
          </Section>

          <Card 
            title={lang === 'zh' ? "合作机会" : "Collaboration"} 
            description={lang === 'zh' ? "我们欢迎来自研究人员、开发人员和公众的咨询、反馈和合作机会。请在联系时提供明确的信息，以便我们提供适当的回复。" : "We welcome inquiries, feedback, and collaboration opportunities from researchers, developers, and members of the public. Please provide clear information so we can respond appropriately."}
            label="PARTNERSHIP"
          />
        </div>

        {/* Right Column: Form */}
        <div>
          <Section title={lang === 'zh' ? "发送消息" : "Send a Message"}>
            {success ? (
              <div className="hardware-panel p-12 text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/20">
                  <CheckCircle className="text-emerald-500" size={40} />
                </div>
                <div>
                  <div className="hardware-label mb-2 text-emerald-500">SUCCESS</div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                    {lang === 'zh' ? '消息已发送' : 'Message Sent'}
                  </h3>
                </div>
                <p className="text-slate-400">
                  {lang === 'zh' ? '我们会尽快回复您的邮件。' : 'We will get back to you shortly via email.'}
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="mt-4 text-indigo-400 hover:text-indigo-300 text-xs font-black uppercase tracking-widest"
                >
                  {lang === 'zh' ? '发送另一条消息' : 'Send Another Message'}
                </button>
              </div>
            ) : (
              <form className="space-y-6 hardware-panel p-8" onSubmit={handleSubmit}>
                <div>
                  <label className="hardware-label mb-2 block">{lang === 'zh' ? "主题" : "Subject"}</label>
                  <select 
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm font-medium"
                  >
                    <option value="General Inquiry">{lang === 'zh' ? "一般咨询" : "General Inquiry"}</option>
                    <option value="Research Collaboration">{lang === 'zh' ? "研究合作" : "Research Collaboration"}</option>
                    <option value="Technical Support">{lang === 'zh' ? "技术支持" : "Technical Support"}</option>
                    <option value="Media & Press">{lang === 'zh' ? "媒体与公关" : "Media & Press"}</option>
                  </select>
                </div>
                
                <div>
                  <label className="hardware-label mb-2 block">{lang === 'zh' ? "您的邮箱" : "Your Email"}</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com" 
                    required
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm font-medium" 
                  />
                </div>

                <div>
                  <label className="hardware-label mb-2 block">{lang === 'zh' ? "消息内容" : "Message Content"}</label>
                  <textarea 
                    rows={5} 
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={lang === 'zh' ? "请在此输入您的消息..." : "Please enter your message here..."} 
                    required
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none text-sm font-medium"
                  ></textarea>
                </div>

                <div className="flex items-start gap-4 py-2">
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, privacyAgreed: !formData.privacyAgreed })}
                    className={`mt-1 w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${formData.privacyAgreed ? 'bg-indigo-500 border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'bg-slate-900 border-white/20'}`}
                  >
                    {formData.privacyAgreed && <Check className="w-4 h-4 text-white" />}
                  </button>
                  <span className="text-xs font-medium text-slate-500 cursor-pointer leading-relaxed" onClick={() => setFormData({ ...formData, privacyAgreed: !formData.privacyAgreed })}>
                    {lang === 'zh' ? "我同意隐私政策并允许处理我的联系信息。" : "I agree to the Privacy Policy and consent to the processing of my contact information."}
                  </span>
                </div>

                {error && (
                  <div className="flex items-center gap-3 text-rose-500 text-[10px] font-black uppercase tracking-widest bg-rose-500/5 p-4 rounded-xl border border-rose-500/20">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading || !formData.privacyAgreed}
                  className={`w-full py-4 rounded-full font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 ${formData.privacyAgreed ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_30px_rgba(79,70,229,0.3)]' : 'bg-white/5 text-slate-600 cursor-not-allowed'}`}
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
