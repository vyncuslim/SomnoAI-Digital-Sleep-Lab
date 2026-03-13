import React from 'react';
import { MarketingPageTemplate } from '../components/ui/MarketingPageTemplate';
import { Section, InlineCTA } from '../components/ui/Components';
import { Language } from '../services/i18n';

interface NewsHubProps {
  lang: Language;
  onSelectArticle: (article: any) => void;
}

export const NewsHub: React.FC<NewsHubProps> = ({ lang, onSelectArticle }) => {
  const isZh = lang === 'zh';

  const announcements = [
    {
      title: isZh ? "平台更新：管理界面增强与安全修复" : "Platform Update: Admin UI Enhancements & Security Fixes",
      date: new Date().toISOString().split('T')[0],
      slug: "platform-update-admin-ui-security"
    },
    {
      title: isZh ? "SomnoAI Digital Sleep Lab 宣布 Beta 访问计划" : "SomnoAI Digital Sleep Lab Announces Beta Access Program",
      date: "2024-05-01",
      slug: "beta-access-program"
    },
    {
      title: isZh ? "关于昼夜节律分析的新研究合作伙伴关系" : "New Research Partnership on Circadian Rhythm Analysis",
      date: "2024-04-15",
      slug: "research-partnership"
    },
    {
      title: isZh ? "平台更新：增强的模式检测算法" : "Platform Update: Enhanced Pattern Detection Algorithms",
      date: "2024-03-28",
      slug: "platform-update-algorithms"
    }
  ];

  return (
    <MarketingPageTemplate
      title={isZh ? "SomnoAI Digital Sleep Lab 新闻中心" : "SomnoAI Digital Sleep Lab Newsroom"}
      subtitle={isZh ? "官方公告、新闻稿和媒体报道。" : "Official announcements, press releases, and media coverage."}
      ctaPrimary={{ text: isZh ? "媒体资料包" : "Press Kit", link: "#press-kit" }}
      ctaSecondary={{ text: isZh ? "媒体联系" : "Media Contact", link: "/contact" }}
    >
      <Section title={isZh ? "最新公告" : "Latest Announcements"}>
        <div className="space-y-4 max-w-4xl mx-auto">
          {announcements.map((item, idx) => (
            <div 
              key={idx} 
              className="hardware-panel p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 cursor-pointer hover:border-indigo-500/50 transition-all group"
              onClick={() => onSelectArticle(item)}
            >
              <div className="flex items-start gap-6">
                <div className="hardware-label text-[8px] mt-1 opacity-50">NEWS_{idx + 1}</div>
                <div>
                  <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight italic group-hover:text-indigo-400 transition-colors">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-500/50" />
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest italic">{item.date}</p>
                  </div>
                </div>
              </div>
              <InlineCTA text={isZh ? "阅读公告" : "Read Announcement"} link={`/news/${item.slug}`} />
            </div>
          ))}
        </div>
      </Section>

      <Section title={isZh ? "媒体资源" : "Media Resources"} id="press-kit">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="hardware-panel p-10 text-center cursor-pointer hover:border-indigo-500/50 transition-all group">
            <div className="hardware-label mb-6 opacity-50">ASSETS_01</div>
            <h4 className="text-xl font-black text-white mb-3 uppercase tracking-tight italic group-hover:text-indigo-400 transition-colors">
              {isZh ? "品牌资产" : "Brand Assets"}
            </h4>
            <p className="text-slate-500 text-[11px] font-medium uppercase tracking-wider italic">
              {isZh ? "徽标、颜色和指南。" : "Logos, colors, and guidelines."}
            </p>
          </div>
          <div className="hardware-panel p-10 text-center cursor-pointer hover:border-indigo-500/50 transition-all group">
            <div className="hardware-label mb-6 opacity-50">BIOS_02</div>
            <h4 className="text-xl font-black text-white mb-3 uppercase tracking-tight italic group-hover:text-indigo-400 transition-colors">
              {isZh ? "高管简介" : "Executive Bios"}
            </h4>
            <p className="text-slate-500 text-[11px] font-medium uppercase tracking-wider italic">
              {isZh ? "领导团队的背景信息。" : "Background information on leadership."}
            </p>
          </div>
          <div className="hardware-panel p-10 text-center cursor-pointer hover:border-indigo-500/50 transition-all group">
            <div className="hardware-label mb-6 opacity-50">FACTS_03</div>
            <h4 className="text-xl font-black text-white mb-3 uppercase tracking-tight italic group-hover:text-indigo-400 transition-colors">
              {isZh ? "情况说明书" : "Fact Sheet"}
            </h4>
            <p className="text-slate-500 text-[11px] font-medium uppercase tracking-wider italic">
              {isZh ? "关键统计数据和公司概览。" : "Key statistics and company overview."}
            </p>
          </div>
        </div>
      </Section>

      <div className="text-center pt-12 border-t border-white/5">
        <div className="flex items-center justify-center gap-6">
          <InlineCTA text={isZh ? "阅读博客" : "Read Blog"} link="/blog" />
          <span className="text-white/20">|</span>
          <InlineCTA text={isZh ? "联系我们" : "Contact Us"} link="/contact" />
        </div>
      </div>
    </MarketingPageTemplate>
  );
};
