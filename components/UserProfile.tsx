import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard.tsx';
import { 
  UserCircle, Edit2, Activity, Sliders, Save, Loader2, 
  CheckCircle2, Lock, User, Info, Scale, Ruler, Brain, Heart
} from 'lucide-react';
import { Language, translations } from '../services/i18n.ts';
import { UserProfileMetadata } from '../types.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { profileApi } from '../services/supabaseService.ts';

const m = motion as any;

interface UserProfileProps {
  lang: Language;
}

export const UserProfile: React.FC<UserProfileProps> = ({ lang }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  
  const [formData, setFormData] = useState<UserProfileMetadata>({
    displayName: '',
    age: 0,
    weight: 0,
    height: 0,
    gender: 'prefer-not-to-say',
    units: 'metric',
    coachingStyle: 'clinical'
  });

  const t = translations[lang].settings;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await profileApi.getMyProfile();
        if (data) {
          setProfile(data);
          const prefs = data.preferences || {};
          setFormData({
            displayName: data.full_name || '',
            age: prefs.age || 0,
            weight: prefs.weight || 0,
            height: prefs.height || 0,
            gender: prefs.gender || 'prefer-not-to-say',
            units: prefs.units || 'metric',
            coachingStyle: prefs.coachingStyle || 'clinical'
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUpdating) return;
    setIsUpdating(true);
    setStatus('idle');
    try {
      await profileApi.updateProfile({
        full_name: formData.displayName,
        preferences: {
          age: formData.age,
          weight: formData.weight,
          height: formData.height,
          gender: formData.gender,
          units: formData.units,
          coachingStyle: formData.coachingStyle
        }
      });
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      setStatus('error');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <Loader2 className="animate-spin text-indigo-500 opacity-50" size={32} />
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Syncing Profile Registry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-32 max-w-2xl mx-auto px-4">
      <header className="text-center space-y-4">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-full bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto shadow-2xl overflow-hidden group">
             <AnimatePresence mode="wait">
              {formData.displayName ? (
                <m.span key="initial" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-3xl font-black italic">
                  {formData.displayName[0].toUpperCase()}
                </m.span>
              ) : (
                <m.div key="icon" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <User size={48} />
                </m.div>
              )}
            </AnimatePresence>
          </div>
          <m.div animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 4, repeat: Infinity }} className="absolute -inset-2 border-2 border-indigo-500/10 rounded-full pointer-events-none" />
        </div>
        <div>
          <h1 className="text-2xl font-black italic text-white uppercase tracking-tight">{t.profileTitle}</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-2">Laboratory Access Validated</p>
        </div>
      </header>

      <GlassCard className="p-8 md:p-14 rounded-[4.5rem] bg-white/[0.01]">
        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Identity Section */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 px-2">
              <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400"><UserCircle size={18} /></div>
              <h2 className="text-sm font-black italic text-white uppercase tracking-tight">Identity Registry</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-4">
                   <Lock size={12} className="text-slate-700" />
                   <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Email Identifier</span>
                </div>
                <div className="bg-slate-950/40 border border-white/5 rounded-full px-8 py-5 text-xs text-slate-500 italic flex justify-between items-center">
                  <span className="truncate pr-4">{profile?.email}</span>
                  <span className="text-[8px] font-black text-slate-800 uppercase">Protected</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 px-4">
                   <Edit2 size={12} className="text-indigo-400" />
                   <span className="text-[9px] font-black uppercase text-indigo-400 tracking-widest">{t.displayName}</span>
                </div>
                <input 
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-full px-8 py-5 text-sm text-white focus:border-indigo-500 outline-none transition-all font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-white/5" />

          {/* Biometrics Section */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 px-2">
              <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400"><Activity size={18} /></div>
              <h2 className="text-sm font-black italic text-white uppercase tracking-tight">{t.personalInfo}</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase text-slate-500 px-4 flex items-center gap-2"><Brain size={12}/> {t.age}</label>
                <input 
                  type="number"
                  value={formData.age || ''}
                  onChange={(e) => setFormData({...formData, age: parseInt(e.target.value) || 0})}
                  className="w-full bg-slate-950/60 border border-white/5 rounded-3xl px-8 py-5 text-sm text-white outline-none"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase text-slate-500 px-4 flex items-center gap-2"><Heart size={12}/> {t.gender}</label>
                <select 
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value as any})}
                  className="w-full bg-slate-950/60 border border-white/5 rounded-3xl px-8 py-5 text-sm text-white outline-none appearance-none cursor-pointer"
                >
                  <option value="male">{t.genderMale}</option>
                  <option value="female">{t.genderFemale}</option>
                  <option value="other">{t.genderOther}</option>
                  <option value="prefer-not-to-say">{t.genderNone}</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase text-slate-500 px-4 flex items-center gap-2"><Ruler size={12}/> {t.height} ({formData.units === 'metric' ? 'cm' : 'in'})</label>
                <input 
                  type="number"
                  step="0.1"
                  value={formData.height || ''}
                  onChange={(e) => setFormData({...formData, height: parseFloat(e.target.value) || 0})}
                  className="w-full bg-slate-950/60 border border-white/5 rounded-3xl px-8 py-5 text-sm text-white outline-none"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase text-slate-500 px-4 flex items-center gap-2"><Scale size={12}/> {t.weight} ({formData.units === 'metric' ? 'kg' : 'lb'})</label>
                <input 
                  type="number"
                  step="0.1"
                  value={formData.weight || ''}
                  onChange={(e) => setFormData({...formData, weight: parseFloat(e.target.value) || 0})}
                  className="w-full bg-slate-950/60 border border-white/5 rounded-3xl px-8 py-5 text-sm text-white outline-none"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-white/5" />

          {/* Preferences Section */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 px-2">
              <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400"><Sliders size={18} /></div>
              <h2 className="text-sm font-black italic text-white uppercase tracking-tight">{t.preferences}</h2>
            </div>

            <div className="space-y-10">
              <div className="space-y-4">
                <label className="text-[9px] font-black uppercase text-slate-500 px-6">{t.units}</label>
                <div className="flex bg-slate-950/80 p-1.5 rounded-full border border-white/5 shadow-inner mx-2">
                  <button type="button" onClick={() => setFormData({...formData, units: 'metric'})} className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${formData.units === 'metric' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600 hover:text-slate-400'}`}>Metric</button>
                  <button type="button" onClick={() => setFormData({...formData, units: 'imperial'})} className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${formData.units === 'imperial' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600 hover:text-slate-400'}`}>Imperial</button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[9px] font-black uppercase text-slate-500 px-6">{t.coaching}</label>
                <div className="px-2">
                  <select 
                    value={formData.coachingStyle}
                    onChange={(e) => setFormData({...formData, coachingStyle: e.target.value as any})}
                    className="w-full bg-slate-950/60 border border-white/5 rounded-full px-8 py-5 text-[11px] font-black uppercase tracking-widest text-white outline-none focus:border-indigo-500/50 appearance-none cursor-pointer"
                  >
                    <option value="clinical">{t.styleClinical}</option>
                    <option value="motivational">{t.styleMotivational}</option>
                    <option value="minimalist">{t.styleMinimal}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isUpdating}
            className={`w-full py-6 rounded-full font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95 ${
              status === 'success' ? 'bg-emerald-600 text-white' : status === 'error' ? 'bg-rose-600 text-white' : 'bg-white text-slate-950 hover:bg-indigo-50'
            } disabled:opacity-50`}
          >
            {isUpdating ? <Loader2 size={18} className="animate-spin" /> : status === 'success' ? <CheckCircle2 size={18} /> : <Save size={18} />}
            {status === 'success' ? 'Synchronized' : status === 'error' ? 'Sync Failure' : 'Commit Biometric Data'}
          </button>
        </form>
      </GlassCard>

      <div className="flex items-center gap-4 p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-[3rem] relative overflow-hidden">
        <Info size={20} className="text-indigo-400 shrink-0 relative z-10" />
        <p className="text-[10px] text-slate-400 italic leading-relaxed relative z-10">
          Biometric identity data is used exclusively to calibrate the Neural Synthesis engine. This data remains on the edge and is never stored on persistent registry servers.
        </p>
      </div>
    </div>
  );
};