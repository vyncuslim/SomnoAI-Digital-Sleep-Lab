import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Zap, Shield, Globe, Mail, Phone, MapPin } from 'lucide-react';


interface AboutViewProps {
  lang: 'en' | 'zh' | 'es';
  onBack: () => void;
  onNavigate: (path: string) => void;
}

const m = motion as any;

export const AboutView: React.FC<AboutViewProps> = ({ lang, onBack, onNavigate }) => {
  const isZh = lang === 'zh';

  const teamMembers = [
    { name: 'Dr. Alex Chen', role: isZh ? '首席神经科学官' : 'Chief Neuroscience Officer', bio: isZh ? '专注于人机接口和神经可塑性。' : 'Focuses on brain-computer interfaces and neuroplasticity.', img: 'https://picsum.photos/seed/alex/100/100' },
    { name: 'Dr. Maya Singh', role: isZh ? '首席AI伦理官' : 'Chief AI Ethics Officer', bio: isZh ? '领导AI模型中的公平性和透明度。' : 'Leads fairness and transparency in AI models.', img: 'https://picsum.photos/seed/maya/100/100' },
    { name: 'Dr. Ben Carter', role: isZh ? '首席生物工程官' : 'Chief Bioengineering Officer', bio: isZh ? '开发可穿戴传感器和生物遥测系统。' : 'Develops wearable sensors and bio-telemetry systems.', img: 'https://picsum.photos/seed/ben/100/100' },
  ];

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

      <div className="max-w-4xl mx-auto space-y-24 relative z-10 pt-16">
        <div className="text-center space-y-8">

          <h1 className="text-7xl font-black italic text-white uppercase tracking-tighter drop-shadow-2xl">
            {isZh ? '关于 SomnoAI' : 'About SomnoAI'}
          </h1>
          <p className="text-xl text-slate-400 font-bold italic max-w-2xl mx-auto leading-relaxed">
            {isZh ? '我们是 SomnoAI 睡眠实验室，致力于通过尖端AI和神经科学重新定义睡眠恢复。' : 'We are SomnoAI Digital Sleep Lab, dedicated to redefining sleep restoration through cutting-edge AI and neuroscience.'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-16">
          <div className="space-y-6">
            <h2 className="text-4xl font-black italic text-indigo-400 uppercase tracking-tighter">
              {isZh ? '我们的使命' : 'Our Mission'}
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed">
              {isZh ? '我们的使命是解锁睡眠的全部潜力，将其从被动状态转变为主动恢复和认知增强的强大工具。我们相信，通过深入理解和优化睡眠，人类可以实现前所未有的健康和表现水平。' : 'Our mission is to unlock the full potential of sleep, transforming it from a passive state into a powerful tool for active recovery and cognitive enhancement. We believe that by deeply understanding and optimizing sleep, humanity can achieve unprecedented levels of well-being and performance.'}
            </p>
          </div>
          <div className="space-y-6">
            <h2 className="text-4xl font-black italic text-emerald-400 uppercase tracking-tighter">
              {isZh ? '我们的愿景' : 'Our Vision'}
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed">
              {isZh ? '我们设想一个未来，每个人都能获得个性化的睡眠优化方案，这些方案由最先进的AI驱动，并以严谨的科学研究为基础。我们的目标是创建一个无缝的数字生态系统，让用户能够轻松监控、分析和改善他们的睡眠模式。' : 'We envision a future where personalized sleep optimization is accessible to everyone, driven by state-of-the-art AI and grounded in rigorous scientific research. Our goal is to create a seamless digital ecosystem that empowers users to effortlessly monitor, analyze, and improve their sleep patterns.'}
            </p>
          </div>
        </div>

        <div className="space-y-12">
          <h2 className="text-5xl font-black italic text-white uppercase tracking-tighter text-center">
            {isZh ? '我们的团队' : 'Our Team'}
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            {teamMembers.map((member, index) => (
              <m.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 text-center space-y-6 shadow-xl"
              >
                <img src={member.img} alt={member.name} className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-indigo-500/50 shadow-lg" referrerPolicy="no-referrer" />
                <h3 className="text-xl font-black italic text-indigo-300 uppercase tracking-wide">{member.name}</h3>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{member.role}</p>
                <p className="text-base text-slate-300 leading-relaxed">{member.bio}</p>
              </m.div>
            ))}
          </div>
        </div>

        <div className="space-y-12 text-center">
          <h2 className="text-5xl font-black italic text-white uppercase tracking-tighter">
            {isZh ? '我们的技术' : 'Our Technology'}
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-4 bg-slate-900/50 border border-white/10 rounded-3xl p-8 shadow-xl">
              <Zap size={48} className="text-indigo-400 mx-auto" />
              <h3 className="text-xl font-black italic text-indigo-300 uppercase tracking-wide">{isZh ? 'AI驱动洞察' : 'AI-Powered Insights'}</h3>
              <p className="text-base text-slate-300">{isZh ? '利用Gemini AI分析您的睡眠数据，提供个性化建议。' : 'Leveraging Gemini AI to analyze your sleep data and provide personalized recommendations.'}</p>
            </div>
            <div className="space-y-4 bg-slate-900/50 border border-white/10 rounded-3xl p-8 shadow-xl">
              <Shield size={48} className="text-emerald-400 mx-auto" />
              <h3 className="text-xl font-black italic text-emerald-300 uppercase tracking-wide">{isZh ? '量子安全' : 'Quantum Secure'}</h3>
              <p className="text-base text-slate-300">{isZh ? '您的数据安全是我们的首要任务，采用最先进的加密技术。' : 'Your data security is our top priority, employing state-of-the-art encryption.'}</p>
            </div>
            <div className="space-y-4 bg-slate-900/50 border border-white/10 rounded-3xl p-8 shadow-xl">
              <Globe size={48} className="text-blue-400 mx-auto" />
              <h3 className="text-xl font-black italic text-blue-300 uppercase tracking-wide">{isZh ? '全球覆盖' : 'Global Reach'}</h3>
              <p className="text-base text-slate-300">{isZh ? '支持多语言和全球用户，无论您身在何处。' : 'Supporting multiple languages and global users, wherever you are.'}</p>
            </div>
          </div>
        </div>

        <div className="text-center pt-16">
          <button onClick={() => onNavigate('contact')} className="inline-flex items-center gap-4 px-10 py-5 bg-indigo-600 text-white rounded-full font-black text-lg uppercase tracking-widest italic hover:bg-indigo-500 transition-all active:scale-95 shadow-lg">
            <Mail size={24} /> {isZh ? '联系我们' : 'Contact Us'}
          </button>
        </div>
      </div>
    </m.div>
  );
};
