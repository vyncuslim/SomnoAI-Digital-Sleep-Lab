import React from 'react';
import { motion } from 'framer-motion';
import { ShieldOff, Mail } from 'lucide-react';

export const BlockedView: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#01040a] text-white font-sans flex flex-col items-center justify-center p-6 text-center"
    >
      <ShieldOff size={80} className="text-rose-500 mb-8 drop-shadow-lg" />
      <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 leading-tight">
        Access <span className="text-rose-500">Denied</span>
      </h1>
      <p className="text-lg text-slate-400 max-w-xl mb-8 leading-relaxed">
        Your account has been blocked due to suspicious activity or policy violations.
        You will not be able to access the application.
      </p>
      <p className="text-sm text-slate-500 max-w-xl mb-12">
        If you believe this is an error, please contact our support team at:
      </p>
      <a
        href="mailto:admin@sleepsomno.com"
        className="px-8 py-4 bg-white/5 text-white rounded-full font-bold text-lg hover:bg-white/10 transition-colors border border-white/10 flex items-center gap-3"
      >
        <Mail size={20} />
        admin@sleepsomno.com
      </a>
    </motion.div>
  );
};
