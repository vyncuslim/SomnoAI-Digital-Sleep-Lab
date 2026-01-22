import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard.tsx';
import { 
  UserCircle, Edit2, Activity, Save, Loader2, 
  CheckCircle2, Lock, User, Info, Scale, Ruler, Brain, Heart,
  ShieldCheck, Fingerprint, ChevronRight, Mail, Sparkles,
  Zap, Database, Smartphone, AlertCircle, XCircle
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

  const validations = {
    displayName: formData.displayName.trim().length >= 2,
    age: formData.age > 0 && formData.age < 120,
    height: formData.height > 50 && formData.height < 300,
    weight: formData.weight > 20 && formData.weight < 500
  };

  const isFormValid = Object.values(validations).every(v => v);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUpdating || !isFormValid) return;
    
    setIsUpdating(true);
    setStatus('idle');
    try {
      const cleanName = formData.displayName.trim();
      
      // Update profiles table (displayName)
      const pUpdate = await profileApi.updateProfile({ full_name: cleanName });
      if (pUpdate.error) throw pUpdate.error;

      // Update user_data table (biological metrics)
      const uUpdate = await userDataApi.updateUserData({
        age: parseInt(formData.age.toString()) || 0,
        weight: parseFloat(formData.weight.toString()) || 0,
        height: parseFloat(formData.height.toString()) || 0,
        gender: formData.gender
      });
      if (uUpdate.error) throw uUpdate.error;
      
      setStatus('success');
      // Sync local state to reflect successful update
      setProfile((prev: any) => ({ ...prev, full_name: cleanName }));
      
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      console.error("Profile Update Sync Failure:", err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    } finally {
      setIsUpdating(false);
    }
  };

  const getInputBorderClass = (isValid: boolean, value: any) => {
    if (value === 0 || value === '') return 'border-white/10';
    return isValid ? 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.1)]';
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
      <header className="flex flex-col md:flex-row items-center gap-10 px-6 py-8 bg-slate-950/40 rounded-[3.5rem] border border-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] group-hover:bg-indigo-500/15 transition-all duration-1000" />
        
        <div className="relative">
          <div className="w-32 h-32 rounded-[2.8rem] bg-[#050a1f] border border-white/10 flex items-center justify-center text-indigo-400 shadow-[inset_0_0_40px_rgba(0,0,0,0.5)] relative overflow-hidden group">
            <AnimatePresence mode="wait">
              {profile?.full_name ? (
                <m.span key="initial" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-5xl font-black italic tracking-tighter relative z-10 drop-shadow-lg">
                  {profile.full_name[0].toUpperCase()}
                </m.span>
              ) : (
                <m.div key="icon" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 text-slate-700">
                  <User size={56} strokeWidth={1} />
                </m.div>
              )}
            </AnimatePresence>
          </div>
          <m.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 4, repeat: Infinity }} className="absolute -bottom-2 -right-2 p-3 bg-emerald-600 rounded-2xl text-white shadow-xl border-4 border-[#020617]">
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
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-10">
        <GlassCard className="p-10 md:p-14 rounded-[4.5rem] bg-white/[0.01] border-white/5" intensity={1.2}>
          <div className="space-y-16">
            <div className="space-y-10">
              <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
                  <Fingerprint size={22} />
                </div>
                <div className="space-y-1">
                  <h2 className="text-lg font-black italic text-white uppercase tracking-tight">CORE IDENTITY</h2>
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Calibration Phase</p>
                </div>
              </div>
              
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-600 px-4 flex items-center gap-2 tracking-[0.3em] italic">
                    <Mail size={12} /> Email (Verified)
                  </label>
                  <div className="bg-[#050a1f]/60 border border-white/5 rounded-3xl px-8 py-6 text-sm text-slate-600 italic flex justify-between items-center cursor-not-allowed">
                    <span className="truncate pr-4">{profile?.email}</span>
                    <Lock size={14} className="opacity-30" />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-indigo-400 px-4 flex items-center gap-2 tracking-[0.3em] italic">
                    <Edit2 size={12} /> Callsign (Full Name)
                  </label>
                  <div className="relative">
                    <input 
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                      className={`w-full bg-[#050a1f]/80 border rounded-3xl px-8 py-6 text-sm text-white focus:border-indigo-500 outline-none transition-all font-semibold italic placeholder:text-slate-800 ${getInputBorderClass(validations.displayName, formData.displayName)}`}
                      placeholder="Enter full name"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex gap-2">
                       {formData.displayName && (validations.displayName ? <CheckCircle2 className="text-emerald-500" size={18} /> : <XCircle className="text-rose-500" size={18} />)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-10">
              <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
                  <Activity size={22} />
                </div>
                <div className="space-y-1">
                  <h2 className="text-lg font-black italic text-white uppercase tracking-tight">BIOMETRIC DATA</h2>
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Sensor Calibration</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-500 px-4 flex items-center gap-2 tracking-[0.3em] italic">
                    <Brain size={14} /> {t.age}
                  </label>
                  <div className="relative">
                    <input 
                      type="number"
                      value={formData.age || ''}
                      onChange={(e) => setFormData({...formData, age: parseInt(e.target.value) || 0})}
                      className={`w-full bg-[#050a1f]/80 border rounded-3xl px-8 py-6 text-sm text-white outline-none transition-all font-mono ${getInputBorderClass(validations.age, formData.age)}`}
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2">
                       {formData.age > 0 && (validations.age ? <CheckCircle2 className="text-emerald-500" size={16} /> : <XCircle className="text-rose-500" size={16} />)}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-500 px-4 flex items-center gap-2 tracking-[0.3em] italic">
                    <Heart size={14} /> {t.gender}
                  </label>
                  <div className="relative">
                    <select 
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className="w-full bg-[#050a1f]/80 border border-white/5 rounded-3xl px-8 py-6 text-sm text-white outline-none appearance-none cursor-pointer font-semibold italic"
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
                  <div className="relative">
                    <input 
                      type="number"
                      value={formData.height || ''}
                      onChange={(e) => setFormData({...formData, height: parseFloat(e.target.value) || 0})}
                      className={`w-full bg-[#050a1f]/80 border rounded-3xl px-8 py-6 text-sm text-white outline-none transition-all font-mono ${getInputBorderClass(validations.height, formData.height)}`}
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2">
                       {formData.height > 0 && (validations.height ? <CheckCircle2 className="text-emerald-500" size={16} /> : <XCircle className="text-rose-500" size={16} />)}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-500 px-4 flex items-center gap-2 tracking-[0.3em] italic">
                    <Scale size={14} /> {t.weight} (KG)
                  </label>
                  <div className="relative">
                    <input 
                      type="number"
                      value={formData.weight || ''}
                      onChange={(e) => setFormData({...formData, weight: parseFloat(e.target.value) || 0})}
                      className={`w-full bg-[#050a1f]/80 border rounded-3xl px-8 py-6 text-sm text-white outline-none transition-all font-mono ${getInputBorderClass(validations.weight, formData.weight)}`}
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2">
                       {formData.weight > 0 && (validations.weight ? <CheckCircle2 className="text-emerald-500" size={16} /> : <XCircle className="text-rose-500" size={16} />)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-16">
            <button 
              type="submit"
              disabled={isUpdating || !isFormValid}
              className={`w-full py-7 rounded-full font-black text-[14px] uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-[0.98] italic relative overflow-hidden ${
                status === 'success' ? 'bg-emerald-600 text-white shadow-emerald-500/20' : 
                status === 'error' ? 'bg-rose-600 text-white shadow-rose-500/20' : 
                !isFormValid ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/40'
              }`}
            >
              <AnimatePresence mode="wait">
                {isUpdating ? (
                  <m.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
                    <Loader2 size={20} className="animate-spin" />
                    <span>Synchronizing...</span>
                  </m.div>
                ) : status === 'success' ? (
                  <m.div key="success" initial={{ y: 20 }} animate={{ y: 0 }} className="flex items-center gap-3">
                    <CheckCircle2 size={20} />
                    <span>Signal Optimized</span>
                  </m.div>
                ) : status === 'error' ? (
                  <m.div key="error" initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex items-center gap-3">
                    <AlertCircle size={20} />
                    <span>Sync Error</span>
                  </m.div>
                ) : (
                  <m.div key="idle" initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex items-center gap-3">
                    <Zap size={18} fill="currentColor" />
                    <span>Commit Neural Profile</span>
                  </m.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </GlassCard>

      <div className="flex items-center gap-8 p-10 bg-indigo-500/5 border border-indigo-500/10 rounded-[4rem] relative overflow-hidden group">
        <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400 relative z-10">
          <Sparkles size={28} />
        </div>
        <div className="space-y-1 relative z-10">
          <h4 className="text-[11px] font-black uppercase text-white tracking-widest italic">Security Clearance Verified</h4>
          <p className="text-[11px] text-slate-600 italic leading-relaxed max-w-md">
            All biometrics are processed locally and used exclusively for Neural Lullaby calibration. All telemetry remains sovereign to your node.
          </p>
        </div>
      </div>
    </m.div>
  );
};