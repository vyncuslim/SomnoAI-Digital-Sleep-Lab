import React, { useState } from 'react';
import { GlassCard } from './GlassCard.tsx';
import { 
  User, Brain, Ruler, Scale, Heart, Loader2, 
  Zap, ShieldCheck, AlertCircle, CheckCircle2, XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { userDataApi } from '../services/supabaseService.ts';
import { Logo } from './Logo.tsx';

const m = motion as any;

interface FirstTimeSetupProps {
  onComplete: () => void;
}

export const FirstTimeSetup: React.FC<FirstTimeSetupProps> = ({ onComplete }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    weight: '',
    height: '',
    gender: 'prefer-not-to-say'
  });

  const validations = {
    fullName: formData.fullName.trim().length >= 2,
    age: parseInt(formData.age) > 0 && parseInt(formData.age) < 120,
    height: parseFloat(formData.height) > 30 && parseFloat(formData.height) < 300,
    weight: parseFloat(formData.weight) > 10 && parseFloat(formData.weight) < 500
  };

  const isFormValid = Object.values(validations).every(v => v);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || !isFormValid) return;
    
    setIsSaving(true);
    setError(null);

    try {
      const result = await userDataApi.completeSetup(formData.fullName, {
        age: formData.age,
        weight: formData.weight,
        height: formData.height,
        gender: formData.gender
      });

      if (result.success) {
        onComplete();
      }
    } catch (err: any) {
      console.error("Setup Sync Critical Error:", err);
      setError(err.message || "Failed to establish registry link. Node rejected the package.");
    } finally {
      setIsSaving(false);
    }
  };

  const getInputBorderClass = (isValid: boolean, value: string) => {
    if (!value) return 'border-white/10';
    return isValid ? 'border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.1)]';
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Neural Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600 rounded-full blur-[150px]" />
      </div>

      <m.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-xl z-10"
      >
        <div className="text-center mb-10 space-y-4">
          <Logo size={100} animated={true} />
          <div className="space-y-1">
            <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none">Subject Registration</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.5em]">Initial Laboratory Onboarding</p>
          </div>
        </div>

        <GlassCard className="p-10 md:p-14 border-indigo-500/20 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] rounded-[4.5rem]">
          <form onSubmit={handleSave} className="space-y-12">
            <div className="space-y-8">
              {/* Full Name */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 px-6 flex items-center gap-2 tracking-widest italic">
                  <User size={12}/> Subject Identity (Full Name)
                </label>
                <div className="relative">
                  <input 
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className={`w-full bg-slate-950/80 border rounded-full px-8 py-6 text-sm text-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-800 font-bold italic ${getInputBorderClass(validations.fullName, formData.fullName)}`}
                  />
                  <div className="absolute right-8 top-1/2 -translate-y-1/2">
                    {formData.fullName && (validations.fullName ? <CheckCircle2 className="text-emerald-500" size={20} /> : <XCircle className="text-rose-500" size={20} />)}
                  </div>
                </div>
              </div>

              {/* Age & Neural Polarity */}
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-500 px-6 flex items-center gap-2 tracking-widest italic"><Brain size={12}/> Age</label>
                  <div className="relative">
                    <input 
                      type="number"
                      required
                      placeholder="Years"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                      className={`w-full bg-slate-950/80 border rounded-[2.5rem] px-8 py-6 text-sm text-white outline-none font-mono font-bold italic ${getInputBorderClass(validations.age, formData.age)}`}
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-700 uppercase tracking-widest pointer-events-none">Years</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-500 px-6 flex items-center gap-2 tracking-widest italic"><Heart size={12}/> Neural Polarity</label>
                  <div className="relative">
                    <select 
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className="w-full bg-slate-950/80 border border-white/10 rounded-[2.5rem] px-8 py-6 text-sm text-white outline-none appearance-none cursor-pointer font-bold italic"
                    >
                      <option value="prefer-not-to-say">N/A</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                      <Zap size={14} fill="currentColor" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Height & Weight */}
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-500 px-6 flex items-center gap-2 tracking-widest italic"><Ruler size={12}/> Height (cm)</label>
                  <div className="relative">
                    <input 
                      type="number"
                      required
                      placeholder="Metric CM"
                      value={formData.height}
                      onChange={(e) => setFormData({...formData, height: e.target.value})}
                      className={`w-full bg-slate-950/80 border rounded-[2.5rem] px-8 py-6 text-sm text-white outline-none font-mono font-bold italic ${getInputBorderClass(validations.height, formData.height)}`}
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-700 uppercase tracking-widest pointer-events-none">Metric CM</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-500 px-6 flex items-center gap-2 tracking-widest italic"><Scale size={12}/> Weight (kg)</label>
                  <div className="relative">
                    <input 
                      type="number"
                      required
                      placeholder="Metric KG"
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: e.target.value})}
                      className={`w-full bg-slate-950/80 border rounded-[2.5rem] px-8 py-6 text-sm text-white outline-none font-mono font-bold italic ${getInputBorderClass(validations.weight, formData.weight)}`}
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-700 uppercase tracking-widest pointer-events-none">Metric KG</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-7 bg-indigo-500/5 border border-indigo-500/10 rounded-[2.5rem] flex gap-5">
              <ShieldCheck size={24} className="text-indigo-400 shrink-0 mt-1" />
              <p className="text-[11px] text-slate-400 italic leading-relaxed">
                Biometric data is utilized exclusively for Neural Synthesis calibration within SomnoAI Digital Sleep Lab.
              </p>
            </div>

            <AnimatePresence>
              {error && (
                <m.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex items-start gap-4"
                >
                  <AlertCircle size={20} className="text-rose-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-rose-400 font-bold italic uppercase tracking-wider">{error}</p>
                </m.div>
              )}
            </AnimatePresence>

            <button 
              type="submit"
              disabled={isSaving || !isFormValid}
              className={`w-full py-7 rounded-full font-black text-sm uppercase tracking-[0.5em] shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-4 italic relative overflow-hidden ${isFormValid ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/30' : 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50 border border-white/5'}`}
            >
              {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Zap size={20} fill="currentColor" />}
              <span>{isSaving ? 'SYNCHRONIZING...' : 'Initialize Profile'}</span>
              
              {isSaving && (
                <m.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                />
              )}
            </button>
          </form>
        </GlassCard>
      </m.div>

      <footer className="mt-16 text-center opacity-40">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-700 italic">
          @2026 SomnoAI Digital Sleep Lab • Neural Infrastructure
        </p>
      </footer>
    </div>
  );
};