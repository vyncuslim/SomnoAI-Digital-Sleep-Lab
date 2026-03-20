import React from 'react';
import { Mail, Shield, Scale, FileText, Lock, Globe, Users } from 'lucide-react';
import { LegalPageTemplate } from '../components/ui/LegalPageTemplate';
import { INFO_CONTENT } from '../data/infoContent';

interface LegalContactProps {
  lang?: 'en' | 'zh';
}

export const LegalContact: React.FC<LegalContactProps> = ({ lang = 'en' }) => {
  const content = INFO_CONTENT[lang]['legal-contact'];

  const getIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('privacy') || t.includes('隐私')) return <Lock className="w-5 h-5 text-indigo-400" />;
    if (t.includes('security') || t.includes('安全')) return <Shield className="w-5 h-5 text-emerald-400" />;
    if (t.includes('intellectual') || t.includes('知识产权')) return <FileText className="w-5 h-5 text-amber-400" />;
    if (t.includes('law') || t.includes('执法')) return <Scale className="w-5 h-5 text-slate-400" />;
    if (t.includes('media') || t.includes('媒体')) return <Globe className="w-5 h-5 text-blue-400" />;
    if (t.includes('partnership') || t.includes('合作')) return <Users className="w-5 h-5 text-purple-400" />;
    return <Mail className="w-5 h-5 text-indigo-400" />;
  };

  return (
    <LegalPageTemplate
      title={content.title}
      lastUpdated="March 20, 2026"
      breadcrumbs={[{ label: lang === 'zh' ? '法律' : 'Legal', link: '/legal' }, { label: content.title }]}
    >
      <div className="text-slate-300 leading-relaxed space-y-12">
        <section>
          <div className="space-y-4 mb-8">
            <p className="text-lg text-slate-300 leading-relaxed">
              {content.intro}
            </p>
            <p className="text-slate-400">
              {content.subIntro}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {content.categories.map((category, index) => (
              <div 
                key={index}
                className="p-6 rounded-2xl border border-white/10 bg-white/5 shadow-sm hover:bg-white/10 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-white/5">
                    {getIcon(category.title)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">{category.title}</h3>
                    <p className="text-sm text-slate-400 mb-4">{category.description}</p>
                    <a 
                      href={`mailto:${category.email}`}
                      className="inline-flex items-center gap-2 text-indigo-400 font-medium hover:text-indigo-300 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      {category.email}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="pt-8 border-t border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6">{content.otherTitle}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {content.otherContacts.map((contact, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5"
              >
                <span className="text-sm font-medium text-slate-300">{contact.label}</span>
                <a 
                  href={`mailto:${contact.email}`}
                  className="text-xs font-mono text-indigo-400 hover:underline"
                >
                  {contact.email}
                </a>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-indigo-500/10 border border-indigo-500/20 rounded-3xl p-8 text-center">
          <h2 className="text-xl font-bold text-indigo-300 mb-3">
            {lang === 'zh' ? '需要正式邮寄？' : 'Need to send physical mail?'}
          </h2>
          <p className="text-indigo-200/70 mb-0">
            {lang === 'zh' 
              ? '对于法律文书送达或正式信函，请先通过 legal@sleepsomno.com 与我们的法律团队联系以获取当前的邮寄地址。' 
              : 'For service of process or formal correspondence, please contact our legal team at legal@sleepsomno.com first to obtain the current mailing address.'}
          </p>
        </section>
      </div>
    </LegalPageTemplate>
  );
};
