import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/useLanguage';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Shield, Key, RefreshCw, CheckCircle2, AlertCircle, Copy, LogOut, Timer } from 'lucide-react';
import { Logo } from './Logo';

interface PinProtectionProps {
  children: React.ReactNode;
}

export const PinProtection: React.FC<PinProtectionProps> = ({ children }) => {
  const { user, profile, loading, hasPinSet, isPinVerified, isPinBlocked, setIsPinVerified, verifyPin, setPin, resetPinWithRecoveryKey, signOut } = useAuth();
  const { t } = useLanguage();
  const [pin, setPinInput] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [recoveryKey, setRecoveryKey] = useState('');
  const [recoveryInput, setRecoveryInput] = useState('');
  const [mode, setMode] = useState<'verify' | 'setup' | 'recovery' | 'success'>('verify');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      if (!hasPinSet) {
        setMode('setup');
      } else if (!isPinVerified) {
        setMode('verify');
      }
    }
  }, [loading, user, hasPinSet, isPinVerified]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPinBlocked && profile?.pin_blocked_until) {
      const updateTimer = () => {
        const now = new Date();
        const blockedUntil = new Date(profile.pin_blocked_until!);
        const diff = blockedUntil.getTime() - now.getTime();
        
        if (diff <= 0) {
          setTimeLeft(null);
          return;
        }

        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      };

      updateTimer();
      interval = setInterval(updateTimer, 1000);
    } else {
      setTimeLeft(null);
    }
    return () => clearInterval(interval);
  }, [isPinBlocked, profile?.pin_blocked_until]);

  if (loading) return null;
  if (!user) return <>{children}</>;
  if (isPinVerified) return <>{children}</>;

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    if (pin.length !== 6 || !/^\d+$/.test(pin)) {
      setError(t('auth.pinInvalid'));
      setIsProcessing(false);
      return;
    }

    try {
      const success = await verifyPin(pin);
      if (!success) {
        setError(t('auth.pinIncorrect'));
        setPinInput('');
      }
    } catch (err) {
      setError(t('auth.error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    if (pin.length !== 6 || !/^\d+$/.test(pin)) {
      setError(t('auth.pinInvalid'));
      setIsProcessing(false);
      return;
    }

    if (pin !== confirmPin) {
      setError(t('auth.pinMismatch') || 'PINs do not match');
      setIsProcessing(false);
      return;
    }

    try {
      const { recoveryKey: key } = await setPin(pin);
      setRecoveryKey(key);
      setMode('success');
    } catch (err: any) {
      setError(err.message || t('auth.pinSetError') || 'Failed to set PIN. Please try again.');
      console.error('PIN Setup Error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    if (!recoveryInput || pin.length !== 6 || !/^\d+$/.test(pin)) {
      setError(t('auth.pinRecoveryError') || 'Please provide recovery key and a new 6-digit numeric PIN');
      setIsProcessing(false);
      return;
    }

    try {
      const success = await resetPinWithRecoveryKey(recoveryInput, pin);
      if (success) {
        setMode('verify');
        setPinInput('');
        setRecoveryInput('');
      } else {
        setError(t('auth.pinRecoveryKeyInvalid') || 'Invalid recovery key');
      }
    } catch (err) {
      setError(t('auth.pinRecoveryFailed') || 'Recovery failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const PinInput = ({ value, onChange, disabled = false, autoFocus = false }: { value: string, onChange: (val: string) => void, disabled?: boolean, autoFocus?: boolean }) => {
    return (
      <div className="relative group max-w-[280px] mx-auto">
        <input
          type="password"
          inputMode="numeric"
          pattern="\d*"
          maxLength={6}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
          disabled={disabled}
          autoFocus={autoFocus}
          placeholder="••••••"
          autoComplete="new-password"
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 text-center text-4xl font-mono tracking-[0.5em] text-emerald-500 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-white/5"
        />
        <div className="absolute inset-0 rounded-2xl border border-white/5 pointer-events-none group-hover:border-white/10 transition-colors" />
      </div>
    );
  };

  const copyRecoveryKey = () => {
    navigator.clipboard.writeText(recoveryKey);
    setShowCopySuccess(true);
    setTimeout(() => setShowCopySuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#01040a] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent_70%)]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md bg-black/40 border border-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <Logo className="mb-8 scale-110" showText={false} />
          
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20">
            {mode === 'verify' && <Lock className="w-8 h-8 text-emerald-500" />}
            {mode === 'setup' && <Shield className="w-8 h-8 text-emerald-500" />}
            {mode === 'recovery' && <RefreshCw className="w-8 h-8 text-emerald-500" />}
            {mode === 'success' && <CheckCircle2 className="w-8 h-8 text-emerald-500" />}
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-tight">
            {mode === 'verify' && t('auth.pinVerifyTitle')}
            {mode === 'setup' && t('auth.pinSetupTitle')}
            {mode === 'recovery' && t('auth.pinRecoveryTitle')}
            {mode === 'success' && t('auth.pinSetSuccess')}
          </h2>
          <div className="space-y-1">
            <p className="text-white/50 text-sm font-mono">
              {mode === 'verify' && (isPinBlocked ? '> ACCESS_DENIED: Too many failed attempts.' : '> ENTER_PIN: 6-digit security code required.')}
              {mode === 'setup' && '> INITIALIZING: Create 6-digit security PIN.'}
              {mode === 'recovery' && '> RECOVERY_MODE: Resetting security credentials.'}
              {mode === 'success' && '> SUCCESS: Security PIN established.'}
            </p>
            {mode === 'setup' && (
              <p className="text-slate-400 text-xs">
                {t('auth.pinSetupDesc')}
              </p>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'verify' && (
            <motion.form 
              key="verify"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handlePinSubmit}
              className="space-y-6"
            >
              <PinInput 
                value={pin} 
                onChange={setPinInput} 
                disabled={isPinBlocked} 
                autoFocus 
              />

              {isPinBlocked && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                    <AlertCircle className="w-4 h-4" />
                    {t('auth.pinBlockedMessage')}
                  </div>
                  {timeLeft && (
                    <div className="flex items-center justify-center gap-2 text-white/40 text-xs font-mono">
                      <Timer className="w-3 h-3" />
                      {t('auth.pinTryAgainIn').replace('{time}', timeLeft)}
                    </div>
                  )}
                </div>
              )}

              {error && !isPinBlocked && (
                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing || pin.length !== 6 || isPinBlocked}
                className="w-full py-4 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isProcessing ? t('auth.pinVerifying') : t('auth.pinUnlock')}
              </button>

              <div className="flex flex-col gap-4">
                <button
                  type="button"
                  onClick={() => setMode('recovery')}
                  className="w-full text-white/30 text-xs hover:text-white/60 transition-colors uppercase tracking-widest"
                >
                  {t('auth.pinForgot')}
                </button>

                <button
                  type="button"
                  onClick={() => signOut()}
                  className="w-full flex items-center justify-center gap-2 text-red-500/40 text-xs hover:text-red-500/80 transition-colors uppercase tracking-widest"
                >
                  <LogOut className="w-3 h-3" />
                  {t('settings.logout')}
                </button>
              </div>
            </motion.form>
          )}

          {mode === 'setup' && (
            <motion.form 
              key="setup"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSetupSubmit}
              className="space-y-6"
            >
              <div className="space-y-6">
                <div>
                  <label className="text-xs text-white/30 uppercase tracking-widest mb-4 block text-center">
                    {t('auth.pinNewPlaceholder')}
                  </label>
                  <PinInput value={pin} onChange={setPinInput} autoFocus />
                </div>
                <div>
                  <label className="text-xs text-white/30 uppercase tracking-widest mb-4 block text-center">
                    {t('auth.pinConfirmPlaceholder')}
                  </label>
                  <PinInput value={confirmPin} onChange={setConfirmPin} />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing || pin.length !== 6 || pin !== confirmPin}
                className="w-full py-4 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isProcessing ? t('auth.pinSettingUp') : t('auth.pinCreate')}
              </button>

              <button
                type="button"
                onClick={() => signOut()}
                className="w-full flex items-center justify-center gap-2 text-red-500/40 text-xs hover:text-red-500/80 transition-colors uppercase tracking-widest"
              >
                <LogOut className="w-3 h-3" />
                {t('settings.logout')}
              </button>
            </motion.form>
          )}

          {mode === 'recovery' && (
            <motion.form 
              key="recovery"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleRecoverySubmit}
              className="space-y-6"
            >
              <div className="space-y-6">
                <div>
                  <label className="text-xs text-white/30 uppercase tracking-widest mb-2 block">
                    {t('auth.pinRecoveryKeyLabel')}
                  </label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input
                      type="text"
                      value={recoveryInput}
                      onChange={(e) => setRecoveryInput(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors font-mono text-sm"
                      placeholder={t('auth.pinRecoveryKeyPlaceholder')}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/30 uppercase tracking-widest mb-4 block text-center">
                    {t('auth.pinNewPlaceholder')}
                  </label>
                  <PinInput value={pin} onChange={setPinInput} />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing || !recoveryInput || pin.length !== 6}
                className="w-full py-4 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isProcessing ? t('auth.pinRecovering') : t('auth.pinReset')}
              </button>

              <div className="flex flex-col gap-4">
                <button
                  type="button"
                  onClick={() => setMode('verify')}
                  className="w-full text-white/30 text-xs hover:text-white/60 transition-colors uppercase tracking-widest"
                >
                  {t('auth.backToLogin') || 'Back to PIN Entry'}
                </button>

                <button
                  type="button"
                  onClick={() => signOut()}
                  className="w-full flex items-center justify-center gap-2 text-red-500/40 text-xs hover:text-red-500/80 transition-colors uppercase tracking-widest"
                >
                  <LogOut className="w-3 h-3" />
                  {t('settings.logout')}
                </button>
              </div>
            </motion.form>
          )}

          {mode === 'success' && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 text-center">
                <p className="text-xs text-emerald-500/60 uppercase tracking-widest mb-4">
                  {t('auth.pinRecoveryKeyLabel')}
                </p>
                <div className="bg-black/40 rounded-xl p-4 font-mono text-emerald-500 break-all text-sm mb-4 border border-emerald-500/10">
                  {recoveryKey}
                </div>
                <button
                  onClick={copyRecoveryKey}
                  className="flex items-center gap-2 mx-auto text-emerald-500/60 hover:text-emerald-500 transition-colors text-xs uppercase tracking-widest"
                >
                  {showCopySuccess ? (
                    <><CheckCircle2 className="w-3 h-3" /> {t('auth.pinCopied')}</>
                  ) : (
                    <><Copy className="w-3 h-3" /> {t('auth.pinCopyKey')}</>
                  )}
                </button>
              </div>

              <div className="flex items-start gap-3 text-white/40 text-xs bg-white/5 p-4 rounded-xl border border-white/10">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  {t('auth.pinRecoveryWarning')}
                </p>
              </div>

              <button
                onClick={() => setIsPinVerified(true)}
                className="w-full py-4 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all"
              >
                {t('auth.pinContinue')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
