import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { Language } from '../types';

interface FooterProps {
  lang: Language;
}

export const Footer: React.FC<FooterProps> = ({ lang }) => {
  const isZh = lang === 'zh';
  const langPrefix = isZh ? '/cn' : '/en';
  
  return (
    <footer className="border-t border-white/5 bg-[#01040a] py-16 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-4">
          <Logo lang={lang} showText={true} className="scale-75 origin-left" />
          <p className="text-sm text-slate-500 leading-relaxed">
            {isZh 
              ? "我们的使命是在 SomnoAI Digital Sleep Lab 通过神经接口和先进的 AI 遥测技术解码人类睡眠。"
              : "Our mission is to decode human sleep through neural interfaces and advanced AI telemetry at the SomnoAI Digital Sleep Lab."}
          </p>
          <div className="text-[10px] text-slate-600 font-mono space-y-1">
            <p>SomnoAI Digital Sleep Lab Inc.</p>
            <p>100 Innovation Drive, Suite 400</p>
            <p>San Francisco, CA 94105</p>
          </div>
        </div>
        <div>
          <h4 className="text-white font-medium mb-4">{isZh ? "快速链接" : "Quick Links"}</h4>
          <ul className="grid grid-cols-2 gap-2 text-sm text-slate-400">
            <li><Link to={`${langPrefix}/pricing`} className="hover:text-white transition-colors">{isZh ? "定价" : "Pricing"}</Link></li>
            <li><Link to={`${langPrefix}/about`} className="hover:text-white transition-colors">{isZh ? "关于" : "About"}</Link></li>
            <li><Link to={`${langPrefix}/product`} className="hover:text-white transition-colors">{isZh ? "产品" : "Product"}</Link></li>
            <li><Link to={`${langPrefix}/how-it-works`} className="hover:text-white transition-colors">{isZh ? "工作原理" : "How it Works"}</Link></li>
            <li><Link to={`${langPrefix}/features`} className="hover:text-white transition-colors">{isZh ? "功能" : "Features"}</Link></li>
            <li><Link to={`${langPrefix}/research`} className="hover:text-white transition-colors">{isZh ? "研究" : "Research"}</Link></li>
            <li><Link to={`${langPrefix}/science`} className="hover:text-white transition-colors">{isZh ? "科学" : "Science"}</Link></li>
            <li><Link to={`${langPrefix}/founder`} className="hover:text-white transition-colors">{isZh ? "创始人" : "Founder"}</Link></li>
            <li><Link to={`${langPrefix}/blog`} className="hover:text-white transition-colors">{isZh ? "博客" : "Blog"}</Link></li>
            <li><Link to={`${langPrefix}/news`} className="hover:text-white transition-colors">{isZh ? "新闻" : "News"}</Link></li>
            <li><Link to={`${langPrefix}/faq`} className="hover:text-white transition-colors">{isZh ? "常见问题" : "FAQ"}</Link></li>
            <li><Link to={`${langPrefix}/status`} className="hover:text-white transition-colors">{isZh ? "状态" : "Status"}</Link></li>
            <li><Link to={`${langPrefix}/contact`} className="hover:text-white transition-colors">{isZh ? "联系我们" : "Contact"}</Link></li>
            <li><Link to={`${langPrefix}/support`} className="hover:text-white transition-colors">{isZh ? "支持" : "Support"}</Link></li>
          </ul>
        </div>
        <div className="md:col-span-2">
          <h4 className="text-white font-medium mb-4">{isZh ? "法律" : "Legal"}</h4>
          <ul className="grid grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-slate-400">
            <li><Link to={`${langPrefix}/legal`} className="hover:text-white transition-colors">{isZh ? "法律中心" : "Legal"}</Link></li>
            <li><Link to={`${langPrefix}/legal/privacy-policy`} className="hover:text-white transition-colors">{isZh ? "隐私政策" : "Privacy Policy"}</Link></li>
            <li><Link to={`${langPrefix}/legal/terms-of-service`} className="hover:text-white transition-colors">{isZh ? "服务条款" : "Terms of Service"}</Link></li>
            <li><Link to={`${langPrefix}/legal/cookies`} className="hover:text-white transition-colors">{isZh ? "Cookie 政策" : "Cookies"}</Link></li>
            <li><Link to={`${langPrefix}/legal/security`} className="hover:text-white transition-colors">{isZh ? "安全政策" : "Security"}</Link></li>
            <li><Link to={`${langPrefix}/legal/acceptable-use`} className="hover:text-white transition-colors">{isZh ? "可接受使用" : "Acceptable Use"}</Link></li>
            <li><Link to={`${langPrefix}/legal/ai-disclaimer`} className="hover:text-white transition-colors">{isZh ? "AI 免责声明" : "AI Disclaimer"}</Link></li>
            <li><Link to={`${langPrefix}/legal/medical-disclaimer`} className="hover:text-white transition-colors">{isZh ? "医疗免责声明" : "Medical Disclaimer"}</Link></li>
            <li><Link to={`${langPrefix}/legal/data-processing`} className="hover:text-white transition-colors">{isZh ? "数据处理" : "Data Processing"}</Link></li>
            <li><Link to={`${langPrefix}/legal/abuse-policy`} className="hover:text-white transition-colors">{isZh ? "滥用政策" : "Abuse Policy"}</Link></li>
            <li><Link to={`${langPrefix}/legal/account-blocking`} className="hover:text-white transition-colors">{isZh ? "账户封禁" : "Account Blocking"}</Link></li>
            <li><Link to={`${langPrefix}/legal/policy-framework`} className="hover:text-white transition-colors">{isZh ? "政策框架" : "Policy Framework"}</Link></li>
            <li><Link to={`${langPrefix}/legal/open-source`} className="hover:text-white transition-colors">{isZh ? "开源" : "Open Source"}</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-white/5 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SOMNOAI DIGITAL SLEEP LAB. {isZh ? "保留所有权利。" : "ALL RIGHTS RESERVED."}</p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <a href="https://discord.com/invite/9EXJtRmju" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Discord</a>
            <a href="https://www.linkedin.com/company/digital-sleep-lab" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
          </div>
        </div>
        <div className="text-[10px] text-slate-600 leading-relaxed max-w-4xl">
          <p>
            {isZh 
              ? "透明度说明：SomnoAI Digital Sleep Lab 是一个不断发展的项目。平台可能会随着时间的推移引入实验性功能和研究原型。AI 生成的见解仅供参考，不应被视为医疗建议。"
              : "Transparency Note: SomnoAI Digital Sleep Lab is an evolving project. The platform may introduce experimental features and research prototypes over time. AI-generated insights are provided for informational purposes and should not be considered medical advice."}
          </p>
        </div>
      </div>
    </footer>
  );
};
