import React from 'react';

const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#01040a] text-slate-200">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {children}
      </div>
    </div>
  );
};

export default RootLayout;
