import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { Language } from '../types';

interface FooterProps {
  lang: Language;
}

export const Footer: React.FC<FooterProps> = ({ lang }) => {
  const isZh = lang === 'zh';
  
  return (
    <footer className="border-t border-white/5 bg-[#01040a] py-16 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-4">
          <Logo lang={lang} showText={true} className="scale-75 origin-left" />
          <p className="text-sm text-slate-500 leading-relaxed">
            {isZh 
              ? "以研究为导向的技术倡议，探索人工智能和数据分析如何加深对人类睡眠的理解。"
              : "Research-driven technology initiative exploring how AI and data analysis can deepen the understanding of human sleep."}
          </p>
        </div>
        <div>
          <h4 className="text-white font-medium mb-4">{isZh ? "平台" : "Platform"}</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link to="/product" className="hover:text-white transition-colors">{isZh ? "产品概览" : "Product Overview"}</Link></li>
            <li><Link to="/how-it-works" className="hover:text-white transition-colors">{isZh ? "工作原理" : "How it Works"}</Link></li>
            <li><Link to="/features" className="hover:text-white transition-colors">{isZh ? "功能" : "Features"}</Link></li>
            <li><Link to="/status" className="hover:text-white transition-colors">{isZh ? "系统状态" : "System Status"}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-medium mb-4">{isZh ? "资源" : "Resources"}</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link to="/research" className="hover:text-white transition-colors">{isZh ? "研究" : "Research"}</Link></li>
            <li><Link to="/science" className="hover:text-white transition-colors">{isZh ? "科学" : "Science"}</Link></li>
            <li><Link to="/blog" className="hover:text-white transition-colors">{isZh ? "博客" : "Blog"}</Link></li>
            <li><Link to="/faq" className="hover:text-white transition-colors">{isZh ? "常见问题" : "FAQ"}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-medium mb-4">{isZh ? "法律与支持" : "Legal & Support"}</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link to="/legal" className="hover:text-white transition-colors">{isZh ? "法律中心" : "Legal Center"}</Link></li>
            <li><Link to="/privacy" className="hover:text-white transition-colors">{isZh ? "隐私政策" : "Privacy Policy"}</Link></li>
            <li><Link to="/terms" className="hover:text-white transition-colors">{isZh ? "服务条款" : "Terms of Service"}</Link></li>
            <li><Link to="/support" className="hover:text-white transition-colors">{isZh ? "支持" : "Support"}</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">{isZh ? "联系我们" : "Contact Us"}</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
        <p>© {new Date().getFullYear()} SomnoAI Digital Sleep Lab. {isZh ? "保留所有权利。" : "All rights reserved."}</p>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <a href="https://github.com/vyncuslim/SomnoAI-Digital-Sleep-Lab" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
          <a href="https://discord.com/invite/9EXJtRmju" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Discord</a>
          <a href="https://www.linkedin.com/company/somnoai-digital-sleep-lab" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
        </div>
      </div>
    </footer>
  );
};
