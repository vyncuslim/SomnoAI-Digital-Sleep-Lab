import React from 'react';
import { motion } from 'framer-motion';
import { Language } from '../types.ts';

interface DashboardProps {
  lang: Language;
}

export const Dashboard: React.FC<DashboardProps> = ({ lang }) => {
  return (
    <div className="min-h-screen bg-[#01040a] text-slate-300 p-6 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        <h1 className="text-3xl font-bold text-white mb-2">User Dashboard</h1>
        <p className="text-slate-500 mb-8">
          The dashboard provides an overview of your analyzed data, insights, and activity trends. Information displayed is generated automatically and may be updated as new data become available.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Placeholder Cards */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Sleep Score</h3>
            <div className="text-4xl font-black text-indigo-400">85</div>
            <p className="text-xs text-slate-500 mt-2">Optimal Range</p>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Recovery</h3>
            <div className="text-4xl font-black text-emerald-400">92%</div>
            <p className="text-xs text-slate-500 mt-2">Fully Recovered</p>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Heart Rate</h3>
            <div className="text-4xl font-black text-rose-400">58 <span className="text-sm text-slate-500 font-normal">bpm</span></div>
            <p className="text-xs text-slate-500 mt-2">Resting Avg</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
