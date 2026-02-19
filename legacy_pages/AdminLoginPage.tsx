
import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldAlert, Loader2, ChevronLeft, Mail, ShieldCheck, 
  Shield, Lock, AlertCircle, RefreshCw, Terminal, Info, Clock, Zap, Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '../components/Logo.tsx';
import { adminApi, authApi } from '../services/supabaseService.ts';

const m = motion as any;

export default function AdminLoginPage() {
  const [step, setStep] = useState<'input' | 'verify'>('input');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<{ message: string; isRateLimit?: boolean } | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const executeOtpVerify = async (fullOtp?: string) => {
    const token = fullOtp || otp.join('');
    if (token.length < 6 || isProcessing) return;
    setIsProcessing(true);
    setError(null);
    try {
      const { data, error: verifyErr } = await authApi.verifyOTP(email.trim().toLowerCase(), token);
      if (verifyErr) throw new Error(verifyErr.message || "Invalid biometric token.");
      const isAdmin = await adminApi.checkAdminStatus();
      if (!isAdmin) {
        await authApi.signOut();
        throw new Error("ACCESS_DENIED: Identity lacks ADMIN clearance.");
      }
      window.location.replace('/admin');
    } catch (err: any) {
      setError({ message: err.message || "Authorization failed." });
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestToken = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsProcessing(true);
    try {
      const { error: otpErr } = await authApi.sendOTP(email.trim().toLowerCase());
      if (otpErr) throw otpErr;
      setStep('verify');
    } catch (err: any) {
      setError({ message: err.message || "Protocol link severed." });
    } finally { setIsProcessing(false); }
  };

  return (
    <div className="min-h-screen bg-[#010409] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden text-left">
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[180px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-rose-600/20 blur-[180px] rounded-full" />
      </div>

      <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16 space-y-6 relative z-10">
        <Logo size={100} animated={true} />
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white italic uppercase leading-none">SomnoAI Digital Sleep <span className="text-indigo-400">Lab</span></h1>
        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.8em] mt-3 opacity-60 italic">RESTRICTED COMMAND INTERFACE</p>
      </m.div>

      <div className="w-full max-w-[440px] relative z-10">
        <div className="bg-slate-950/80 backdrop-blur-3xl border border-white/5 rounded-[4rem] p-1.5 shadow-[0_100px_150px_-50px_rgba(0,0,0,1)] overflow-hidden">
          <div className="p-10 md:p-14 space-y-10">
            <div className="flex items-center gap-3 justify-center">
              <Key size={18} className="text-indigo-500" />
              <h2 className="text-lg font-black italic text-white uppercase tracking-widest leading-none">Command Link</h2>
            </div>
            {/* 登录表单内容保持逻辑不变... */}
          </div>
        </div>
      </div>
    </div>
  );
}
