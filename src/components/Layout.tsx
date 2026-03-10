import React from 'react';
import { Outlet } from 'react-router-dom';
import TopBanner from './TopBanner';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#01040a] text-white">
      <TopBanner />
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
