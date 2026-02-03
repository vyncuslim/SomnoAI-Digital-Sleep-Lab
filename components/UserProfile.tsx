import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard.tsx';
import { 
  UserCircle, Edit2, Activity, Save, Loader2, 
  CheckCircle2, Lock, User, Info, Scale, Ruler, Brain, Heart,
  ShieldCheck, Fingerprint, ChevronRight, Mail, Sparkles,
  Zap, Database, Smartphone, AlertCircle, XCircle, Terminal
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

  const t_settings = translations[lang].settings;
  const t_registry = translations[lang].registry;

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
      
      const pUpdate = await profileApi.updateProfile({ full_name: cleanName });
      if (pUpdate.error) throw pUpdate.error;

      const uUpdate = await userDataApi.updateUserData({
        age: parseInt(formData.age.toString()) || 0,
        weight: parseFloat(formData.weight.toString()) || 0,
        height: parseFloat(formData.height.toString()) || 0,
        gender: formData.gender
      });
      if (uUpdate.error) throw uUpdate.error;
      
      setStatus('success');
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
      <header className="flex flex-col md:flex-row items-center gap-10 px-8 py-10 bg-slate-950/40 rounded-[4.5rem] border border-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] group-hover:bg-indigo-500/15 transition-all duration-1000" />
        
        <div className="relative">
          <div className="w-36 h-36 rounded-[3rem] bg-[#050a1f] border border-white/10 flex items-center justify-center text-indigo-400 shadow-[inset_0_0_60px_rgba(0,0,0,0.7)] relative overflow-hidden group">
            <AnimatePresence mode="wait">
              {profile?.full_name ? (
                <m.span key="initial" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-6xl font-black italic tracking-tighter relative z-10 drop-shadow-2xl">
                  {profile.full_name[0].toUpperCase()}
                </m.span>
              ) : (
                <m.div key="icon" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 text-slate-700">
                  <User size={64} strokeWidth={1} />
                </m.div>
              )}
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
          </div>
          <m.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 4, repeat: Infinity }} className="absolute -bottom-2 -right-2 p-4 bg-emerald-600 rounded-2xl text-white shadow-2xl border-4 border-[#020617]">
             <Fingerprint size={24} />
          </m.div>
        </div>
        
        <div className="space-y-4 text-center md:text-left relative z-10">
          <div className="flex items-center gap-3 justify-center md:justify-start">
             <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
             <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] italic">{t_registry.title} Verified</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter leading-none">
            {profile?.full_name || 'IDENTIFYING...'}
          </h1>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
             <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5 flex items-center gap-2">
               <Database size={10} /> NODE_ID: {profile?.id?.slice(0, 12).toUpperCase()}
             </span>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-12">
        <GlassCard className="p-10 md:p-16 rounded-[5rem] bg-white/[0.01] border-white/5" intensity={1.4}>
          <div className="space-y-16">
            {/* Identity Sector */}
            <div className="space-y-12">
              <div className="flex items-center justify-between border-b border-white/5 pb-8">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400 shadow-xl border border-indigo-500/20">
                    <Terminal size={24} />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-xl font-black italic text-white uppercase tracking-tight">Access Credentials</h2>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Sector Identity Calibration</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-10">
                <div className="space-y-5">
                  <label className="text-[10px] font-black uppercase text-slate-600 px-6 flex items-center gap-2 tracking-[0.4em] italic">
                    <Mail size={12} /> Email Identifier
                  </label>
                  <div className="bg-[#030712] border border-white/5 rounded-[2.5rem] px-10 py-7 text-sm text-slate-500 italic flex justify-between items-center shadow-inner group">
                    <span className="truncate pr-4 font-mono">{profile?.email}</span>
                    <Lock size={16} className="opacity-20 group-hover:opacity-40 transition-opacity" />
                  </div>
                </div>

                <div className="space-y-5">
                  <label className="text-[10px] font-black uppercase text-indigo-400 px-6 flex items-center gap-2 tracking-[0.4em] italic">
                    <Edit2 size={12} /> Callsign (Full Name)
                  </label>
                  <div className="relative">
                    <input 
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                      className={`w-full bg-[#030712] border rounded-[2.5rem] px-10 py-7 text-sm text-white focus:border-indigo-500 outline-none transition-all font-bold italic placeholder:text-slate-800 shadow-inner ${getInputBorderClass(validations.displayName, formData.displayName)}`}
                      placeholder="Specify subject identity"
                    />
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 flex gap-2">
                       {formData.displayName && (validations.displayName ? <CheckCircle2 className="text-emerald-500" size={24} /> : <XCircle className="text-rose-500" size={24} />)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Biometric Sector */}
            <div className="space-y-12">
              <div className="flex items-center justify-between border-b border-white/5 pb-8">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400 shadow-xl border border-indigo-500/20">
                    <Activity size={24} />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-xl font-black italic text-white uppercase tracking-tight">Biological Metrics</h2>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Sensor Baseline Calibration</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-5">
                  <label className="text-[10px] font-black uppercase text-slate-500 px-6 flex items-center gap-2 tracking-[0.3em] italic">
                    <Brain size={14} /> {t_settings.age}
                  </label>
                  <div className="relative">
                    <input 
                      type="number"
                      value={formData.age || ''}
                      onChange={(e) => setFormData({...formData, age: parseInt(e.target.value) || 0})}
                      className={`w-full bg-[#030712] border rounded-[2.2rem] px-10 py-7 text-sm text-white outline-none transition-all font-mono font-black italic ${getInputBorderClass(validations.age, formData.age)}`}
                    />
                    <div className="absolute right-8 top-1/2 -translate-y-1/2">
                       {formData.age > 0 && (validations.age ? <CheckCircle2 className="text-emerald-500" size={20} /> : <XCircle className="text-rose-500" size={20} />)}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-5">
                  <label className="text-[10px] font-black uppercase text-slate-500 px-6 flex items-center gap-2 tracking-[0.3em] italic">
                    <Heart size={14} /> Neural Polarity
                  </label>
                  <div className="relative">
                    <select 
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className="w-full bg-[#030712] border border-white/5 rounded-[2.2rem] px-10 py-7 text-sm text-white outline-none appearance-none cursor-pointer font-bold italic shadow-inner"
                    >
                      <option value="male">{t_settings.genderMale}</option>
                      <option value="female">{t_settings.genderFemale}</option>
                      <option value="other">{t_settings.genderOther}</option>
                      <option value="prefer-not-to-say">{t_settings.genderNone}</option>
                    </select>
                    <ChevronRight size={18} className="absolute right-8 top-1/2 -translate-y-1/2 text-indigo-500/40 rotate-90 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-5">
                  <label className="text-[10px] font-black uppercase text-slate-500 px-6 flex items-center gap-2 tracking-[0.3em] italic">
                    <Ruler size={14} /> {t_settings.height} (CM)
                  </label>
                  <div className="relative">
                    <input 
                      type="number"
                      value={formData.height || ''}
                      onChange={(e) => setFormData({...formData, height: parseFloat(e.target.value) || 0})}
                      className={`w-full bg-[#030712] border rounded-[2.2rem] px-10 py-7 text-sm text-white outline-none transition-all font-mono font-black italic ${getInputBorderClass(validations.height, formData.height)}`}
                    />
                    <div className="absolute right-8 top-1/2 -translate-y-1/2">
                       {formData.height > 0 && (validations.height ? <CheckCircle2 className="text-emerald-500" size={20} /> : <XCircle className="text-rose-500" size={20} />)}
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <label className="text-[10px] font-black uppercase text-slate-500 px-6 flex items-center gap-2 tracking-[0.3em] italic">
                    <Scale size={14} /> {t_settings.weight} (KG)
                  </label>
                  <div className="relative">
                    <input 
                      type="number"
                      value={formData.weight || ''}
                      onChange={(e) => setFormData({...formData, weight: parseFloat(e.target.value) || 0})}
                      className={`w-full bg-[#030712] border rounded-[2.2rem] px-10 py-7 text-sm text-white outline-none transition-all font-mono font-black italic ${getInputBorderClass(validations.weight, formData.weight)}`}
                    />
                    <div className="absolute right-8 top-1/2 -translate-y-1/2">
                       {formData.weight > 0 && (validations.weight ? <CheckCircle2 className="text-emerald-500" size={20} /> : <XCircle className="text-rose-500" size={20} />)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-20">
            <button 
              type="submit"
              disabled={isUpdating || !isFormValid}
              className={`w-full py-8 rounded-full font-black text-sm uppercase tracking-[0.5em] transition-all flex items-center justify-center gap-5 shadow-2xl active:scale-[0.98] italic relative overflow-hidden ${
                status === 'success' ? 'bg-emerald-600 text-white shadow-emerald-500/30' : 
                status === 'error' ? 'bg-rose-600 text-white shadow-rose-500/30' : 
                !isFormValid ? 'bg-slate-900 text-slate-700 cursor-not-allowed border border-white/5 opacity-40' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/40'
              }`}
            >
              <AnimatePresence mode="wait">
                {isUpdating ? (
                  <m.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4">
                    <Loader2 size={24} className="animate-spin" />
                    <span>Synchronizing registry...</span>
                  </m.div>
                ) : status === 'success' ? (
                  <m.div key="success" initial={{ y: 20 }} animate={{ y: 0 }} className="flex items-center gap-4">
                    <CheckCircle2 size={24} />
                    <span>Signal Optimized</span>
                  </m.div>
                ) : status === 'error' ? (
                  <m.div key="error" initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex items-center gap-4">
                    <AlertCircle size={24} />
                    <span>Sync Link Failure</span>
                  </m.div>
                ) : (
                  <m.div key="idle" initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex items-center gap-4">
                    <Zap size={20} fill="currentColor" />
                    <span>Commit Neural Registry</span>
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
      </form>

      <div className="flex flex-col md:flex-row items-center gap-10 p-12 bg-indigo-500/[0.03] border border-indigo-500/10 rounded-[5rem] relative overflow-hidden group">
        <div className="p-6 bg-indigo-500/10 rounded-[2.5rem] text-indigo-400 relative z-10 shadow-inner">
          <Sparkles size={36} />
        </div>
        <div className="space-y-3 relative z-10 text-center md:text-left">
          <h4 className="text-xs font-black uppercase text-white tracking-[0.3em] italic">Biometric Sovereignty Protocol</h4>
          <p className="text-[11px] text-slate-500 italic leading-relaxed max-w-lg">
            Your laboratory profile is processed at the edge. Physiological baselines are used exclusively for synthetic analysis and circadian shift simulation. Data remains sovereign to this node.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-1000">
           <ShieldCheck size={200} />
        </div>
      </div>
    </m.div>
  );
};