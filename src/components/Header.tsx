
import React from 'react';
import { Logo } from './Logo';

const Header = () => {
  return (
    <header className="bg-[#050505] text-white py-4 px-6 flex items-center justify-between border-b border-white/10">
      <Logo className="scale-90 origin-left" />
      <nav className="hidden md:flex gap-6 text-sm text-gray-400">
        <a href="#" className="hover:text-white">Product</a>
        <a href="#" className="hover:text-white">Pricing</a>
        <a href="#" className="hover:text-white">How it Works</a>
        <a href="#" className="hover:text-white">Research</a>
        <a href="#" className="hover:text-white">Science</a>
        <a href="#" className="hover:text-white">News</a>
        <a href="#" className="hover:text-white">FAQ</a>
        <a href="#" className="hover:text-white">Project</a>
        <a href="#" className="hover:text-white">Founder</a>
        <a href="#" className="hover:text-white">Media</a>
      </nav>
      <div className="flex items-center gap-4">
        <button className="text-sm border border-white/20 px-3 py-1 rounded-full">EN / CN</button>
        <button className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold">JOIN NOW</button>
      </div>
    </header>
  );
};

export default Header;
