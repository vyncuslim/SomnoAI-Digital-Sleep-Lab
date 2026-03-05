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
      <Section title={lang === 'zh' ? "电子邮件存储" : "Email Storage"}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-4 px-6 text-sm font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? "电子邮件" : "Email"}</th>
                <th className="py-4 px-6 text-sm font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? "存储空间" : "Storage"}</th>
                <th className="py-4 px-6 text-sm font-bold text-slate-400 uppercase tracking-widest text-right">{lang === 'zh' ? "操作" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                { email: 'support@sleepsomno.com', storage: '0 MB / 15 GB', type: 'support' },
                { email: 'partners@sleepsomno.com', storage: '0 MB / 15 GB', type: 'partners' },
                { email: 'legal@sleepsomno.com', storage: '0 MB / 15 GB', type: 'legal' },
                { email: 'contact@sleepsomno.com', storage: '0 MB / 15 GB', type: 'contact' },
                { email: 'admin@sleepsomno.com', storage: '0 MB / 15 GB', type: 'admin', catchAll: true },
              ].map((item) => (
                <tr key={item.email} className="group hover:bg-white/5 transition-colors">
                  <td className="py-6 px-6">
                    <div className="flex flex-col">
                      <span className="text-white font-bold tracking-tight">{item.email}</span>
                      {item.catchAll && (
                        <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mt-1">
                          {lang === 'zh' ? "全接收" : "Catch-all"}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-6 px-6">
                    <div className="flex flex-col gap-2 w-48">
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 w-[2%]" />
                      </div>
                      <span className="text-xs text-slate-500 font-medium">{item.storage}</span>
                    </div>
                  </td>
                  <td className="py-6 px-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-lg transition-all">
                        {lang === 'zh' ? "登录" : "Login"}
                      </button>
                      <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-lg transition-all">
                        {lang === 'zh' ? "选项" : "Options"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
