import React from 'react';
import { FounderDashboard } from '../components/FounderDashboard';
import { useLanguage } from '../context/useLanguage';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export const FounderDashboardPage: React.FC = () => {
  const { langPrefix } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(`${langPrefix}/dashboard`)}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-2xl font-black italic uppercase tracking-tight text-white">
            Founder Dashboard
          </h1>
        </div>
        
        <FounderDashboard />
      </div>
    </div>
  );
};
