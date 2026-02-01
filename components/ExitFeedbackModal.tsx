
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Send, X, Loader2, CheckCircle2, Moon, Zap, ShieldAlert } from 'lucide-react';
import { GlassCard } from './GlassCard.tsx';
import { feedbackApi, supabase } from '../services/supabaseService.ts';
import { Language, translations } from '../services/i18n.ts';
import { Logo } from './Logo.tsx';

const m = motion as any;

interface ExitFeedbackModalProps {
  isOpen: boolean;
  lang: Language;
  onConfirmLogout: () => void;
}

export const ExitFeedbackModal: React.FC<ExitFeedbackModalProps> = ({ isOpen, lang, onConfirmLogout }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const t = translations[lang].feedback;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await (supabase.auth as any).getUser();
      const email = user?.email || 'anonymous_node';
      
      const feedbackContent = `[RATING: ${rating}/5 stars]\nComment: ${comment || 'No comment provided.'}`;
      
      // 使用现有的提交接口发送至数据库并触发管理员告警
      await feedbackApi.submitFeedback('suggestion', feedbackContent, email);
      
      setIsSuccess(true);
      setTimeout(() => onConfirmLogout(), 1500);
    } catch (err) {
      // 即使出错也允许退出
      onConfirmLogout();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6 bg-[#020617]/95 backdrop-blur-2xl">
          <m.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-lg"
          >
            <GlassCard className="p-10 md:p-14 border-indigo-500/20 shadow-[0_100px_200px_-50px_rgba(0,0,0,1)] rounded-[4rem]">
              <div className="text-center space-y-8">
                <div className="relative inline-block">
                   <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full animate-pulse" />
                   <Logo size={80} animated={!isSuccess} className="mx-auto relative z-10" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter leading-none">{t.exitTitle}</h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] italic">{t.exitSubtitle}</p>
                </div>

                <AnimatePresence mode="wait">
                  {isSuccess ? (
                    <m.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="py-12 space-y-4">
                       <CheckCircle2 size={64} className="text-emerald-500 mx-auto" />
                       <p className="text-sm font-black text-emerald-400 uppercase tracking-widest italic">{t.success}</p>
                    </m.div>
                  ) : (
                    <m.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-10">
                      <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                            className="p-1 transition-all active:scale-90"
                          >
                            <Star 
                              size={36} 
                              fill={(hoverRating || rating) >= star ? '#818cf8' : 'transparent'} 
                              className={(hoverRating || rating) >= star ? 'text-indigo-400 drop-shadow-[0_0_10px_rgba(129,140,248,0.5)]' : 'text-slate-800'}
                            />
                          </button>
                        ))}
                      </div>

                      <div className="space-y-4">
                        <textarea 
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder={t.commentPlaceholder}
                          className="w-full bg-black/40 border border-white/5 rounded-[2rem] p-6 text-sm text-slate-300 outline-none focus:border-indigo-500/30 transition-all min-h-[100px] italic resize-none"
                        />
                      </div>

                      <div className="flex flex-col gap-4">
                        <button 
                          onClick={handleSubmit}
                          disabled={rating === 0 || isSubmitting}
                          className={`w-full py-6 rounded-full font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all shadow-xl italic ${rating > 0 ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-slate-900 text-slate-700 cursor-not-allowed border border-white/5'}`}
                        >
                          {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} fill="currentColor" />}
                          {t.submitAndLogout}
                        </button>
                        
                        <button 
                          onClick={onConfirmLogout}
                          disabled={isSubmitting}
                          className="w-full py-4 text-[10px] font-black text-slate-600 hover:text-white uppercase tracking-widest transition-colors italic"
                        >
                          {t.skipAndLogout}
                        </button>
                      </div>
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            </GlassCard>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
};
