import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#01040a] text-slate-200 flex flex-col">
      <Navbar />
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default RootLayout;
