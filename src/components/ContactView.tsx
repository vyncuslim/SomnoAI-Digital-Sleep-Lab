import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Phone, MapPin, MessageSquare, Send } from 'lucide-react';


interface ContactViewProps {
  lang: 'en' | 'zh' | 'es';
  onBack: () => void;
}

const m = motion as any;

export const ContactView: React.FC<ContactViewProps> = ({ lang, onBack }) => {
  const isZh = lang === 'zh';

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen bg-gradient-to-br from-[#01040a] to-slate-950 text-slate-200 p-8 md:p-16 relative overflow-hidden"
    >
      <button onClick={onBack} className="absolute top-8 left-8 text-slate-400 hover:text-indigo-400 transition-colors flex items-center gap-2 text-sm font-bold uppercase tracking-widest italic z-20">
        <ArrowLeft size={16} /> {isZh ? '返回' : 'Back'}
      </button>

      <div className="max-w-3xl mx-auto space-y-20 relative z-10 pt-16">
        <div className="text-center space-y-8">

          <h1 className="text-7xl font-black italic text-white uppercase tracking-tighter drop-shadow-2xl">
            {isZh ? '联系我们' : 'Contact Us'}
          </h1>
          <p className="text-xl text-slate-400 font-bold italic max-w-2xl mx-auto leading-relaxed">
            {isZh ? '我们随时为您提供帮助。请通过以下方式联系我们。' : 'We\'re here to help. Reach out to us through the following channels.'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-6 bg-slate-900/50 border border-white/10 rounded-3xl p-8 shadow-xl text-center">
            <Mail size={48} className="text-indigo-400 mx-auto" />
            <h3 className="text-xl font-black italic text-indigo-300 uppercase tracking-wide">{isZh ? '电子邮件' : 'Email Us'}</h3>
            <p className="text-base text-slate-300">
              {isZh ? '获取一般查询和支持。' : 'For general inquiries and support.'}
            </p>
            <a href="mailto:contact@sleepsomno.com" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full font-bold text-sm uppercase tracking-widest italic hover:bg-indigo-500 transition-all active:scale-95">
              <Send size={16} /> contact@sleepsomno.com
            </a>
          </div>
          <div className="space-y-6 bg-slate-900/50 border border-white/10 rounded-3xl p-8 shadow-xl text-center">
            <MessageSquare size={48} className="text-emerald-400 mx-auto" />
            <h3 className="text-xl font-black italic text-emerald-300 uppercase tracking-wide">{isZh ? '实时聊天' : 'Live Chat'}</h3>
            <p className="text-base text-slate-300">
              {isZh ? '与我们的支持团队即时沟通。' : 'Chat instantly with our support team.'}
            </p>
            <button onClick={() => (window as any).Salesmartly('open')} className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-full font-bold text-sm uppercase tracking-widest italic hover:bg-emerald-500 transition-all active:scale-95">
              <MessageSquare size={16} /> {isZh ? '开始聊天' : 'Start Chat'}
            </button>
          </div>
        </div>

        <div className="space-y-12 text-center pt-10">
          <h2 className="text-5xl font-black italic text-white uppercase tracking-tighter">
            {isZh ? '我们的位置' : 'Our Location'}
          </h2>
          <div className="flex flex-col items-center gap-4 bg-slate-900/50 border border-white/10 rounded-3xl p-8 shadow-xl">
            <MapPin size={48} className="text-blue-400" />
            <p className="text-lg font-bold text-slate-300 leading-relaxed">
              {isZh ? 'SomnoAI 睡眠实验室总部' : 'SomnoAI Digital Sleep Lab Headquarters'}
            </p>
            <p className="text-base text-slate-400 leading-relaxed">
              {isZh ? '123 睡眠大道，梦境市，加利福尼亚州 90210' : '123 Slumber Avenue, Dreamville, CA 90210'}
            </p>
          </div>
        </div>
      </div>
    </m.div>
  );
};
