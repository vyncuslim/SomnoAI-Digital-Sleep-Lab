import React from 'react';
import { MarketingPageTemplate } from '../components/ui/MarketingPageTemplate';
import { Section, InlineCTA } from '../components/ui/Components';
import { Language } from '../services/i18n';

interface BlogHubProps {
  lang: Language;
  onSelectPost: (post: any) => void;
}

export const BlogHub: React.FC<BlogHubProps> = ({ lang, onSelectPost }) => {
  const isZh = lang === 'zh';

  const recentPosts = [
    {
      title: isZh ? "理解睡眠结构：为什么深度睡眠很重要" : "Understanding Sleep Architecture: Why Deep Sleep Matters",
      description: isZh ? "深入探讨睡眠的各个阶段以及它们如何影响您的身体和心灵。" : "A deep dive into the stages of sleep and how they impact your body and mind.",
      slug: "understanding-sleep-architecture"
    },
    {
      title: isZh ? "温度如何影响您的夜间休息" : "How Temperature Affects Your Nightly Rest",
      description: isZh ? "探索环境温度与睡眠质量之间的联系。" : "Exploring the link between environmental temperature and sleep quality.",
      slug: "how-temperature-affects-rest"
    },
    {
      title: isZh ? "可穿戴设备在现代睡眠科学中的作用" : "The Role of Wearables in Modern Sleep Science",
      description: isZh ? "消费级设备如何改变我们对睡眠的理解。" : "How consumer devices are changing our understanding of sleep.",
      slug: "role-of-wearables"
    }
  ];

  return (
    <MarketingPageTemplate
      title={isZh ? "SomnoAI Digital Sleep Lab 博客" : "SomnoAI Digital Sleep Lab Blog"}
      subtitle={isZh ? "关于睡眠科学和我们平台背后技术的见解、更新和深入探讨。" : "Insights, updates, and deep dives into the science of sleep and the technology behind our platform."}
      ctaPrimary={{ text: isZh ? "订阅" : "Subscribe", link: "#subscribe" }}
      ctaSecondary={{ text: isZh ? "阅读最新" : "Read Latest", link: "#latest" }}
    >
      <Section title={isZh ? "精选文章" : "Featured Post"}>
        <div 
          className="p-8 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 cursor-pointer hover:border-indigo-500/50 transition-colors"
          onClick={() => onSelectPost({ slug: 'hidden-impact-social-jetlag' })}
        >
          <div className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
            {isZh ? "精选" : "Featured"}
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            {isZh ? "社交时差对认知表现的隐藏影响" : "The Hidden Impact of Social Jetlag on Cognitive Performance"}
          </h3>
          <p className="text-slate-400 text-lg leading-relaxed mb-6">
            {isZh 
              ? "探索不规律的周末睡眠时间表如何影响您在工作日处理信息的能力。" 
              : "Explore how irregular weekend sleep schedules affect your brain's ability to process information during the workweek."}
          </p>
          <InlineCTA text={isZh ? "阅读全文" : "Read Full Article"} link={`/blog/hidden-impact-social-jetlag`} />
        </div>
      </Section>

      <Section title={isZh ? "近期文章" : "Recent Posts"} id="latest">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentPosts.map((post, idx) => (
            <div 
              key={idx} 
              className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 cursor-pointer hover:border-white/20 transition-colors"
              onClick={() => onSelectPost(post)}
            >
              <h4 className="text-lg font-bold text-white mb-3">{post.title}</h4>
              <p className="text-slate-400 text-sm mb-4">{post.description}</p>
              <InlineCTA text={isZh ? "阅读" : "Read"} link={`/blog/${post.slug}`} />
            </div>
          ))}
        </div>
      </Section>

      <Section title={isZh ? "类别" : "Categories"}>
        <div className="flex flex-wrap gap-4">
          {['Science', 'Technology', 'Lifestyle', 'Company News'].map((cat, idx) => (
            <div key={idx} className="px-6 py-3 rounded-full bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:border-white/30 cursor-pointer transition-colors">
              {isZh ? (cat === 'Science' ? '科学' : cat === 'Technology' ? '技术' : cat === 'Lifestyle' ? '生活方式' : '公司新闻') : cat}
            </div>
          ))}
        </div>
      </Section>

      <div className="text-center pt-12 border-t border-white/5">
        <div className="flex items-center justify-center gap-6">
          <InlineCTA text={isZh ? "阅读研究" : "Read Research"} link="/research" />
          <span className="text-white/20">|</span>
          <InlineCTA text={isZh ? "新闻中心" : "Newsroom"} link="/news" />
        </div>
      </div>
    </MarketingPageTemplate>
  );
};
