import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const Placeholder: React.FC<{ title: string }> = ({ title }) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#01040a] text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold mb-4">{title}</h1>
      <p className="text-slate-400 mb-8">This component is currently under development.</p>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-6 py-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
        <ArrowLeft size={20} /> Go Back
      </button>
    </div>
  );
};
