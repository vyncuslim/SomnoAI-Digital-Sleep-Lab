
import React, { useState } from 'react';
import { 
  Heart, MessageSquare, ChevronRight, Copy, QrCode, 
  Mail, Zap, LifeBuoy, Check, X, Monitor, Smartphone, MessageCircle
} from 'lucide-react';
import { PageLayout } from './ui/PageLayout';
import { Section, Card, InlineCTA } from './ui/Components';
import { motion, AnimatePresence } from 'framer-motion';
import { Language, translations } from '../services/i18n.ts';

const m = motion as any;

interface SupportViewProps {
  lang: Language;
  onBack: () => void;
  onNavigate: (view: any) => void;
}

export const SupportView: React.FC<SupportViewProps> = ({ lang, onBack, onNavigate }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showDonation, setShowDonation] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'tng' | 'paypal'>('tng');
  const t = translations[lang].support;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <PageLayout>
      <Section title={t.title}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card 
            title={t.techSupport}
            description={t.techDesc}
            icon={<LifeBuoy size={32} />}
            onClick={() => onNavigate('feedback')}
            className="cursor-pointer group"
          >
            <div className="mt-4 flex justify-end">
              <ChevronRight size={22} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
            </div>
          </Card>

          <Card 
            title="Laboratory Community"
            description="🚀 Join the SomnoAI Digital Sleep Lab community on Discord! 💬 Discuss articles, share ideas, and select your favorite topics."
            icon={<MessageCircle size={32} />}
            onClick={() => window.open('https://discord.com/invite/9EXJtRmju', '_blank')}
            className="cursor-pointer group border-indigo-500/20 bg-indigo-500/5"
          >
            <div className="mt-4 flex justify-end">
              <ChevronRight size={22} className="text-indigo-500/40 group-hover:text-indigo-400 transition-colors" />
            </div>
          </Card>
        </div>
      </Section>

      <Section title="AI Support Assistant">
        <div className="rounded-[3rem] border border-white/10 overflow-hidden bg-slate-900/40 shadow-2xl">
          <iframe
            src="https://app.livechatai.com/aibot-iframe/cmm94ogp70001ju044o63bgyk"
            style={{ border: 'none' }}
            width="100%"
            height="600"
            frameBorder="0"
            allow="microphone"
          ></iframe>
        </div>
      </Section>

      <Section title="System Ecosystem Nodes">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card 
            title={t.pcTitle}
            description={t.pcDesc}
            icon={<Monitor size={28} />}
          />
          <Card 
            title={t.mobileTitle}
            description={t.mobileDesc}
            icon={<Smartphone size={28} />}
          />
        </div>
      </Section>

      <Section title="Support the Lab">
        <div className="p-8 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Help Us Advance Sleep Science</h3>
          <p className="text-slate-400 mb-8 max-w-2xl mx-auto">Your contributions help us maintain our research infrastructure and keep basic access free for everyone.</p>
          <button 
            onClick={() => setShowDonation(true)}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2 mx-auto"
          >
            <Heart size={20} /> Make a Contribution
          </button>
        </div>
      </Section>

      <AnimatePresence>
        {showDonation && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl overflow-y-auto" onClick={() => setShowDonation(false)}>
            <m.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} 
              onClick={(e: React.MouseEvent) => e.stopPropagation()} 
              className="w-full max-w-2xl text-center space-y-12 relative bg-[#01040a] p-10 md:p-16 rounded-[5rem] border border-white/10 shadow-[0_60px_150px_-30px_rgba(0,0,0,1)]"
            >
              <button 
                onClick={() => setShowDonation(false)}
                className="absolute top-10 right-10 p-4 bg-white/5 hover:bg-rose-500/20 rounded-2xl text-slate-600 hover:text-rose-500 transition-all active:scale-90"
              >
                <X size={24} />
              </button>

              <div className="space-y-12">
                <m.div 
                  animate={{ scale: [1, 1.1, 1] }} 
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-28 h-28 rounded-[2.5rem] bg-[#f43f5e] flex items-center justify-center text-white shadow-[0_0_80px_rgba(244,63,94,0.4)] mx-auto relative group"
                >
                   <Heart size={50} fill="white" strokeWidth={0} />
                   <div className="absolute inset-0 bg-white/10 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </m.div>

                <div className="space-y-6">
                   <h2 className="text-5xl md:text-7xl font-black italic text-white uppercase tracking-tighter leading-[0.85]">
                     CONTRIBUTION<br />
                     <span className="text-indigo-400">ACKNOWLEDGED</span>
                   </h2>
                   <p className="text-sm md:text-base text-slate-500 italic max-w-md mx-auto leading-relaxed font-bold opacity-80">
                     {t.donateSubtitle}
                   </p>
                </div>

                <div className="w-full grid grid-cols-1 md:grid-cols-5 gap-10 items-start">
                  <div className="md:col-span-2 space-y-8 flex flex-col items-center">
                     <div className="flex bg-white/5 p-1.5 rounded-full border border-white/10 w-full">
                        <button 
                          onClick={() => setPaymentMethod('tng')}
                          className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${paymentMethod === 'tng' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                          TNG eWallet
                        </button>
                        <button 
                          onClick={() => setPaymentMethod('paypal')}
                          className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${paymentMethod === 'paypal' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                          PayPal
                        </button>
                     </div>
                     <div className="p-8 bg-white rounded-[4rem] shadow-[0_40px_80px_rgba(255,255,255,0.05)] ring-8 ring-white/5 overflow-hidden">
                        <img 
                          src={paymentMethod === 'tng' ? '/tng-qr.png' : '/paypal-qr.png'} 
                          alt="Donation QR Code" 
                          className="w-40 h-40 md:w-52 md:h-52 object-contain" 
                          onError={(e) => {
                            if (paymentMethod === 'paypal') {
                              e.currentTarget.src = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent('https://paypal.me/vyncuslim')}&color=000000&bgcolor=ffffff&margin=4&ecc=M`;
                            } else {
                              e.currentTarget.src = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent('Touch n Go eWallet')}&color=000000&bgcolor=ffffff&margin=4&ecc=M`;
                            }
                          }}
                        />
                     </div>
                     <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.5em] flex items-center gap-3 italic">
                       <QrCode size={16} /> SCAN TO {paymentMethod === 'tng' ? 'TNG EWALLET' : 'PAYPAL'}
                     </p>
                  </div>

                  <div className="md:col-span-3 space-y-5 text-left">
                    {[
                      { id: 'duitnow', label: 'TNG / DUITNOW', value: '+60 187807388' }, 
                      { id: 'paypal', label: 'PAYPAL DISPATCH', value: 'vyncuslim@icloud.com' },
                      { id: 'support_email', label: 'SUPPORT NODE', value: 'support@sleepsomno.com' },
                      { id: 'info_email', label: 'INFO NODE', value: 'info@sleepsomno.com' },
                      { id: 'admin_email', label: 'ADMIN NODE', value: 'admin@sleepsomno.com' },
                      { id: 'legal_email', label: 'LEGAL NODE', value: 'termandcondition@sleepsomno.com' }
                    ].map((item) => (
                      <div key={item.id} className="p-6 bg-slate-900 border border-white/5 rounded-[2rem] flex items-center justify-between group hover:border-indigo-500/40 transition-all shadow-inner">
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">{item.label}</p>
                          <p className="text-sm font-black text-white italic tracking-tight truncate max-w-[150px]">{item.value}</p>
                        </div>
                        <button 
                          onClick={() => handleCopy(item.id, item.value)} 
                          className={`p-3 rounded-xl transition-all active:scale-90 ${copiedId === item.id ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-700 hover:text-white bg-black/40'}`}
                        >
                           {copiedId === item.id ? <Check size={18} /> : <Copy size={18} />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </m.div>
          </div>
        )}
      </AnimatePresence>

      <div className="text-center pt-12 border-t border-white/5">
        <InlineCTA text="Return to Dashboard" link="/dashboard" />
      </div>
    </PageLayout>
  );
};
