import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

interface FeatureLayoutProps {
  title: string;
  onBack?: () => void;
  children: React.ReactNode;
}

export const FeatureLayout: React.FC<FeatureLayoutProps> = ({ title, onBack, children }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto p-6"
    >
      <div className="flex items-center gap-4 mb-8">
        {onBack && (
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ChevronLeft size={24} className="text-white" />
          </button>
        )}
        <h1 className="text-3xl font-black italic uppercase tracking-widest text-white">{title}</h1>
      </div>
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm">
        {children}
      </div>
    </motion.div>
  );
};
