import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { OFFICIAL_LINKS } from '../constants/links';
import { Language } from '../types';
import { Shield } from 'lucide-react';

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
    { name: lang === 'zh' ? '机密研究' : 'CONFIDENTIAL RESEARCH', path: '/research-confidential' },
    { name: lang === 'zh' ? '科学见解' : 'SCIENCE INSIGHTS', path: '/science-insights' },
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
    { name: 'ACCOUNT BLOCKING', path: '/legal/account-blocking' },
    { name: 'VULNERABILITY DISCLOSURE', path: '/legal/vulnerability-disclosure' },
    { name: 'INTELLECTUAL PROPERTY', path: '/legal/intellectual-property' },
    { name: 'CHILDREN\'S PRIVACY', path: '/legal/children-privacy' }
  ];

  const policyLinks = [
    { name: 'TERMS OF SERVICE', path: '/legal/terms-of-service' },
    { name: 'ACCEPTABLE USE', path: '/legal/acceptable-use' },
    { name: 'DATA HANDLING', path: '/legal/data-handling' },
    { name: 'POLICY FRAMEWORK', path: '/legal/policy-framework' },
    { name: 'PRICING & BILLING', path: '/legal/pricing-and-billing' },
    { name: 'REFUND & CANCELLATION', path: '/legal/refund-and-cancellation' },
    { name: 'APPEALS & COMPLAINTS', path: '/legal/appeals-and-complaints' },
    { name: 'SUB-PROCESSORS', path: '/legal/subprocessors' },
    { name: 'DPA', path: '/legal/dpa' },
    { name: 'LEGAL CONTACT', path: '/legal/contact' }
  ];

  return (
    <footer className="bg-[#01040a] text-gray-400 py-12 px-8 border-t border-white/10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="mb-4">
            <Logo showText={true} className="scale-75 origin-left" />
          </div>
          <p className="text-sm">Our mission is to decode human sleep through neural interfaces and advanced AI telemetry at the SomnoAI Digital Sleep Lab.</p>
          
          <div className="mt-6">
            <h4 className="font-bold text-white mb-2 text-sm">{lang === 'zh' ? '订阅新闻通讯' : 'SUBSCRIBE TO NEWSLETTER'}</h4>
            <form 
              className="flex flex-col gap-2"
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const input = form.querySelector('input');
                const btn = form.querySelector('button');
                if (input && btn && input.value) {
                  const originalText = btn.innerText;
                  btn.innerText = lang === 'zh' ? '订阅中...' : 'SUBSCRIBING...';
                  btn.disabled = true;
                  try {
                    const res = await fetch('/api/subscribe', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: input.value })
                    });
                    if (res.ok) {
                      btn.innerText = lang === 'zh' ? '已订阅!' : 'SUBSCRIBED!';
                      btn.classList.add('bg-green-600', 'text-white');
                      btn.classList.remove('bg-white', 'text-black');
                      input.value = '';
                    } else {
                      btn.innerText = lang === 'zh' ? '错误' : 'ERROR';
                    }
                  } catch (err) {
                    btn.innerText = lang === 'zh' ? '错误' : 'ERROR';
                  }
                  setTimeout(() => {
                    btn.innerText = originalText;
                    btn.disabled = false;
                    btn.classList.remove('bg-green-600', 'text-white');
                    btn.classList.add('bg-white', 'text-black');
                  }, 3000);
                }
              }}
            >
              <input 
                type="email" 
                placeholder={lang === 'zh' ? '输入您的邮箱' : 'Enter your email'}
                className="bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 w-full"
                required
              />
              <button 
                type="submit"
                className="bg-white text-black px-4 py-2 rounded text-xs font-bold hover:bg-gray-200 transition-colors w-full"
              >
                {lang === 'zh' ? '订阅' : 'SUBSCRIBE'}
              </button>
            </form>
          </div>

          <div className="mt-6 text-xs">
            <p className="text-gray-500">
              {lang === 'zh' 
                ? "请认准 SomnoAI Digital Sleep Lab 官方品牌。如有任何疑问，请通过官方支持渠道或电子邮件与我们联系。" 
                : "Please recognize the official SomnoAI Digital Sleep Lab brand. For any inquiries, contact us via our official support channels."}
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
          <span className="text-green-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            ALL SYSTEMS OPERATIONAL
          </span>
          <span className="text-indigo-400 flex items-center gap-1.5">
            <Shield size={10} />
            ENCRYPTED SESSION
          </span>
          <a href={OFFICIAL_LINKS.discord} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">DISCORD</a>
          <a href={OFFICIAL_LINKS.linkedinCompany} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LINKEDIN</a>
          <a href={OFFICIAL_LINKS.github} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GITHUB</a>
          <a href={OFFICIAL_LINKS.supportAssistant} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">AI SUPPORT</a>
        </div>
        <div className="text-right flex flex-col items-end gap-1">
          <p>© 2026 SOMNOAI DIGITAL SLEEP LAB. ALL RIGHTS RESERVED. SDSL-CS-001</p>
          <p className="text-[9px] text-gray-600 uppercase tracking-widest">Unauthorized reproduction or distribution is strictly prohibited.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
