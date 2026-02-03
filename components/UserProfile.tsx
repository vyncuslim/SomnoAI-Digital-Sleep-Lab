
import React, { useState, useEffect, useMemo } from 'react';
import { GlassCard } from './GlassCard.tsx';
// Fix: Added missing Logo import to resolve compilation error
import { Logo } from './Logo.tsx';
import { 
  UserCircle, Edit2, Activity, Save, Loader2, 
  CheckCircle2, Lock, User, Info, Scale, Ruler, Brain, Heart,
  ShieldCheck, Fingerprint, ChevronRight, Mail, Sparkles,
  Zap, Database, Smartphone, AlertCircle, XCircle, Terminal,
  RefreshCw, BarChart3, Binary
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
      console.error("Registry Node Fetch Error:", err);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const validations = useMemo(() => ({
    displayName: formData.displayName.trim().length >= 2,
    age: formData.age > 0 && formData.age < 120,
    height: formData.height > 50 && formData.height < 300,
    weight: formData.weight > 20 && formData.weight < 500,
    gender: formData.gender !== 'prefer-not-to-say'
  }), [formData]);

  const integrityScore = useMemo(() => {
    const validCount = Object.values(validations).filter(v => v).length;
    const totalCount = Object.values(validations).length;
    return Math.round((validCount / totalCount) * 100);
  }, [validations]);

  const isFormValid = validations.displayName && validations.age && validations.height && validations.weight;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUpdating || !isFormValid) return;
    
    setIsUpdating(true);
    setStatus('idle');
    try {
      const cleanName = formData.displayName.trim();
      
      // Perform mirrored commit to Profile (Core Identity) and UserData (Biometric Stats)
      const [pRes, uRes] = await Promise.all([
        profileApi.updateProfile({ full_name: cleanName }),
        userDataApi.updateUserData({
          age: parseInt(formData.age.toString()) || 0,
          weight: parseFloat(formData.weight.toString()) || 0,
          height: parseFloat(formData.height.toString()) || 0,
          gender: formData.gender
        })
      ]);

      if (pRes.error || uRes.error) throw new Error("UPSTREAM_SYNC_VOID");

      setStatus('success');
      setProfile((prev: any) => ({ ...prev, full_name: cleanName }));
      setTimeout(() => setStatus('idle'), 4000);
    } catch (err) {
      console.error("Commit Protocol Failure:", err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (isValid: boolean, value: any) => {
    if (value === 0 || value === '' || value === 'prefer-not-to-say') return 'border-white/5 bg-white/[0.02]';
    return isValid 
      ? 'border-emerald-500/30 bg-emerald-500/[0.03] text-emerald-400' 
      : 'border-rose-500/30 bg-rose-500/[0.03] text-rose-400';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-8 text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full animate-pulse" />
          <Logo size={120} animated={true} className="relative z-10" />
        </div>
        <div className="space-y-2">
          <p className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.8em] italic animate-pulse">Synchronizing Registry Node...</p>
          <p className="text-[8px] font-mono text-slate-700 uppercase tracking-widest">Protocol 9.2.1 • Encryption Active</p>
        </div>
      </div>
    );
  }

  return (
    <m.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 pb-40 max-w-4xl mx-auto px-4 font-sans text-left"
    >
      {/* Dynamic Profile Header */}
      <header className="flex flex-col lg:flex-row items-center gap-10 px-10 py-14 bg-slate-950/60 rounded-[5rem] border border-white/10 backdrop-blur-3xl shadow-[0_80px_150px_-40px_rgba(0,0,0,1)] relative overflow-hidden group">
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] group-hover:bg-indigo-500/15 transition-all duration-1000" />
        
        <div className="relative shrink-0">
          <div className="w-48 h-48 rounded-[4rem] bg-gradient-to-br from-[#0a0f25] to-[#020617] border border-white/10 flex items-center justify-center text-indigo-400 shadow-[inset_0_0_80px_rgba(0,0,0,0.8)] relative overflow-hidden group">
            <AnimatePresence mode="wait">
              {profile?.full_name ? (
                <m.span key="initial" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-[8rem] font-black italic tracking-tighter relative z-10 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                  {profile.full_name[0].toUpperCase()}
                </m.span>
              ) : (
                <m.div key="icon" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 text-slate-800">
                  <User size={100} strokeWidth={1} />
                </m.div>
              )}
            </AnimatePresence>
            <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <m.div 
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }} 
            transition={{ duration: 5, repeat: Infinity }} 
            className="absolute -bottom-4 -right-4 p-6 bg-indigo-600 rounded-[2rem] text-white shadow-2xl border-4 border-[#020617] z-20"
          >
             <Fingerprint size={32} />
          </m.div>
        </div>
        
        <div className="space-y-6 text-center lg:text-left relative z-10 flex-1">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3 justify-center lg:justify-start">
                 <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                 <span className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.4em] italic">Neural Identity Verified</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black italic text-white uppercase tracking-tighter leading-none">
                {profile?.full_name || 'INITIALIZING'}
              </h1>
            </div>

            <div className="flex flex-col items-center md:items-end gap-3 bg-white/5 p-6 rounded-[2.5rem] border border-white/5">
               <div className="flex items-center gap-3">
                 <BarChart3 size={14} className="text-indigo-400" />
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Node Integrity</span>
               </div>
               <div className="flex items-center gap-4">
                  <div className="w-32 h-2 bg-black rounded-full overflow-hidden border border-white/5">
                    <m.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${integrityScore}%` }} 
                      transition={{ duration: 1.5, ease: "circOut" }}
                      className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
                    />
                  </div>
                  <span className="text-xl font-mono font-black text-white italic">{integrityScore}%</span>
               </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
             <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest bg-black/40 px-6 py-3 rounded-full border border-white/5 flex items-center gap-3">
               <Database size={12} className="text-indigo-500" /> 
               NODE_ID: <span className="text-indigo-100 font-mono">{profile?.id?.slice(0, 14).toUpperCase()}</span>
             </span>
             <button 
               onClick={fetchData} 
               className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-slate-500 hover:text-white transition-all active:rotate-180"
             >
                <RefreshCw size={16} />
             </button>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-12">
        <GlassCard className="p-12 md:p-16 rounded-[5rem] bg-white/[0.01] border-white/5" intensity={1.5}>
          <div className="space-y-20">
            {/* Identity Sector */}
            <div className="space-y-12">
              <div className="flex items-center justify-between border-b border-white/10 pb-10">
                <div className="flex items-center gap-6">
                  <div className="p-5 bg-indigo-500/10 rounded-3xl text-indigo-400 shadow-2xl border border-indigo-500/20">
                    <Terminal size={28} />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black italic text-white uppercase tracking-tight">{t_registry.identitySector}</h2>
                    <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.4em] italic">Access Authorization Matrix</p>
                  </div>
                </div>
                <Lock size={20} className="text-slate-800" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-5">
                  <label className="text-[11px] font-black uppercase text-slate-500 px-8 flex items-center gap-3 tracking-[0.5em] italic">
                    <Mail size={14} /> {t_registry.identifier}
                  </label>
                  <div className="bg-[#020617] border border-white/10 rounded-[3rem] px-10 py-8 text-base text-slate-600 italic flex justify-between items-center shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)] group">
                    <span className="truncate pr-4 font-mono font-bold tracking-tight">{profile?.email}</span>
                    <ShieldCheck size={18} className="text-emerald-500/40 group-hover:text-emerald-500 transition-colors" />
                  </div>
                </div>

                <div className="space-y-5">
                  <label className="text-[11px] font-black uppercase text-indigo-400 px-8 flex items-center gap-3 tracking-[0.5em] italic">
                    <Edit2 size={14} /> {t_registry.callsign}
                  </label>
                  <div className="relative group">
                    <input 
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                      className={`w-full bg-[#020617] border rounded-[3rem] px-10 py-8 text-base text-white focus:border-indigo-500 outline-none transition-all font-black italic placeholder:text-slate-800 shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)] ${formData.displayName ? (validations.displayName ? 'border-emerald-500/30' : 'border-rose-500/30') : 'border-white/10'}`}
                      placeholder="Input Identifier..."
                    />
                    <div className="absolute right-8 top-1/2 -translate-y-1/2">
                       {formData.displayName && (validations.displayName ? <CheckCircle2 className="text-emerald-500" size={24} /> : <XCircle className="text-rose-500" size={24} />)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Biometric Sector */}
            <div className="space-y-12">
              <div className="flex items-center justify-between border-b border-white/10 pb-10">
                <div className="flex items-center gap-6">
                  <div className="p-5 bg-indigo-500/10 rounded-3xl text-indigo-400 shadow-2xl border border-indigo-500/20">
                    <Activity size={28} />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black italic text-white uppercase tracking-tight">{t_registry.biometricSector}</h2>
                    <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.4em] italic">Biological Baseline Calibration</p>
                  </div>
                </div>
                <Binary size={20} className="text-slate-800" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="space-y-4">
                  <label className="text-[11px] font-black uppercase text-slate-500 px-8 flex items-center gap-3 tracking-[0.3em] italic">
                    <Brain size={16} /> {t_settings.age}
                  </label>
                  <div className="relative">
                    <input 
                      type="number"
                      value={formData.age || ''}
                      onChange={(e) => setFormData({...formData, age: parseInt(e.target.value) || 0})}
                      className={`w-full bg-[#020617] border rounded-[2.5rem] px-10 py-7 text-base text-white outline-none transition-all font-mono font-black italic shadow-[inset_0_4px_15px_rgba(0,0,0,0.5)] ${getStatusColor(validations.age, formData.age)}`}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <label className="text-[11px] font-black uppercase text-slate-500 px-8 flex items-center gap-3 tracking-[0.3em] italic">
                    <Heart size={16} /> {t_registry.polarity}
                  </label>
                  <div className="relative">
                    <select 
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className={`w-full bg-[#020617] border rounded-[2.5rem] px-10 py-7 text-base text-white outline-none appearance-none cursor-pointer font-black italic shadow-[inset_0_4px_15px_rgba(0,0,0,0.5)] ${getStatusColor(validations.gender, formData.gender)}`}
                    >
                      <option value="male">{t_settings.genderMale}</option>
                      <option value="female">{t_settings.genderFemale}</option>
                      <option value="other">{t_settings.genderOther}</option>
                      <option value="prefer-not-to-say">{t_settings.genderNone}</option>
                    </select>
                    <ChevronRight size={18} className="absolute right-8 top-1/2 -translate-y-1/2 text-indigo-500/40 rotate-90 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[11px] font-black uppercase text-slate-500 px-8 flex items-center gap-3 tracking-[0.3em] italic">
                    <Ruler size={16} /> {t_settings.height} (CM)
                  </label>
                  <div className="relative">
                    <input 
                      type="number"
                      value={formData.height || ''}
                      onChange={(e) => setFormData({...formData, height: parseFloat(e.target.value) || 0})}
                      className={`w-full bg-[#020617] border rounded-[2.5rem] px-10 py-7 text-base text-white outline-none transition-all font-mono font-black italic shadow-[inset_0_4px_15px_rgba(0,0,0,0.5)] ${getStatusColor(validations.height, formData.height)}`}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[11px] font-black uppercase text-slate-500 px-8 flex items-center gap-3 tracking-[0.3em] italic">
                    <Scale size={16} /> {t_settings.weight} (KG)
                  </label>
                  <div className="relative">
                    <input 
                      type="number"
                      value={formData.weight || ''}
                      onChange={(e) => setFormData({...formData, weight: parseFloat(e.target.value) || 0})}
                      className={`w-full bg-[#020617] border rounded-[2.5rem] px-10 py-7 text-base text-white outline-none transition-all font-mono font-black italic shadow-[inset_0_4px_15px_rgba(0,0,0,0.5)] ${getStatusColor(validations.weight, formData.weight)}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-24">
            <button 
              type="submit"
              disabled={isUpdating || !isFormValid}
              className={`w-full py-10 rounded-full font-black text-base uppercase tracking-[0.6em] transition-all flex items-center justify-center gap-6 shadow-[0_40px_100px_-20px_rgba(99,102,241,0.5)] active:scale-[0.98] italic relative overflow-hidden ${
                status === 'success' ? 'bg-emerald-600 text-white shadow-emerald-500/30' : 
                status === 'error' ? 'bg-rose-600 text-white shadow-rose-500/30' : 
                !isFormValid ? 'bg-slate-900 text-slate-700 cursor-not-allowed border border-white/5 opacity-40 shadow-none' : 'bg-indigo-600 text-white hover:bg-indigo-500'
              }`}
            >
              <AnimatePresence mode="wait">
                {isUpdating ? (
                  <m.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-5">
                    <Loader2 size={32} className="animate-spin" />
                    <span>{t_registry.syncing}</span>
                  </m.div>
                ) : status === 'success' ? (
                  <m.div key="success" initial={{ y: 20 }} animate={{ y: 0 }} className="flex items-center gap-5">
                    <CheckCircle2 size={32} />
                    <span>{t_registry.success}</span>
                  </m.div>
                ) : status === 'error' ? (
                  <m.div key="error" initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex items-center gap-5">
                    <AlertCircle size={32} />
                    <span>{t_registry.failure}</span>
                  </m.div>
                ) : (
                  <m.div key="idle" initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex items-center gap-5">
                    <Zap size={28} fill="currentColor" />
                    <span>{t_registry.commit}</span>
                  </m.div>
                )}
              </AnimatePresence>
              
              {isUpdating && (
                <m.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                />
              )}
            </button>
            {!isFormValid && (
               <p className="text-center text-[10px] text-rose-500 font-black uppercase tracking-widest mt-6 italic animate-pulse">
                 <AlertCircle size={10} className="inline mr-2" /> Protocol Incomplete: Required Metrics Missing
               </p>
            )}
          </div>
        </GlassCard>
      </form>

      {/* Sovereignty Protocol Note */}
      <m.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="flex flex-col md:flex-row items-center gap-12 p-12 bg-indigo-500/[0.02] border border-indigo-500/10 rounded-[5rem] relative overflow-hidden group"
      >
        <div className="p-8 bg-indigo-500/10 rounded-[3rem] text-indigo-400 relative z-10 shadow-inner group-hover:scale-110 transition-transform duration-1000">
          <Sparkles size={48} />
        </div>
        <div className="space-y-4 relative z-10 text-center md:text-left">
          <h4 className="text-sm font-black uppercase text-white tracking-[0.4em] italic flex items-center justify-center md:justify-start gap-3">
            <ShieldCheck size={16} className="text-emerald-500" /> {t_registry.sovereignty}
          </h4>
          <p className="text-[13px] text-slate-500 italic leading-relaxed max-w-2xl">
            {t_registry.sovereigntyDesc}
          </p>
        </div>
        <div className="absolute top-0 right-0 p-12 opacity-[0.01] pointer-events-none group-hover:opacity-[0.03] transition-opacity duration-1000">
           <Smartphone size={300} strokeWidth={0.5} />
        </div>
      </m.div>
    </m.div>
  );
};
