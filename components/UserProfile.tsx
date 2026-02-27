import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Ruler, Weight, Calendar, Save, Loader2, 
  CheckCircle2, AlertTriangle, ChevronLeft, ShieldCheck
} from 'lucide-react';
import { GlassCard } from './GlassCard.tsx';
import { userApi, supabase } from '../services/supabaseService.ts';
import { Language, getTranslation } from '../services/i18n.ts';

const m = motion as any;

interface UserProfileProps {
  lang: Language;
  onBack: () => void;
  onNavigate: (path: string) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ lang, onBack, onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const t = getTranslation(lang, 'settings');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await (supabase.auth as any).getUser();
      if (!user) return;

      const { data } = await userApi.getProfile(user.id);
      if (data) setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const { error } = await userApi.updateProfile(profile.id, {
        age: profile.age,
        height: profile.height,
        weight: profile.weight,
        gender: profile.gender
      });

      if (error) throw error;
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#01040a] text-white font-sans p-6 pb-32">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-2xl font-black uppercase tracking-widest">{t.title}</h1>
        <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/10 ml-auto">
          <button 
            onClick={() => {
              const pathWithoutLang = window.location.pathname.replace(/^\/(cn|en)/, '');
              onNavigate(`/en${pathWithoutLang}`);
            }}
            className={`px-3 py-1 rounded-full text-[10px] font-black transition-all ${lang === 'en' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
          >
            EN
          </button>
          <button 
            onClick={() => {
              const pathWithoutLang = window.location.pathname.replace(/^\/(cn|en)/, '');
              onNavigate(`/cn${pathWithoutLang}`);
            }}
            className={`px-3 py-1 rounded-full text-[10px] font-black transition-all ${lang === 'zh' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
          >
            CN
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto space-y-8">
        <GlassCard className="p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold shadow-lg shadow-indigo-500/30">
              {profile?.email?.[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold">{profile?.email}</h2>
              <p className="text-sm text-slate-500 font-mono uppercase tracking-wider">{profile?.id}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase rounded">
                  {profile?.role || 'User'}
                </span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase rounded flex items-center gap-1">
                  <ShieldCheck size={10} /> Verified
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
                  <Calendar size={14} /> {t.age}
                </label>
                <input 
                  type="number" 
                  value={profile?.age || ''}
                  onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) })}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
                  <User size={14} /> Gender
                </label>
                <select 
                  value={profile?.gender || ''}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-colors appearance-none"
                >
                  <option value="male">{t.genderMale}</option>
                  <option value="female">{t.genderFemale}</option>
                  <option value="other">{t.genderOther}</option>
                  <option value="none">{t.genderNone}</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
                  <Ruler size={14} /> {t.height} (cm)
                </label>
                <input 
                  type="number" 
                  value={profile?.height || ''}
                  onChange={(e) => setProfile({ ...profile, height: parseInt(e.target.value) })}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
                  <Weight size={14} /> {t.weight} (kg)
                </label>
                <input 
                  type="number" 
                  value={profile?.weight || ''}
                  onChange={(e) => setProfile({ ...profile, weight: parseInt(e.target.value) })}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-colors"
                />
              </div>
            </div>

            <AnimatePresence>
              {message && (
                <m.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-4 rounded-xl flex items-center gap-3 text-sm font-bold ${
                    message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                  }`}
                >
                  {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                  {message.text}
                </m.div>
              )}
            </AnimatePresence>

            <button 
              type="submit" 
              disabled={saving}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </GlassCard>

        <GlassCard className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">{lang === 'zh' ? '需要帮助？' : 'Need Help?'}</h3>
              <p className="text-sm text-slate-500">{lang === 'zh' ? '访问我们的支持中心获取帮助。' : 'Visit our support center for assistance.'}</p>
            </div>
            <button 
              onClick={() => onNavigate('/support')}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors"
            >
              {lang === 'zh' ? '支持中心' : 'Support Center'}
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
