import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface PlaceholderProps {
  title?: string;
  onBack?: () => void;
  [key: string]: any;
}

export const PlaceholderView: React.FC<PlaceholderProps> = ({ title = 'Accessing Laboratory Node...', onBack, ...props }) => {
  const navigate = useNavigate();
  const handleBack = onBack || (() => navigate(-1));

  return (
    <div className="min-h-screen bg-[#01040a] text-white flex flex-col items-center justify-center p-6">
      <div className="absolute top-6 left-6">
        <button 
          onClick={handleBack}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
      </div>
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <p className="text-slate-500 italic">Accessing laboratory data node...</p>
    </div>
  );
};
