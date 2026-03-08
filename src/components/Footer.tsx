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
    <footer className="border-t border-white/10 bg-[#01040a] py-24 mt-auto relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-16">
        <div className="space-y-8">
          <Logo lang={lang} showText={true} className="scale-90 origin-left" />
          <p className="text-sm text-slate-500 leading-relaxed font-medium">
            {isZh 
              ? "我们的使命是在 SomnoAI Digital Sleep Lab 通过神经接口和先进的 AI 遥测技术解码人类睡眠。"
              : "Our mission is to decode human sleep through neural interfaces and advanced AI telemetry at the SomnoAI Digital Sleep Lab."}
          </p>
          <div className="space-y-2">
            <div className="hardware-label text-[8px]">FACILITY LOCATION</div>
            <div className="text-[10px] text-slate-600 font-black uppercase tracking-widest space-y-1 italic">
              <p>SomnoAI Digital Sleep Lab Inc.</p>
              <p>100 Innovation Drive, Suite 400</p>
              <p>San Francisco, CA 94105</p>
            </div>
          </div>
        </div>
        
        <div>
          <div className="hardware-label mb-6">NAVIGATION</div>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider italic">
            <li><Link to={`${langPrefix}/pricing`} className="hover:text-indigo-400 transition-colors">{isZh ? "定价" : "Pricing"}</Link></li>
            <li><Link to={`${langPrefix}/about`} className="hover:text-indigo-400 transition-colors">{isZh ? "关于" : "About"}</Link></li>
            <li><Link to={`${langPrefix}/product`} className="hover:text-indigo-400 transition-colors">{isZh ? "产品" : "Product"}</Link></li>
            <li><Link to={`${langPrefix}/how-it-works`} className="hover:text-indigo-400 transition-colors">{isZh ? "工作原理" : "How it Works"}</Link></li>
            <li><Link to={`${langPrefix}/features`} className="hover:text-indigo-400 transition-colors">{isZh ? "功能" : "Features"}</Link></li>
            <li><Link to={`${langPrefix}/research`} className="hover:text-indigo-400 transition-colors">{isZh ? "研究" : "Research"}</Link></li>
            <li><Link to={`${langPrefix}/science`} className="hover:text-indigo-400 transition-colors">{isZh ? "科学" : "Science"}</Link></li>
            <li><Link to={`${langPrefix}/founder`} className="hover:text-indigo-400 transition-colors">{isZh ? "创始人" : "Founder"}</Link></li>
            <li><Link to={`${langPrefix}/blog`} className="hover:text-indigo-400 transition-colors">{isZh ? "博客" : "Blog"}</Link></li>
            <li><Link to={`${langPrefix}/news`} className="hover:text-indigo-400 transition-colors">{isZh ? "新闻" : "News"}</Link></li>
            <li><Link to={`${langPrefix}/faq`} className="hover:text-indigo-400 transition-colors">{isZh ? "常见问题" : "FAQ"}</Link></li>
            <li><Link to={`${langPrefix}/status`} className="hover:text-indigo-400 transition-colors">{isZh ? "状态" : "Status"}</Link></li>
            <li><Link to={`${langPrefix}/contact`} className="hover:text-indigo-400 transition-colors">{isZh ? "联系我们" : "Contact"}</Link></li>
            <li><Link to={`${langPrefix}/support`} className="hover:text-indigo-400 transition-colors">{isZh ? "支持" : "Support"}</Link></li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <div className="hardware-label mb-6">COMPLIANCE & LEGAL</div>
          <ul className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider italic">
            <li><Link to={`${langPrefix}/legal`} className="hover:text-indigo-400 transition-colors">{isZh ? "法律中心" : "Legal Hub"}</Link></li>
            <li><Link to={`${langPrefix}/legal/privacy-policy`} className="hover:text-indigo-400 transition-colors">{isZh ? "隐私政策" : "Privacy Policy"}</Link></li>
            <li><Link to={`${langPrefix}/legal/terms-of-service`} className="hover:text-indigo-400 transition-colors">{isZh ? "服务条款" : "Terms of Service"}</Link></li>
            <li><Link to={`${langPrefix}/legal/cookies`} className="hover:text-indigo-400 transition-colors">{isZh ? "Cookie 政策" : "Cookies"}</Link></li>
            <li><Link to={`${langPrefix}/legal/security`} className="hover:text-indigo-400 transition-colors">{isZh ? "安全政策" : "Security"}</Link></li>
            <li><Link to={`${langPrefix}/legal/acceptable-use`} className="hover:text-indigo-400 transition-colors">{isZh ? "可接受使用" : "Acceptable Use"}</Link></li>
            <li><Link to={`${langPrefix}/legal/ai-disclaimer`} className="hover:text-indigo-400 transition-colors">{isZh ? "AI 免责声明" : "AI Disclaimer"}</Link></li>
            <li><Link to={`${langPrefix}/legal/medical-disclaimer`} className="hover:text-indigo-400 transition-colors">{isZh ? "医疗免责声明" : "Medical Disclaimer"}</Link></li>
            <li><Link to={`${langPrefix}/legal/data-processing`} className="hover:text-indigo-400 transition-colors">{isZh ? "数据处理" : "Data Processing"}</Link></li>
            <li><Link to={`${langPrefix}/legal/abuse-policy`} className="hover:text-indigo-400 transition-colors">{isZh ? "滥用政策" : "Abuse Policy"}</Link></li>
            <li><Link to={`${langPrefix}/legal/account-blocking`} className="hover:text-indigo-400 transition-colors">{isZh ? "账户封禁" : "Account Blocking"}</Link></li>
            <li><Link to={`${langPrefix}/legal/policy-framework`} className="hover:text-indigo-400 transition-colors">{isZh ? "政策框架" : "Policy Framework"}</Link></li>
            <li><Link to={`${langPrefix}/legal/open-source`} className="hover:text-indigo-400 transition-colors">{isZh ? "开源" : "Open Source"}</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-24 pt-12 border-t border-white/5 space-y-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="hardware-label text-[8px]">COPYRIGHT NOTICE</div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">
              © {new Date().getFullYear()} SOMNOAI DIGITAL SLEEP LAB. {isZh ? "保留所有权利。" : "ALL RIGHTS RESERVED."}
            </p>
          </div>
          <div className="flex items-center gap-8">
            <a href="https://discord.com/invite/9EXJtRmju" target="_blank" rel="noopener noreferrer" className="hardware-label text-[10px] hover:text-indigo-400 transition-colors">DISCORD</a>
            <div className="w-px h-4 bg-white/10" />
            <a href="https://www.linkedin.com/company/digital-sleep-lab" target="_blank" rel="noopener noreferrer" className="hardware-label text-[10px] hover:text-indigo-400 transition-colors">LINKEDIN</a>
          </div>
        </div>
        
        <div className="hardware-panel p-6 bg-white/[0.02]">
          <div className="hardware-label mb-4 text-amber-500/70">TRANSPARENCY PROTOCOL</div>
          <p className="text-[10px] text-slate-500 leading-relaxed font-medium uppercase tracking-wider italic">
            {isZh 
              ? "SomnoAI Digital Sleep Lab 是一个不断发展的项目。平台可能会随着时间的推移引入实验性功能 and 研究原型。AI 生成的见解仅供参考，不应被视为医疗建议。"
              : "SomnoAI Digital Sleep Lab is an evolving project. The platform may introduce experimental features and research prototypes over time. AI-generated insights are provided for informational purposes and should not be considered medical advice."}
          </p>
        </div>
      </div>
    </footer>
  );
};
