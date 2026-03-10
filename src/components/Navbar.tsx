import React from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Navbar: React.FC = () => {
  const navLinks = ['PRODUCT', 'PRICING', 'HOW IT WORKS', 'RESEARCH', 'SCIENCE', 'NEWS', 'FAQ', 'PROJECT', 'FOUNDER', 'MEDIA'];
  
  const handleLinkClick = (e: React.MouseEvent, link: string) => {
    e.preventDefault();
    toast.success(`Navigating to ${link}...`);
  };

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-[#01040a] text-white">
      <Link to="/" className="flex items-center gap-2">
        <svg viewBox="0 0 100 100" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        <div className="font-bold text-lg whitespace-nowrap">SomnoAI Digital Sleep Lab</div>
      </Link>
      <div className="flex items-center gap-6 text-xs font-medium text-gray-400">
        {navLinks.map(link => (
          <a href="#" key={link} onClick={(e) => handleLinkClick(e, link)} className="hover:text-white transition-colors">
            {link}
          </a>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <button onClick={() => toast('Search feature coming soon')} className="text-gray-400 hover:text-white transition-colors">🔍</button>
        <div className="flex bg-gray-800 rounded-full text-xs p-1">
          <button onClick={() => toast.success('Language changed to English')} className="px-2 py-1 bg-gray-700 rounded-full text-white">EN</button>
          <button onClick={() => toast.success('Language changed to Chinese')} className="px-2 py-1 text-gray-400 hover:text-white transition-colors">CN</button>
        </div>
        <Link to="/signup" className="bg-white text-black px-4 py-2 rounded-full text-xs font-bold hover:bg-gray-200 transition-colors">JOIN NOW</Link>
      </div>
    </nav>
  );
};

export default Navbar;
