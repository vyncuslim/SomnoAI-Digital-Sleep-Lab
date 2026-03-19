import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { OFFICIAL_LINKS } from '../constants/links';
import { Language } from '../types';

interface FooterProps {
  lang?: Language;
}

const Footer: React.FC<FooterProps> = ({ lang = 'en' }) => {
  const langPrefix = lang === 'zh' ? '/cn' : '/en';

  const navLinks = [
    { name: 'PRODUCT', path: '/product' },
    { name: 'PRICING', path: '/pricing' },
    { name: 'HOW IT WORKS', path: '/how-it-works' },
    { name: 'RESEARCH', path: '/research' },
    { name: 'SCIENCE', path: '/science' },
    { name: 'NEWS', path: '/news' },
    { name: 'FAQ', path: '/faq' },
    { name: 'STATUS', path: '/status' },
    { name: 'CONTACT', path: '/contact' },
    { name: 'SUPPORT', path: '/support' },
    { name: 'SIGN IN', path: '/auth/login' }
  ];

  const legalLinks = [
    { name: 'LEGAL HUB', path: '/legal' },
    { name: 'COOKIES', path: '/legal/cookies' },
    { name: 'AI DISCLAIMER', path: '/legal/ai-disclaimer' },
    { name: 'ABUSE POLICY', path: '/legal/abuse-policy' },
    { name: 'OPEN SOURCE', path: '/legal/open-source' },
    { name: 'PRIVACY POLICY', path: '/legal/privacy-policy' },
    { name: 'SECURITY', path: '/legal/security' },
    { name: 'MEDICAL DISCLAIMER', path: '/legal/medical-disclaimer' },
    { name: 'ACCOUNT BLOCKING', path: '/legal/account-blocking' }
  ];

  const policyLinks = [
    { name: 'TERMS OF SERVICE', path: '/legal/terms-of-service' },
    { name: 'ACCEPTABLE USE', path: '/legal/acceptable-use' },
    { name: 'DATA PROCESSING', path: '/legal/data-processing' },
    { name: 'POLICY FRAMEWORK', path: '/legal/policy-framework' }
  ];

  return (
    <footer className="bg-[#01040a] text-gray-400 py-12 px-8 border-t border-white/10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="mb-4">
            <Logo showText={true} className="scale-75 origin-left" />
          </div>
          <p className="text-sm">Our mission is to decode human sleep through neural interfaces and advanced AI telemetry at the SomnoAI Digital Sleep Lab.</p>
          <div className="mt-4 text-xs">
            <p className="text-gray-500">
              {lang === 'zh' 
                ? "如有任何疑问，请通过官方支持渠道或电子邮件与我们联系。我们的 AI 助手全天候为您服务。" 
                : "For any inquiries, please contact us via our official support channels or email. Our AI assistant is available 24/7 to help."}
            </p>
          </div>
        </div>
        <div>
          <h4 className="font-bold text-white mb-4">NAVIGATION</h4>
          <ul className="space-y-2 text-sm">
            {navLinks.map(link => (
              <li key={link.name}>
                <Link to={`${langPrefix}${link.path}`} className="hover:text-white transition-colors">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-4">COMPLIANCE & LEGAL</h4>
          <ul className="space-y-2 text-sm">
            {legalLinks.map(link => (
              <li key={link.name}>
                <Link to={`${langPrefix}${link.path}`} className="hover:text-white transition-colors">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-4">POLICY FRAMEWORK</h4>
          <ul className="space-y-2 text-sm">
            {policyLinks.map(link => (
              <li key={link.name}>
                <Link to={`${langPrefix}${link.path}`} className="hover:text-white transition-colors">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs gap-4">
        <div className="flex items-center gap-4">
          <span className="text-green-500">● ALL SYSTEMS OPERATIONAL</span>
          <a href={OFFICIAL_LINKS.discord} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">DISCORD</a>
          <a href={OFFICIAL_LINKS.linkedinCompany} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LINKEDIN</a>
          <a href={OFFICIAL_LINKS.github} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GITHUB</a>
          <a href={OFFICIAL_LINKS.supportAssistant} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">AI SUPPORT</a>
        </div>
        <p>© 2026 SOMNOAI DIGITAL SLEEP LAB. ALL RIGHTS RESERVED.</p>
      </div>
    </footer>
  );
};

export default Footer;
