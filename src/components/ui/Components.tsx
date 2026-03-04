import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, AlertCircle, CheckCircle2, Info, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Hero ---
export const Hero: React.FC<{ title: string; subtitle: string; ctaPrimary?: { text: string; link: string }; ctaSecondary?: { text: string; link: string } }> = ({ title, subtitle, ctaPrimary, ctaSecondary }) => (
  <div className="py-20 md:py-32 flex flex-col items-center text-center max-w-4xl mx-auto relative">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
    <motion.h1 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-tight"
    >
      {title}
    </motion.h1>
    <motion.p 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
      className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl leading-relaxed"
    >
      {subtitle}
    </motion.p>
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
      className="flex flex-col sm:flex-row items-center gap-4"
    >
      {ctaPrimary && (
        <Link to={ctaPrimary.link} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-full transition-all shadow-[0_0_30px_rgba(79,70,229,0.3)] flex items-center gap-2 w-full sm:w-auto justify-center">
          {ctaPrimary.text} <ArrowRight size={18} />
        </Link>
      )}
      {ctaSecondary && (
        <Link to={ctaSecondary.link} className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-full transition-all border border-white/10 w-full sm:w-auto justify-center">
          {ctaSecondary.text}
        </Link>
      )}
    </motion.div>
  </div>
);

// --- Section ---
export const Section: React.FC<{ title?: string; description?: string; children: React.ReactNode; className?: string }> = ({ title, description, children, className = "" }) => (
  <section className={`py-16 ${className}`}>
    {(title || description) && (
      <div className="mb-12 max-w-3xl">
        {title && <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">{title}</h2>}
        {description && <p className="text-lg text-slate-400 leading-relaxed">{description}</p>}
      </div>
    )}
    {children}
  </section>
);

// --- Card ---
export const Card: React.FC<{ title: string; description: string; icon?: React.ReactNode; className?: string; children?: React.ReactNode; onClick?: () => void }> = ({ title, description, icon, className = "", children, onClick }) => (
  <div 
    onClick={onClick}
    className={`p-8 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-white/10 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
  >
    {icon && <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6">{icon}</div>}
    <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
    <p className="text-slate-400 leading-relaxed mb-4">{description}</p>
    {children}
  </div>
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
export const Breadcrumbs: React.FC<{ items: { label: string; link?: string }[] }> = ({ items }) => (
  <nav className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-8">
    <Link to="/" className="hover:text-white transition-colors">Home</Link>
    {items.map((item, idx) => (
      <React.Fragment key={idx}>
        <ChevronRight size={14} className="text-slate-700" />
        {item.link ? (
          <Link to={item.link} className="hover:text-white transition-colors">{item.label}</Link>
        ) : (
          <span className="text-slate-300">{item.label}</span>
        )}
      </React.Fragment>
    ))}
  </nav>
);

// --- Inline CTA ---
export const InlineCTA: React.FC<{ text: string; link: string; icon?: React.ReactNode }> = ({ text, link, icon }) => (
  <Link to={link} className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium transition-colors group">
    {text} {icon || <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
  </Link>
);
