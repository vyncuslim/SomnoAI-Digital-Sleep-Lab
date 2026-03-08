import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, AlertCircle, CheckCircle2, Info, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/useLanguage';

// --- Hero ---
export const Hero: React.FC<{ title: React.ReactNode; subtitle: string; ctaPrimary?: { text: string; link: string }; ctaSecondary?: { text: string; link: string } }> = ({ title, subtitle, ctaPrimary, ctaSecondary }) => {
  const { langPrefix } = useLanguage();
  return (
    <div className="py-20 md:py-32 flex flex-col items-center text-center max-w-5xl mx-auto relative px-4">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 blur-[160px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10"
      >
        <div className="mb-6">
          {title}
        </div>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed font-medium"
        >
          {subtitle}
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          {ctaPrimary && (
            <Link to={`${langPrefix}${ctaPrimary.link}`} className="group px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full transition-all shadow-[0_0_40px_rgba(79,70,229,0.4)] flex items-center gap-3 w-full sm:w-auto justify-center uppercase tracking-widest text-sm">
              {ctaPrimary.text} 
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
          {ctaSecondary && (
            <Link to={`${langPrefix}${ctaSecondary.link}`} className="px-10 py-5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-full transition-all border border-white/10 w-full sm:w-auto justify-center uppercase tracking-widest text-sm backdrop-blur-sm">
              {ctaSecondary.text}
            </Link>
          )}
        </motion.div>
      </motion.div>

      {/* Hardware Accents */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-10 left-10 w-20 h-20 border-l border-t border-white/20" />
        <div className="absolute top-10 right-10 w-20 h-20 border-r border-t border-white/20" />
        <div className="absolute bottom-10 left-10 w-20 h-20 border-l border-b border-white/20" />
        <div className="absolute bottom-10 right-10 w-20 h-20 border-r border-b border-white/20" />
      </div>
    </div>
  );
};

// --- Hardware Widget ---
export const HardwareWidget: React.FC<{ label: string; value: string; unit?: string; icon?: React.ReactNode; status?: 'active' | 'idle' }> = ({ label, value, unit, icon, status = 'idle' }) => (
  <div className="p-6 hardware-panel relative overflow-hidden group bg-slate-900/60">
    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    <div className="flex justify-between items-start mb-6">
      <div className="hardware-label flex items-center gap-2">
        <div className={`w-1 h-1 rounded-full ${status === 'active' ? 'bg-indigo-500 shadow-[0_0_8px_#6366f1]' : 'bg-slate-700'}`} />
        {label}
      </div>
      <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest italic border ${status === 'active' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 animate-pulse' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
        {status === 'active' ? 'ONLINE' : 'IDLE'}
      </div>
    </div>
    <div className="flex items-baseline gap-2 relative z-10">
      <span className="text-4xl font-black italic tracking-tighter text-white group-hover:text-indigo-400 transition-colors duration-500">{value}</span>
      {unit && <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">{unit}</span>}
    </div>
    {icon && (
      <div className="absolute bottom-4 right-4 text-white/5 group-hover:text-indigo-500/20 transition-all duration-700 group-hover:scale-125 group-hover:rotate-6">
        {icon}
      </div>
    )}
    <div className="absolute bottom-0 left-0 w-full h-0.5 dashed-line opacity-20" />
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
  </div>
);

// --- Section ---
export const Section: React.FC<{ title?: string; description?: string; children: React.ReactNode; className?: string; id?: string }> = ({ title, description, children, className = "", id }) => (
  <section id={id} className={`py-24 relative ${className}`}>
    {(title || description) && (
      <div className="mb-20 max-w-4xl relative z-10">
        {title && (
          <div className="flex items-center gap-6 mb-8">
            <div className="flex flex-col gap-1">
              <div className="w-8 h-1 bg-indigo-500 rounded-full shadow-[0_0_10px_#6366f1]" />
              <div className="w-4 h-1 bg-indigo-500/30 rounded-full" />
            </div>
            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white shrink-0 leading-none">{title}</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
          </div>
        )}
        {description && <p className="text-xl text-slate-400 leading-relaxed font-medium border-l-2 border-indigo-500/20 pl-8 ml-4">{description}</p>}
      </div>
    )}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  </section>
);

// --- Card ---
export const Card: React.FC<{ title: string; description: string; icon?: React.ReactNode; className?: string; children?: React.ReactNode; onClick?: () => void; label?: string }> = ({ title, description, icon, className = "", children, onClick, label }) => (
  <motion.div 
    whileHover={{ y: -8, scale: 1.01 }}
    onClick={onClick}
    className={`p-10 rounded-[2.5rem] bg-slate-900/40 border border-white/10 hover:border-indigo-500/40 transition-all duration-700 hover:shadow-[0_30px_60px_rgba(0,0,0,0.4)] relative group overflow-hidden ${onClick ? 'cursor-pointer' : ''} ${className}`}
  >
    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
    
    {label && (
      <div className="absolute top-8 right-10 hardware-label opacity-30 group-hover:opacity-100 group-hover:text-indigo-400 transition-all duration-500 flex items-center gap-2">
        <div className="w-1 h-1 rounded-full bg-indigo-500 scale-0 group-hover:scale-100 transition-transform" />
        {label}
      </div>
    )}
    
    {icon && (
      <div className="w-20 h-20 rounded-3xl bg-indigo-500/5 border border-white/5 flex items-center justify-center text-indigo-400 mb-10 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-700 shadow-inner">
        {React.cloneElement(icon as React.ReactElement, { size: 32 })}
      </div>
    )}
    
    <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white mb-6 group-hover:text-indigo-400 transition-colors duration-500 leading-none">
      {title}
    </h3>
    
    <p className="text-slate-400 leading-relaxed mb-8 group-hover:text-slate-200 transition-colors duration-500 font-medium text-lg">
      {description}
    </p>
    
    {children}
    
    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-1000 ease-out" />
    
    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-indigo-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
  </motion.div>
);

// --- Accordion ---
export const Accordion: React.FC<{ items: { title: string; content: React.ReactNode }[] }> = ({ items }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <div className="space-y-4">
      {items.map((item, idx) => (
        <div key={idx} className="border border-white/5 rounded-2xl bg-slate-900/30 overflow-hidden">
          <button 
            className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
          >
            <span className="font-medium text-white">{item.title}</span>
            <ChevronDown size={20} className={`text-slate-400 transition-transform ${openIndex === idx ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {openIndex === idx && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="px-6 pb-5 text-slate-400 leading-relaxed"
              >
                {item.content}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

// --- Tabs ---
export const Tabs: React.FC<{ tabs: { id: string; label: string; content: React.ReactNode }[] }> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  return (
    <div>
      <div className="flex overflow-x-auto border-b border-white/10 mb-8 hide-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors relative ${activeTab === tab.id ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
            )}
          </button>
        ))}
      </div>
      <div>
        {tabs.find(t => t.id === activeTab)?.content}
      </div>
    </div>
  );
};

// --- Timeline ---
export const Timeline: React.FC<{ events: { date: string; title: string; description: string; tag?: string; icon?: React.ReactNode }[] }> = ({ events }) => (
  <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
    {events.map((event, idx) => (
      <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-slate-900 text-slate-500 group-hover:text-indigo-400 group-hover:border-indigo-500/50 transition-colors shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_0_4px_#01040a]">
          {event.icon ? <div className="scale-75">{event.icon}</div> : <div className="w-2 h-2 bg-current rounded-full" />}
        </div>
        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-white/10 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <time className="text-sm font-mono text-indigo-400">{event.date}</time>
            {event.tag && <span className="px-2 py-1 rounded-md bg-white/5 text-xs font-medium text-slate-300">{event.tag}</span>}
          </div>
          <h4 className="text-lg font-semibold text-white mb-2">{event.title}</h4>
          <p className="text-slate-400 text-sm leading-relaxed">{event.description}</p>
        </div>
      </div>
    ))}
  </div>
);

// --- Status Badge ---
export const StatusBadge: React.FC<{ status: 'operational' | 'degraded' | 'outage' }> = ({ status }) => {
  const config = {
    operational: { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', icon: CheckCircle2, text: 'Operational' },
    degraded: { color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', icon: AlertCircle, text: 'Degraded Performance' },
    outage: { color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20', icon: AlertCircle, text: 'Major Outage' }
  };
  const { color, bg, border, icon: Icon, text } = config[status];
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${bg} ${color} border ${border}`}>
      <Icon size={16} /> {text}
    </div>
  );
};

// --- Alert Banner ---
export const AlertBanner: React.FC<{ type?: 'info' | 'warning'; title: string; children: React.ReactNode }> = ({ type = 'info', title, children }) => {
  const isWarning = type === 'warning';
  return (
    <div className={`p-6 rounded-2xl border flex gap-4 items-start ${isWarning ? 'bg-amber-500/10 border-amber-500/20 text-amber-200' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-200'}`}>
      <div className="shrink-0 mt-1">
        {isWarning ? <AlertCircle size={20} className="text-amber-400" /> : <Info size={20} className="text-indigo-400" />}
      </div>
      <div>
        <h4 className={`font-semibold mb-1 ${isWarning ? 'text-amber-400' : 'text-indigo-400'}`}>{title}</h4>
        <div className="text-sm opacity-80 leading-relaxed">{children}</div>
      </div>
    </div>
  );
};

// --- Last Updated ---
export const LastUpdated: React.FC<{ date: string; version?: string }> = ({ date, version }) => (
  <div className="flex items-center gap-4 text-sm text-slate-500 font-mono mb-8 pb-8 border-b border-white/5">
    <span>Last updated: {date}</span>
    {version && (
      <>
        <span className="w-1 h-1 rounded-full bg-slate-700" />
        <span>Version {version}</span>
      </>
    )}
  </div>
);

// --- Breadcrumbs ---
export const Breadcrumbs: React.FC<{ items: { label: string; link?: string }[] }> = ({ items }) => {
  const { langPrefix } = useLanguage();
  return (
    <nav className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-8">
      <Link to={langPrefix} className="hover:text-white transition-colors">Home</Link>
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight size={14} className="text-slate-700" />
          {item.link ? (
            <Link to={`${langPrefix}${item.link}`} className="hover:text-white transition-colors">{item.label}</Link>
          ) : (
            <span className="text-slate-300">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

// --- Inline CTA ---
export const InlineCTA: React.FC<{ text: string; link: string; icon?: React.ReactNode }> = ({ text, link, icon }) => {
  const { langPrefix } = useLanguage();
  return (
    <Link to={`${langPrefix}${link}`} className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium transition-colors group">
      {text} {icon || <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
    </Link>
  );
};
