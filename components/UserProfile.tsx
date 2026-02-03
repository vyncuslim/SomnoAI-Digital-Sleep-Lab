
import React, { useState, useEffect, useMemo } from 'react';
import { GlassCard } from './GlassCard.tsx';
import { Logo } from './Logo.tsx';
import { 
  Edit2, Activity, Save, Loader2, 
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
    weight: formData.weight > 10 && formData.weight < 500,
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
      
      const [pRes, uRes] = await Promise.all([
        profileApi.updateProfile({ full_name: cleanName }),
        userDataApi.updateUserData({
          age: parseInt(formData.age.toString()) || 0,
          weight: parseFloat(formData.weight.toString()) || 0,
          height: parseFloat(formData.height.toString()) || 0,
          gender: formData.gender
        })
      ]);

      if (pRes.error || uRes.error) throw new Error("SYNC_FAILURE");

      setStatus('success');
      setProfile((prev: any) => ({ ...prev, full_name: cleanName }));
      setTimeout(() => setStatus('idle'), 4000);
    } catch (err) {
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
        <p className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.8em] italic animate-pulse">Syncing Neural Registry...</p>
      </div>
    );
  }

  return (
    <m.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="space-y-10 pb-40 max-w-4xl mx-auto px-4 font-sans text-left"
    >
      <header className="flex flex-col lg:flex-row items-center gap-10 px-10 py-14 bg-slate-950/60 rounded-[5rem] border border-white/10 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]" />
        
        <div className="relative shrink-0">
          <div className="w-44 h-44 rounded-[4rem] bg-gradient-to-br from-[#0a0f25] to-[#020617] border border-white/10 flex items-center justify-center text-indigo-400 shadow-inner relative overflow-hidden group">
            {profile?.full_name ? (
              <span className="text-[7rem] font-black italic tracking-tighter relative z-10">{profile.full_name[0].toUpperCase()}</span>
            ) : (
              <User size={80} strokeWidth={1} className="text-slate-800" />
            )}
            <div className="absolute inset-0 bg-indigo-500/5 group-hover:opacity-100 transition-opacity" />
          </div>
          <m.div 
            animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 4, repeat: Infinity }} 
            className="absolute -bottom-2 -right-2 p-5 bg-indigo-600 rounded-[2rem] text-white shadow-2xl border-4 border-[#020617] z-20"
          >
             <Fingerprint size={28} />
          </m.div>
        </div>
        
        <div className="space-y-6 text-center lg:text-left relative z-10 flex-1">
          <div className="space-y-2">
            <div className="flex items-center gap-3 justify-center lg:justify-start">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.4em] italic">Identity Linked</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black italic text-white uppercase tracking-tighter leading-none">
              {profile?.full_name || 'REGISTERING'}
            </h1>
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
             <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest bg-black/40 px-6 py-3 rounded-full border border-white/5 flex items-center gap-3">
               <Database size={12} className="text-indigo-500" /> NODE_ID: {profile?.id?.slice(0, 10).toUpperCase()}
             </span>
             <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-full border border-white/5">
                <BarChart3 size={12} className="text-indigo-400" />
                <span className="text-[10px] font-black text-slate-500 uppercase">Integrity: {integrityScore}%</span>
             </div>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-12">
        <GlassCard className="p-12 md:p-16 rounded-[5rem] bg-white/[0.01] border-white/5" intensity={1.2}>
          <div className="space-y-20">
            {/* Identity Sector */}
            <div className="space-y-10">
              <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                <Terminal size={24} className="text-indigo-400" />
                <h2 className="text-xl font-black italic text-white uppercase">{t_registry.identitySector}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4 text-left">
                  <label className="text-[11px] font-black uppercase text-slate-500 px-6 italic">{t_registry.identifier}</label>
                  <div className="bg-[#020617] border border-white/10 rounded-[3rem] px-8 py-7 text-base text-slate-500 font-mono italic truncate shadow-inner">
                    {profile?.email}
                  </div>
                </div>
                <div className="space-y-4 text-left">
                  <label className="text-[11px] font-black uppercase text-indigo-400 px-6 italic">{t_registry.callsign}</label>
                  <input 
                    type="text" value={formData.displayName}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                    className={`w-full bg-[#020617] border rounded-[3rem] px-8 py-7 text-base text-white focus:border-indigo-500 outline-none transition-all font-black italic shadow-inner ${validations.displayName ? 'border-emerald-500/20' : 'border-white/10'}`}
                    placeholder="Input Identity Label..."
                  />
                </div>
              </div>
            </div>

            {/* Biometric Baseline */}
            <div className="space-y-10">
              <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                <Activity size={24} className="text-indigo-400" />
                <h2 className="text-xl font-black italic text-white uppercase">{t_registry.biometricSector}</h2>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { id: 'age', label: t_settings.age, icon: Brain, type: 'number' },
                  { id: 'height', label: t_settings.height, icon: Ruler, type: 'number', unit: 'CM' },
                  { id: 'weight', label: t_settings.weight, icon: Scale, type: 'number', unit: 'KG' }
                ].map((item) => (
                  <div key={item.id} className="space-y-4 text-left">
                    <label className="text-[10px] font-black uppercase text-slate-500 px-6 italic flex items-center gap-2">
                       <item.icon size={12} /> {item.label}
                    </label>
                    <input 
                      type={item.type} value={(formData as any)[item.id] || ''}
                      onChange={(e) => setFormData({...formData, [item.id]: e.target.value})}
                      className={`w-full bg-[#020617] border rounded-[2.5rem] px-8 py-6 text-sm text-white outline-none transition-all font-mono font-black italic shadow-inner ${getStatusColor((validations as any)[item.id], (formData as any)[item.id])}`}
                    />
                  </div>
                ))}
                
                <div className="space-y-4 text-left">
                  <label className="text-[10px] font-black uppercase text-slate-500 px-6 italic flex items-center gap-2">
                    <Heart size={12} /> {t_registry.polarity}
                  </label>
                  <select 
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className={`w-full bg-[#020617] border rounded-[2.5rem] px-8 py-6 text-sm text-white outline-none cursor-pointer font-black italic shadow-inner ${getStatusColor(validations.gender, formData.gender)}`}
                  >
                    <option value="male">{t_settings.genderMale}</option>
                    <option value="female">{t_settings.genderFemale}</option>
                    <option value="other">{t_settings.genderOther}</option>
                    <option value="prefer-not-to-say">{t_settings.genderNone}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-24">
            <button 
              type="submit" disabled={isUpdating || !isFormValid}
              className={`w-full py-10 rounded-full font-black text-sm uppercase tracking-[0.6em] transition-all flex items-center justify-center gap-6 shadow-2xl active:scale-[0.98] italic ${
                status === 'success' ? 'bg-emerald-600 text-white' : 
                status === 'error' ? 'bg-rose-600 text-white' : 
                !isFormValid ? 'bg-slate-900 text-slate-700 opacity-40 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-500'
              }`}
            >
              <AnimatePresence mode="wait">
                {isUpdating ? <Loader2 className="animate-spin" size={28} /> : status === 'success' ? <CheckCircle2 size={28} /> : <Zap size={24} fill="currentColor" />}
              </AnimatePresence>
              <span>{isUpdating ? t_registry.syncing : status === 'success' ? t_registry.success : t_registry.commit}</span>
            </button>
            {!isFormValid && <p className="text-center text-[10px] text-rose-500 font-bold uppercase tracking-widest mt-6 italic">Required baseline metrics incomplete.</p>}
          </div>
        </GlassCard>
      </form>

      <m.div 
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
        className="flex flex-col md:flex-row items-center gap-10 p-12 bg-indigo-500/[0.02] border border-indigo-500/10 rounded-[5rem] relative overflow-hidden"
      >
        <div className="p-8 bg-indigo-500/10 rounded-[3rem] text-indigo-400 relative z-10 shadow-inner">
          <Sparkles size={40} />
        </div>
        <div className="space-y-3 relative z-10 text-center md:text-left flex-1">
          <h4 className="text-sm font-black uppercase text-white tracking-[0.3em] italic flex items-center justify-center md:justify-start gap-3">
            <ShieldCheck size={16} className="text-emerald-500" /> {t_registry.sovereignty}
          </h4>
          <p className="text-[12px] text-slate-500 italic leading-relaxed">
            {t_registry.sovereigntyDesc}
          </p>
        </div>
      </m.div>
    </m.div>
  );
};
