import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard.tsx';
import { 
  UserCircle, Edit2, Activity, Sliders, Save, Loader2, 
  CheckCircle2, Lock, User, Info, Scale, Ruler, Brain, Heart
} from 'lucide-react';
import { Language, translations } from '../services/i18n.ts';
import { UserProfileMetadata } from '../types.ts';
import { motion } from 'framer-motion';
import { updateProfileMetadata } from '../services/supabaseService.ts';
import { supabase } from '../lib/supabaseClient.ts';

const m = motion as any;

interface UserProfileProps {
  lang: Language;
}

export const UserProfile: React.FC<UserProfileProps> = ({ lang }) => {
  const [userEmail, setUserEmail] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<UserProfileMetadata>({
    displayName: '',
    age: 0,
    weight: 0,
    height: 0,
    gender: 'prefer-not-to-say',
    units: 'metric',
    coachingStyle: 'clinical'
  });

  const t = translations[lang].settings;
  const isZh = lang === 'zh';

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUserEmail(session.user.email || '');
          const { data: userData, error } = await supabase
            .from('user_data')
            .select('extra, display_name, role')
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (userData?.extra) {
            setProfileData({
              ...userData.extra,
              displayName: userData.display_name || session.user.user_metadata?.display_name || ''
            });
          } else if (session.user.user_metadata?.display_name) {
            setProfileData(prev => ({ ...prev, displayName: session.user.user_metadata.display_name }));
          }
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
      await updateProfileMetadata(profileData);
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
        <Loader2 className="animate-spin text-indigo-500" size={32} />
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Syncing Profile Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-32 animate-in fade-in duration-700 max-w-2xl mx-auto px-4">
      <header className="text-center space-y-4">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-full bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto shadow-2xl overflow-hidden group">
            {profileData.displayName ? (
              <span className="text-3xl font-black italic">{profileData.displayName[0].toUpperCase()}</span>
            ) : (
              <User size={48} />
            )}
          </div>
          <m.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -inset-2 border-2 border-indigo-500/10 rounded-full pointer-events-none" 
          />
        </div>
        <div>
          <h1 className="text-2xl font-black italic text-white uppercase tracking-tight">{t.profileTitle}</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Subject Registry Status: Validated</p>
        </div>
      </header>

      <GlassCard className="p-8 md:p-12 rounded-[4rem] border-white/10 shadow-3xl bg-white/[0.02]">
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Identity Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Lock size={14} className="text-slate-500" />
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{t.email}</span>
            </div>
            <div className="bg-slate-950/40 border border-white/5 rounded-full px-8 py-5 text-xs text-slate-500 italic flex justify-between items-center">
              <span>{userEmail}</span>
              <span className="text-[8px] font-black text-slate-700 uppercase">Immutable</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Edit2 size={14} className="text-indigo-400" />
                <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">{t.displayName}</span>
              </div>
              <input 
                type="text"
                value={profileData.displayName}
                onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
                placeholder="Ex: Lab Subject 42"
                className="w-full bg-slate-950/60 border border-white/10 rounded-full px-8 py-5 text-sm text-white outline-none focus:border-indigo-500/50 transition-all font-semibold"
              />
            </div>
          </div>

          <div className="h-px bg-white/5" />

          {/* Biometrics Section */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <Activity size={16} className="text-emerald-400" />
              <h2 className="text-sm font-black italic text-white uppercase tracking-tight">{t.personalInfo}</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase text-slate-500 px-4 flex items-center gap-2">
                  <Brain size={12} /> {t.age}
                </label>
                <input 
                  type="number"
                  value={profileData.age || ''}
                  onChange={(e) => setProfileData({...profileData, age: parseInt(e.target.value) || 0})}
                  className="w-full bg-slate-950/60 border border-white/5 rounded-3xl px-8 py-5 text-sm text-white outline-none focus:border-indigo-500/50 transition-all"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase text-slate-500 px-4 flex items-center gap-2">
                  <Heart size={12} /> {t.gender}
                </label>
                <select 
                  value={profileData.gender}
                  onChange={(e) => setProfileData({...profileData, gender: e.target.value as any})}
                  className="w-full bg-slate-950/60 border border-white/5 rounded-3xl px-8 py-5 text-sm text-white outline-none focus:border-indigo-500/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="male">{t.genderMale}</option>
                  <option value="female">{t.genderFemale}</option>
                  <option value="other">{t.genderOther}</option>
                  <option value="prefer-not-to-say">{t.genderNone}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase text-slate-500 px-4 flex items-center gap-2">
                  <Ruler size={12} /> {t.height} ({profileData.units === 'metric' ? 'cm' : 'in'})
                </label>
                <input 
                  type="number"
                  value={profileData.height || ''}
                  onChange={(e) => setProfileData({...profileData, height: parseFloat(e.target.value) || 0})}
                  className="w-full bg-slate-950/60 border border-white/5 rounded-3xl px-8 py-5 text-sm text-white outline-none focus:border-indigo-500/50 transition-all"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase text-slate-500 px-4 flex items-center gap-2">
                  <Scale size={12} /> {t.weight} ({profileData.units === 'metric' ? 'kg' : 'lb'})
                </label>
                <input 
                  type="number"
                  value={profileData.weight || ''}
                  onChange={(e) => setProfileData({...profileData, weight: parseFloat(e.target.value) || 0})}
                  className="w-full bg-slate-950/60 border border-white/5 rounded-3xl px-8 py-5 text-sm text-white outline-none focus:border-indigo-500/50 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-white/5" />

          {/* Preferences Section */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <Sliders size={16} className="text-amber-400" />
              <h2 className="text-sm font-black italic text-white uppercase tracking-tight">{t.preferences}</h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[9px] font-black uppercase text-slate-500 px-4">{t.units}</label>
                  <div className="flex bg-slate-950/80 p-1.5 rounded-full border border-white/5 shadow-inner">
                    <button 
                      type="button"
                      onClick={() => setProfileData({...profileData, units: 'metric'})}
                      className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${profileData.units === 'metric' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600 hover:text-slate-400'}`}
                    >
                      Metric
                    </button>
                    <button 
                      type="button"
                      onClick={() => setProfileData({...profileData, units: 'imperial'})}
                      className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${profileData.units === 'imperial' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600 hover:text-slate-400'}`}
                    >
                      Imperial
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[9px] font-black uppercase text-slate-500 px-4">{t.coaching}</label>
                  <select 
                    value={profileData.coachingStyle}
                    onChange={(e) => setProfileData({...profileData, coachingStyle: e.target.value as any})}
                    className="w-full bg-slate-950/60 border border-white/5 rounded-full px-8 py-4 text-[11px] font-black uppercase tracking-widest text-white outline-none focus:border-indigo-500/50 transition-all appearance-none cursor-pointer"
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
              status === 'success' ? 'bg-emerald-600 text-white' : 
              status === 'error' ? 'bg-rose-600 text-white' : 
              'bg-white text-slate-950 hover:bg-indigo-50'
            } disabled:opacity-50`}
          >
            {isUpdating ? <Loader2 size={18} className="animate-spin" /> : status === 'success' ? <CheckCircle2 size={18} /> : <Save size={18} />}
            {status === 'success' ? 'Synchronized' : status === 'error' ? 'Sync Failure' : 'Sync Biometric Data'}
          </button>
        </form>
      </GlassCard>

      <div className="flex items-center gap-4 p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-[2.5rem]">
        <Info size={20} className="text-indigo-400 shrink-0" />
        <p className="text-[10px] text-slate-400 italic leading-relaxed">
          Biometric identity data is used exclusively to calibrate the Neural Synthesis engine. This data remains on the edge and is never shared with 3rd party providers except for de-identified analysis by Gemini AI.
        </p>
      </div>
    </div>
  );
};