import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard.tsx';
import { 
  User, Brain, Ruler, Scale, Heart, Save, Loader2, 
  Zap, ShieldCheck, AlertCircle, Database, ExternalLink, ChevronRight, FlaskConical, XCircle, CheckCircle2
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
  const [isSchemaError, setIsSchemaError] = useState(false);
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
    height: parseFloat(formData.height) > 50 && parseFloat(formData.height) < 300,
    weight: parseFloat(formData.weight) > 20 && parseFloat(formData.weight) < 500
  };

  const isFormValid = Object.values(validations).every(v => v);

  useEffect(() => {
    let timer: any;
    if (isSaving) {
      timer = setTimeout(() => {
        if (isSaving) {
          setIsSaving(false);
          setError("Connection timeout. The laboratory node responded late.");
        }
      }, 15000);
    }
    return () => clearTimeout(timer);
  }, [isSaving]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || !isFormValid) return;
    
    setIsSaving(true);
    setError(null);
    setIsSchemaError(false);

    try {
      const result = await userDataApi.completeSetup(formData.fullName, {
        age: formData.age,
        weight: formData.weight,
        height: formData.height,
        gender: formData.gender
      });

      if (result) {
        onComplete();
      }
    } catch (err: any) {
      console.error("Setup Error:", err);
      const msg = err.message || "Failed to commit profile. Please try again.";
      setError(msg);
      
      if (msg.includes('column') || msg.includes('SCHEMA_UNINITIALIZED') || msg.includes('42P01')) {
        setIsSchemaError(true);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const getInputBorderClass = (isValid: boolean, value: string) => {
    if (!value) return 'border-white/10';
    return isValid ? 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.1)]';
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-[120px]" />
      </div>

      <m.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-xl z-10"
      >
        <div className="text-center mb-10 space-y-4">
          <Logo size={80} animated={true} />
          <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none">Subject Registration</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em]">Initial Laboratory Onboarding</p>
        </div>

        <GlassCard className="p-10 md:p-12 border-indigo-500/20 shadow-2xl rounded-[3.5rem]">
          <form onSubmit={handleSave} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase text-slate-500 px-4 flex items-center gap-2 tracking-widest italic">
                  <User size={12}/> Subject Identity (Full Name)
                </label>
                <div className="relative">
                  <input 
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className={`w-full bg-slate-950/60 border rounded-full px-8 py-5 text-sm text-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-800 font-semibold italic ${getInputBorderClass(validations.fullName, formData.fullName)}`}
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2">
                    {formData.fullName && (validations.fullName ? <CheckCircle2 className="text-emerald-500" size={18} /> : <XCircle className="text-rose-500" size={18} />)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase text-slate-500 px-4 flex items-center gap-2 tracking-widest italic"><Brain size={12}/> Age</label>
                  <div className="relative">
                    <input 
                      type="number"
                      required
                      placeholder="Years"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                      className={`w-full bg-slate-950/60 border rounded-3xl px-8 py-5 text-sm text-white outline-none font-mono ${getInputBorderClass(validations.age, formData.age)}`}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase text-slate-500 px-4 flex items-center gap-2 tracking-widest italic"><Heart size={12}/> Neural Polarity</label>
                  <select 
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full bg-slate-950/60 border border-white/10 rounded-3xl px-8 py-5 text-sm text-white outline-none appearance-none cursor-pointer font-semibold italic"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">N/A</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase text-slate-500 px-4 flex items-center gap-2 tracking-widest italic"><Ruler size={12}/> Height (cm)</label>
                  <div className="relative">
                    <input 
                      type="number"
                      required
                      placeholder="Metric CM"
                      value={formData.height}
                      onChange={(e) => setFormData({...formData, height: e.target.value})}
                      className={`w-full bg-slate-950/60 border rounded-3xl px-8 py-5 text-sm text-white outline-none font-mono ${getInputBorderClass(validations.height, formData.height)}`}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase text-slate-500 px-4 flex items-center gap-2 tracking-widest italic"><Scale size={12}/> Weight (kg)</label>
                  <div className="relative">
                    <input 
                      type="number"
                      required
                      placeholder="Metric KG"
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: e.target.value})}
                      className={`w-full bg-slate-950/60 border rounded-3xl px-8 py-5 text-sm text-white outline-none font-mono ${getInputBorderClass(validations.weight, formData.weight)}`}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-[2rem] flex gap-4">
              <ShieldCheck size={20} className="text-indigo-400 shrink-0" />
              <p className="text-[10px] text-slate-400 italic leading-relaxed">
                Biometric data is utilized exclusively for Neural Synthesis calibration within SomnoAI Digital Sleep Lab.
              </p>
            </div>

            <AnimatePresence>
              {error && (
                <m.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3">
                    <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-[10px] font-black font-mono text-rose-500 uppercase tracking-widest">Protocol Error</p>
                      <p className="text-[10px] text-rose-400 leading-tight italic">{error}</p>
                    </div>
                  </div>
                </m.div>
              )}
            </AnimatePresence>

            <button 
              type="submit"
              disabled={isSaving || !isFormValid}
              className={`w-full py-6 rounded-full font-black text-xs uppercase tracking-[0.4em] shadow-xl shadow-indigo-900/20 active:scale-95 transition-all flex items-center justify-center gap-3 italic relative overflow-hidden ${isFormValid ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5 opacity-50'}`}
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} fill="currentColor" />}
              {isSaving ? 'Synchronizing Profile...' : 'Initialize Profile'}
              
              {isSaving && (
                <m.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                />
              )}
            </button>
          </form>
        </GlassCard>
      </m.div>
    </div>
  );
};