import React from 'react';
import { Outlet } from 'react-router-dom';
import TopBanner from './TopBanner';
import Navbar from './Navbar';
import Footer from './Footer';
import { ContentProtection } from './ContentProtection';

const Layout: React.FC = () => {
  return (
    <ContentProtection>
      <div className="min-h-screen bg-[#01040a] text-white">
        <TopBanner />
        <Navbar lang="en" activeView="dashboard" onNavigate={() => {}} isAuthenticated={false} />
        <main>
          <Outlet />
        </main>
        <Footer />
      </div>
    </ContentProtection>
  );
};

export default Layout;
