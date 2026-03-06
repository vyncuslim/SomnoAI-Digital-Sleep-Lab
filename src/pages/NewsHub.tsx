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
              className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:border-white/20 transition-colors"
              onClick={() => onSelectArticle(item)}
            >
              <div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm font-mono">{item.date}</p>
              </div>
              <InlineCTA text={isZh ? "阅读公告" : "Read Announcement"} link={`/news/${item.slug}`} />
            </div>
          ))}
        </div>
      </Section>

      <Section title={isZh ? "媒体资源" : "Media Resources"} id="press-kit">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-2xl bg-slate-900/30 border border-white/5 text-center cursor-pointer hover:bg-slate-900/50 transition-colors">
            <h4 className="text-white font-bold mb-2">{isZh ? "品牌资产" : "Brand Assets"}</h4>
            <p className="text-slate-500 text-sm">{isZh ? "徽标、颜色和指南。" : "Logos, colors, and guidelines."}</p>
          </div>
          <div className="p-8 rounded-2xl bg-slate-900/30 border border-white/5 text-center cursor-pointer hover:bg-slate-900/50 transition-colors">
            <h4 className="text-white font-bold mb-2">{isZh ? "高管简介" : "Executive Bios"}</h4>
            <p className="text-slate-500 text-sm">{isZh ? "领导团队的背景信息。" : "Background information on leadership."}</p>
          </div>
          <div className="p-8 rounded-2xl bg-slate-900/30 border border-white/5 text-center cursor-pointer hover:bg-slate-900/50 transition-colors">
            <h4 className="text-white font-bold mb-2">{isZh ? "情况说明书" : "Fact Sheet"}</h4>
            <p className="text-slate-500 text-sm">{isZh ? "关键统计数据和公司概览。" : "Key statistics and company overview."}</p>
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
