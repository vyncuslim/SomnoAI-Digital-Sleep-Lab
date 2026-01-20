
import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard.tsx';
import { 
  UserCircle, Edit2, Activity, Save, Loader2, 
  CheckCircle2, Lock, User, Info, Scale, Ruler, Brain, Heart,
  ShieldCheck, Fingerprint, ChevronRight, Mail, Sparkles,
  Zap, Database, Smartphone
} from 'lucide-react';
import { Language, translations } from '../services/i18n.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { profileApi, userDataApi } from '../services/supabaseService.ts';

const m = motion as any;

interface UserProfileProps {
  lang: Language;
}

export const UserProfile: React.FC<UserProfileProps> = ({ lang }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    displayName: '',
    age: 0,
    weight: 0,
    height: 0,
    gender: 'prefer-not-to-say'
  });

  const t = translations[lang].settings;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [profileData, metricsData] = await Promise.all([
          profileApi.getMyProfile(),
          userDataApi.getUserData()
        ]);

        if (profileData) {
          setProfile(profileData);
          setFormData({
            displayName: profileData.full_name || '',
            age: metricsData?.age || 0,
            weight: metricsData?.weight || 0,
            height: metricsData?.height || 0,
            gender: metricsData?.gender || 'prefer-not-to-say'
          });
        }
      } catch (err) {
        console.error("Profile Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUpdating) return;
    
    setIsUpdating(true);
    setStatus('idle');
    try {
      // 执行原子化更新：Profile (姓名) 与 UserData (生理指标)
      await Promise.all([
        profileApi.updateProfile({ full_name: formData.displayName }),
        userDataApi.updateUserData({
          age: parseInt(formData.age.toString()) || 0,
          weight: parseFloat(formData.weight.toString()) || 0,
          height: parseFloat(formData.height.toString()) || 0,
          gender: formData.gender
        })
      ]);
      
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      console.error("Profile Update Error:", err);
      setStatus('error');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6 text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full animate-pulse" />
          <Loader2 className="animate-spin text-indigo-500 relative z-10" size={48} />
        </div>
        <div className="space-y-2">
          <p className="text-[11px] font-black text-white uppercase tracking-[0.4em] italic">Accessing Neural Registry...</p>
          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Decryption In Progress</p>
        </div>
      </div>
    );
  }

  return (
    <m.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 pb-40 max-w-2xl mx-auto px-4 font-sans text-left"
    >
      {/* 头部：受试者识别卡 */}
      <header className="flex flex-col md:flex-row items-center gap-10 px-6 py-8 bg-slate-950/40 rounded-[3.5rem] border border-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] group-hover:bg-indigo-500/15 transition-all duration-1000" />
        
        <div className="relative">
          <div className="w-32 h-32 rounded-[2.8rem] bg-[#050a1f] border border-white/10 flex items-center justify-center text-indigo-400 shadow-[inset_0_0_40px_rgba(0,0,0,0.5)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <AnimatePresence mode="wait">
              {formData.displayName ? (
                <m.span 
                  key="initial" 
                  initial={{ opacity: 0, scale: 0.8 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  className="text-5xl font-black italic tracking-tighter relative z-10 drop-shadow-lg"
                >
                  {formData.displayName[0].toUpperCase()}
                </m.span>
              ) : (
                <m.div key="icon" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 text-slate-700">
                  <User size={56} strokeWidth={1} />
                </m.div>
              )}
            </AnimatePresence>
          </div>
          <m.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -bottom-2 -right-2 p-3 bg-emerald-600 rounded-2xl text-white shadow-xl border-4 border-[#020617]"
          >
             <ShieldCheck size={18} />
          </m.div>
        </div>
        
        <div className="space-y-3 text-center md:text-left relative z-10">
          <div className="flex items-center gap-3 justify-center md:justify-start">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em]">{lang === 'zh' ? '受试者状态：活跃' : 'SUBJECT STATUS: ACTIVE'}</span>
          </div>
          <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none">
            {profile?.full_name || 'IDENTIFYING...'}
          </h1>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
             <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5 flex items-center gap-2">
               <Database size={10} /> {profile?.id?.slice(0, 16).toUpperCase()}
             </span>
             <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5 flex items-center gap-2">
               <Smartphone size={10} /> EDGE NODE
             </span>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-10">
        <GlassCard className="p-10 md:p-14 rounded-[4.5rem] bg-white/[0.01] border-white/5" intensity={1.2}>
          <div className="space-y-16">
            {/* 身份组 */}
            <div className="space-y-10">
              <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
                  <Fingerprint size={22} />
                </div>
                <div className="space-y-1">
                  <h2 className="text-lg font-black italic text-white uppercase tracking-tight">{lang === 'zh' ? '核心身份注册' : 'CORE IDENTITY REGISTRY'}</h2>
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Identity Handshake Protocol</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-600 px-4 flex items-center gap-2 tracking-[0.3em] italic">
                    <Mail size={12} /> Identifier Email (Read-Only)
                  </label>
                  <div className="bg-[#050a1f]/60 border border-white/5 rounded-3xl px-8 py-6 text-sm text-slate-600 italic flex justify-between items-center group cursor-not-allowed">
                    <span className="truncate pr-4">{profile?.email}</span>
                    <Lock size={14} className="opacity-30" />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-indigo-400 px-4 flex items-center gap-2 tracking-[0.3em] italic">
                    <Edit2 size={12} /> Subject Callsign (Full Name)
                  </label>
                  <input 
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                    className="w-full bg-[#050a1f]/80 border border-white/10 rounded-3xl px-8 py-6 text-sm text-white focus:border-indigo-500 outline-none transition-all font-semibold italic placeholder:text-slate-800 focus:shadow-[0_0_30px_rgba(79,70,229,0.15)]"
                    placeholder="Enter full name"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 生物指标组 */}
            <div className="space-y-10">
              <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
                  <Activity size={22} />
                </div>
                <div className="space-y-1">
                  <h2 className="text-lg font-black italic text-white uppercase tracking-tight">{t.personalInfo}</h2>
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Biometric Signal Calibration</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-500 px-4 flex items-center gap-2 tracking-[0.3em] italic">
                    <Brain size={14} /> {t.age}
                  </label>
                  <input 
                    type="number"
                    min="1"
                    max="120"
                    value={formData.age || ''}
                    onChange={(e) => setFormData({...formData, age: parseInt(e.target.value) || 0})}
                    className="w-full bg-[#050a1f]/80 border border-white/5 rounded-3xl px-8 py-6 text-sm text-white outline-none focus:border-indigo-500/30 transition-all font-mono"
                    placeholder="Years"
                  />
                </div>
                
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-500 px-4 flex items-center gap-2 tracking-[0.3em] italic">
                    <Heart size={14} /> {t.gender}
                  </label>
                  <div className="relative">
                    <select 
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className="w-full bg-[#050a1f]/80 border border-white/5 rounded-3xl px-8 py-6 text-sm text-white outline-none appearance-none cursor-pointer focus:border-indigo-500/30 transition-all font-semibold italic"
                    >
                      <option value="male">{t.genderMale}</option>
                      <option value="female">{t.genderFemale}</option>
                      <option value="other">{t.genderOther}</option>
                      <option value="prefer-not-to-say">{t.genderNone}</option>
                    </select>
                    <ChevronRight size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 rotate-90 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-500 px-4 flex items-center gap-2 tracking-[0.3em] italic">
                    <Ruler size={14} /> {t.height} (CM)
                  </label>
                  <input 
                    type="number"
                    step="0.1"
                    min="1"
                    value={formData.height || ''}
                    onChange={(e) => setFormData({...formData, height: parseFloat(e.target.value) || 0})}
                    className="w-full bg-[#050a1f]/80 border border-white/5 rounded-3xl px-8 py-6 text-sm text-white outline-none focus:border-indigo-500/30 transition-all font-mono"
                    placeholder="0.0"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-500 px-4 flex items-center gap-2 tracking-[0.3em] italic">
                    <Scale size={14} /> {t.weight} (KG)
                  </label>
                  <input 
                    type="number"
                    step="0.1"
                    min="1"
                    value={formData.weight || ''}
                    onChange={(e) => setFormData({...formData, weight: parseFloat(e.target.value) || 0})}
                    className="w-full bg-[#050a1f]/80 border border-white/5 rounded-3xl px-8 py-6 text-sm text-white outline-none focus:border-indigo-500/30 transition-all font-mono"
                    placeholder="0.0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 提交区域 */}
          <div className="pt-16">
            <button 
              type="submit"
              disabled={isUpdating}
              className={`w-full py-7 rounded-full font-black text-[14px] uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-[0.98] italic relative overflow-hidden ${
                status === 'success' 
                  ? 'bg-emerald-600 text-white shadow-emerald-500/20' 
                  : status === 'error' 
                    ? 'bg-rose-600 text-white shadow-rose-500/20' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/40'
              } disabled:opacity-50`}
            >
              <AnimatePresence mode="wait">
                {isUpdating ? (
                  <m.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
                    <Loader2 size={20} className="animate-spin" />
                    <span>Synchronizing...</span>
                  </m.div>
                ) : status === 'success' ? (
                  <m.div key="success" initial={{ y: 20 }} animate={{ y: 0 }} className="flex items-center gap-3">
                    <CheckCircle2 size={20} />
                    <span>Signal Optimized</span>
                  </m.div>
                ) : (
                  <m.div key="idle" initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex items-center gap-3">
                    <Zap size={18} fill="currentColor" />
                    <span>Commit Neural Profile</span>
                  </m.div>
                )}
              </AnimatePresence>
              
              {isUpdating && (
                <m.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                />
              )}
            </button>
          </div>
        </GlassCard>

        {/* 隐私与安全页脚 */}
        <div className="flex items-center gap-8 p-10 bg-indigo-500/5 border border-indigo-500/10 rounded-[4rem] relative overflow-hidden group">
          <div className="absolute inset-0 bg-indigo-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400 relative z-10">
            <Sparkles size={28} />
          </div>
          <div className="space-y-1 relative z-10">
            <h4 className="text-[11px] font-black uppercase text-white tracking-widest italic">Security Clearance Verified</h4>
            <p className="text-[11px] text-slate-600 italic leading-relaxed max-w-md">
              Subject biometrics are encrypted and used exclusively for Neural Lullaby and Insight Synthesis protocols. All telemetry remains sovereign to the user node.
            </p>
          </div>
        </div>
      </header>
    </m.div>
  );
};
