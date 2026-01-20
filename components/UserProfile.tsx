
import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard.tsx';
import { 
  UserCircle, Edit2, Activity, Save, Loader2, 
  CheckCircle2, Lock, User, Info, Scale, Ruler, Brain, Heart,
  ShieldCheck, Fingerprint, ChevronRight, Mail
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
      // Parallel atomic updates to profiles and user_data
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
          <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full animate-pulse" />
          <Loader2 className="animate-spin text-indigo-500 relative z-10" size={48} />
        </div>
        <div className="space-y-2">
          <p className="text-[11px] font-black text-white uppercase tracking-[0.4em] italic">Syncing Profile Registry...</p>
          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Neural Link Verification In Progress</p>
        </div>
      </div>
    );
  }

  return (
    <m.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 pb-40 max-w-2xl mx-auto px-4 font-sans text-left"
    >
      {/* Subject Header */}
      <header className="flex flex-col md:flex-row items-center gap-8 px-4">
        <div className="relative">
          <div className="w-32 h-32 rounded-[2.5rem] bg-slate-900 border border-white/5 flex items-center justify-center text-indigo-400 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <AnimatePresence mode="wait">
              {formData.displayName ? (
                <m.span 
                  key="initial" 
                  initial={{ opacity: 0, scale: 0.8 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  className="text-5xl font-black italic tracking-tighter relative z-10"
                >
                  {formData.displayName[0].toUpperCase()}
                </m.span>
              ) : (
                <m.div key="icon" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10">
                  <User size={56} strokeWidth={1.5} />
                </m.div>
              )}
            </AnimatePresence>
          </div>
          <div className="absolute -bottom-2 -right-2 p-2.5 bg-indigo-600 rounded-2xl text-white shadow-xl border-4 border-[#020617]">
             <ShieldCheck size={18} />
          </div>
        </div>
        
        <div className="space-y-3 text-center md:text-left">
          <div className="flex items-center gap-3 justify-center md:justify-start">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Subject Status: Active</span>
          </div>
          <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter leading-none">{t.profileTitle}</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] italic">Laboratory Access Validated • ID: {profile?.id?.slice(0, 12)}</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-10">
        <GlassCard className="p-10 md:p-14 rounded-[5rem] bg-white/[0.01] border-white/5">
          <div className="space-y-14">
            {/* Identity Group */}
            <div className="space-y-10">
              <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
                    <Fingerprint size={22} />
                  </div>
                  <h2 className="text-lg font-black italic text-white uppercase tracking-tight">Identity Registry</h2>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-500 px-2 flex items-center gap-2 tracking-[0.2em] italic">
                    <Mail size={12} className="text-slate-700" /> Identifier Email
                  </label>
                  <div className="bg-slate-950/40 border border-white/5 rounded-3xl px-8 py-6 text-sm text-slate-500 italic flex justify-between items-center group cursor-not-allowed">
                    <span className="truncate pr-4">{profile?.email}</span>
                    <Lock size={14} className="opacity-20 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-indigo-400 px-2 flex items-center gap-2 tracking-[0.2em] italic">
                    <Edit2 size={12} /> Subject Callsign (Name)
                  </label>
                  <input 
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                    className="w-full bg-slate-950/60 border border-white/10 rounded-3xl px-8 py-6 text-sm text-white focus:border-indigo-500 outline-none transition-all font-semibold italic placeholder:text-slate-800"
                    placeholder="Enter full name"
                  />
                </div>
              </div>
            </div>

            {/* Biometrics Group */}
            <div className="space-y-10">
              <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400">
                    <Activity size={22} />
                  </div>
                  <h2 className="text-lg font-black italic text-white uppercase tracking-tight">{t.personalInfo}</h2>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-500 px-2 flex items-center gap-2 tracking-[0.2em] italic">
                    <Brain size={14} className="text-slate-700" /> {t.age}
                  </label>
                  <input 
                    type="number"
                    value={formData.age || ''}
                    onChange={(e) => setFormData({...formData, age: parseInt(e.target.value) || 0})}
                    className="w-full bg-slate-950/60 border border-white/5 rounded-3xl px-8 py-6 text-sm text-white outline-none focus:border-indigo-500/30 transition-all font-mono"
                    placeholder="0"
                  />
                </div>
                
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-500 px-2 flex items-center gap-2 tracking-[0.2em] italic">
                    <Heart size={14} className="text-slate-700" /> {t.gender}
                  </label>
                  <div className="relative">
                    <select 
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className="w-full bg-slate-950/60 border border-white/5 rounded-3xl px-8 py-6 text-sm text-white outline-none appearance-none cursor-pointer focus:border-indigo-500/30 transition-all font-semibold italic"
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
                  <label className="text-[10px] font-black uppercase text-slate-500 px-2 flex items-center gap-2 tracking-[0.2em] italic">
                    <Ruler size={14} className="text-slate-700" /> {t.height} (CM)
                  </label>
                  <input 
                    type="number"
                    step="0.1"
                    value={formData.height || ''}
                    onChange={(e) => setFormData({...formData, height: parseFloat(e.target.value) || 0})}
                    className="w-full bg-slate-950/60 border border-white/5 rounded-3xl px-8 py-6 text-sm text-white outline-none focus:border-indigo-500/30 transition-all font-mono"
                    placeholder="0.0"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-500 px-2 flex items-center gap-2 tracking-[0.2em] italic">
                    <Scale size={14} className="text-slate-700" /> {t.weight} (KG)
                  </label>
                  <input 
                    type="number"
                    step="0.1"
                    value={formData.weight || ''}
                    onChange={(e) => setFormData({...formData, weight: parseFloat(e.target.value) || 0})}
                    className="w-full bg-slate-950/60 border border-white/5 rounded-3xl px-8 py-6 text-sm text-white outline-none focus:border-indigo-500/30 transition-all font-mono"
                    placeholder="0.0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action */}
          <div className="pt-14">
            <button 
              type="submit"
              disabled={isUpdating}
              className={`w-full py-7 rounded-[2rem] font-black text-[13px] uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-[0.98] italic ${
                status === 'success' 
                  ? 'bg-emerald-600 text-white shadow-emerald-500/20' 
                  : status === 'error' 
                    ? 'bg-rose-600 text-white shadow-rose-500/20' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/20'
              } disabled:opacity-50`}
            >
              {isUpdating ? <Loader2 size={20} className="animate-spin" /> : status === 'success' ? <CheckCircle2 size={20} /> : <Save size={20} />}
              {isUpdating ? 'Synchronizing Data...' : status === 'success' ? 'Telemetry Updated' : status === 'error' ? 'Handshake Failure' : 'Commit Profile Data'}
            </button>
          </div>
        </GlassCard>

        {/* Security / Privacy Note */}
        <div className="flex items-center gap-6 p-10 bg-indigo-500/5 border border-indigo-500/10 rounded-[4rem] relative overflow-hidden group">
          <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400 relative z-10">
            <ShieldCheck size={28} />
          </div>
          <div className="space-y-1 relative z-10 text-left">
            <h4 className="text-[11px] font-black uppercase text-white tracking-widest italic">Data Sovereignty Note</h4>
            <p className="text-[11px] text-slate-500 italic leading-relaxed">
              Biometric metadata is strictly used for Neural Synthesis calibration. All telemetry remains encrypted within your private lab profile.
            </p>
          </div>
        </div>
      </form>
    </m.div>
  );
};
