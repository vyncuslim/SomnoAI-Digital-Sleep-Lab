import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children, sidebar }) => {
  return (
    <div className="min-h-screen bg-[#01040a] text-slate-300 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 flex flex-col">
      {/* Main Content Area */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row gap-12">
        <div className={`flex-grow ${sidebar ? 'lg:w-3/4' : 'w-full'}`}>
          {children}
        </div>
        {sidebar && (
          <aside className="w-full lg:w-1/4 flex-shrink-0">
            <div className="sticky top-24">
              {sidebar}
            </div>
          </aside>
        )}
      </main>
    </div>
  );
};
