import React from 'react';
import toast from 'react-hot-toast';

import { Language } from '../types';

interface FooterProps {
  lang?: Language;
}

const Footer: React.FC<FooterProps> = ({ lang = 'en' }) => {
  const handleLinkClick = (e: React.MouseEvent, text: string) => {
    e.preventDefault();
    toast.success(`Navigating to ${text}...`);
  };

  return (
    <footer className="bg-[#01040a] text-gray-400 py-12 px-8 border-t border-white/10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <svg viewBox="0 0 100 100" className="w-8 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="ring1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
                <linearGradient id="ring2" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
                <linearGradient id="planet" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="15" fill="url(#planet)" />
              <path d="M 20 50 A 30 15 0 0 0 80 50" stroke="url(#ring1)" strokeWidth="6" strokeLinecap="round" />
              <path d="M 80 50 A 30 15 0 0 0 20 50" stroke="url(#ring2)" strokeWidth="6" strokeLinecap="round" />
              <circle cx="30" cy="30" r="2" fill="#fff" opacity="0.5" />
              <circle cx="70" cy="70" r="1.5" fill="#fff" opacity="0.3" />
              <circle cx="80" cy="30" r="1" fill="#fff" opacity="0.6" />
            </svg>
            <div className="font-bold text-lg text-white">SomnoAI Digital Sleep Lab</div>
          </div>
          <p className="text-sm">Our mission is to decode human sleep through neural interfaces and advanced AI telemetry at the SomnoAI Digital Sleep Lab.</p>
          <div className="mt-4 text-xs">
            <p>FACILITY LOCATION</p>
            <p>SomnoAI Digital Sleep Lab Inc.</p>
            <p>100 Innovation Drive, Suite 400</p>
            <p>San Francisco, CA 94105</p>
            <p className="mt-2 text-gray-500">
              {lang === 'zh' 
                ? "如需咨询，您不一定需要联系 +60 187807388，也可以通过 WhatsApp 联系 +1 (555) 933-5379。该账号为 AI 助手账号，可用于回答相关问题。" 
                : "For inquiries, you don't necessarily have to contact +60 187807388; you can also reach us via WhatsApp at +1 (555) 933-5379. This is an AI assistant account that can answer your questions."}
            </p>
          </div>
        </div>
        <div>
          <h4 className="font-bold text-white mb-4">NAVIGATION</h4>
          <ul className="space-y-2 text-sm">
            {['PRODUCT', 'PRICING', 'HOW IT WORKS', 'RESEARCH', 'SCIENCE', 'NEWS', 'FAQ', 'STATUS', 'SIGN IN'].map(link => (
              <li key={link}><a href="#" onClick={(e) => handleLinkClick(e, link)} className="hover:text-white transition-colors">{link}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-4">COMPLIANCE & LEGAL</h4>
          <ul className="space-y-2 text-sm">
            {['LEGAL HUB', 'COOKIES', 'AI DISCLAIMER', 'ABUSE POLICY', 'OPEN SOURCE', 'PRIVACY POLICY', 'SECURITY', 'MEDICAL DISCLAIMER', 'ACCOUNT BLOCKING'].map(link => (
              <li key={link}><a href="#" onClick={(e) => handleLinkClick(e, link)} className="hover:text-white transition-colors">{link}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-4">POLICY FRAMEWORK</h4>
          <ul className="space-y-2 text-sm">
            {['TERMS OF SERVICE', 'ACCEPTABLE USE', 'DATA PROCESSING', 'POLICY FRAMEWORK'].map(link => (
              <li key={link}><a href="#" onClick={(e) => handleLinkClick(e, link)} className="hover:text-white transition-colors">{link}</a></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs gap-4">
        <div className="flex items-center gap-4">
          <span className="text-green-500">● ALL SYSTEMS OPERATIONAL</span>
          <a href="#" onClick={(e) => handleLinkClick(e, 'DISCORD')} className="hover:text-white transition-colors">DISCORD</a>
          <a href="#" onClick={(e) => handleLinkClick(e, 'LINKEDIN')} className="hover:text-white transition-colors">LINKEDIN</a>
        </div>
        <p>© 2026 SOMNOAI DIGITAL SLEEP LAB. ALL RIGHTS RESERVED.</p>
      </div>
    </footer>
  );
};

export default Footer;
