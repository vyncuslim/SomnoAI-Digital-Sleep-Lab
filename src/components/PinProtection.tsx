import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Shield, Key, RefreshCw, CheckCircle2, AlertCircle, Copy } from 'lucide-react';
import { Logo } from './Logo';

interface PinProtectionProps {
  children: React.ReactNode;
}

export const PinProtection: React.FC<PinProtectionProps> = ({ children }) => {
  const { user, loading, hasPinSet, isPinVerified, isPinBlocked, setIsPinVerified, verifyPin, setPin, resetPinWithRecoveryKey } = useAuth();
  const [pin, setPinInput] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [recoveryKey, setRecoveryKey] = useState('');
  const [recoveryInput, setRecoveryInput] = useState('');
  const [mode, setMode] = useState<'verify' | 'setup' | 'recovery' | 'success'>('verify');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      if (!hasPinSet) {
        setMode('setup');
      } else if (!isPinVerified) {
        setMode('verify');
      }
    }
  }, [loading, user, hasPinSet, isPinVerified]);

  if (loading) return null;
  if (!user) return <>{children}</>;
  if (isPinVerified) return <>{children}</>;

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    if (pin.length !== 6 || !/^\d+$/.test(pin)) {
      setError('PIN must be exactly 6 numeric digits');
      setIsProcessing(false);
      return;
    }

    try {
      const success = await verifyPin(pin);
      if (!success) {
        setError('Incorrect PIN. Please try again.');
        setPinInput('');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    if (pin.length !== 6 || !/^\d+$/.test(pin)) {
      setError('PIN must be exactly 6 numeric digits');
      setIsProcessing(false);
      return;
    }

    if (pin !== confirmPin) {
      setError('PINs do not match');
      setIsProcessing(false);
      return;
    }

    try {
      const { recoveryKey: key } = await setPin(pin);
      setRecoveryKey(key);
      setMode('success');
    } catch (err: any) {
      setError(err.message || 'Failed to set PIN. Please try again.');
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
      setError('Please provide recovery key and a new 6-digit numeric PIN');
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
        setError('Invalid recovery key');
      }
    } catch (err) {
      setError('Recovery failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const PinInput = ({ value, onChange, disabled = false, autoFocus = false }: { value: string, onChange: (val: string) => void, disabled?: boolean, autoFocus?: boolean }) => {
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleContainerClick = () => {
      inputRef.current?.focus();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
      onChange(val);
    };

    return (
      <div 
        className="relative flex justify-center gap-2 cursor-text" 
        onClick={handleContainerClick}
      >
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={6}
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
          autoFocus={autoFocus}
          className="absolute inset-0 opacity-0 cursor-default"
          aria-label="6-digit PIN"
        />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div 
            key={i} 
            className={`w-12 h-16 bg-white/5 border rounded-xl flex items-center justify-center text-3xl font-mono font-bold transition-all ${
              value.length === i && !disabled ? 'border-emerald-500 ring-4 ring-emerald-500/10' : 'border-white/10'
            } ${disabled ? 'opacity-50' : ''}`}
          >
            <span className={value[i] ? 'text-white' : 'text-white/10'}>
              {value[i] || '0'}
            </span>
            {value.length === i && !disabled && (
              <motion.div
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="absolute bottom-3 w-6 h-0.5 bg-emerald-500/50"
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  const copyRecoveryKey = () => {
    navigator.clipboard.writeText(recoveryKey);
    setShowCopySuccess(true);
    setTimeout(() => setShowCopySuccess(false), 2000);
  };

  const lang = user?.email?.includes('zh') || navigator.language.startsWith('zh') ? 'zh' : 'en';

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
            {mode === 'verify' && (lang === 'zh' ? '安全验证' : 'Security Verification')}
            {mode === 'setup' && (lang === 'zh' ? '设置安全 PIN' : 'Set Security PIN')}
            {mode === 'recovery' && (lang === 'zh' ? '账户恢复' : 'Account Recovery')}
            {mode === 'success' && (lang === 'zh' ? 'PIN 设置成功' : 'PIN Set Successfully')}
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
                {lang === 'zh' ? '创建一个 6 位 PIN 以保护您的账户。' : 'Create a 6-digit PIN to protect your account.'}
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
                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                  <AlertCircle className="w-4 h-4" />
                  Access blocked due to multiple failed attempts.
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
                {isProcessing ? 'VERIFYING...' : 'UNLOCK ACCESS'}
              </button>

              <button
                type="button"
                onClick={() => setMode('recovery')}
                className="w-full text-white/30 text-xs hover:text-white/60 transition-colors uppercase tracking-widest"
              >
                Forgot PIN? Use Recovery Key
              </button>
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
                  <label className="text-xs text-white/30 uppercase tracking-widest mb-4 block text-center">New 6-Digit PIN</label>
                  <PinInput value={pin} onChange={setPinInput} autoFocus />
                </div>
                <div>
                  <label className="text-xs text-white/30 uppercase tracking-widest mb-4 block text-center">Confirm PIN</label>
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
                {isProcessing ? 'SETTING UP...' : 'CREATE PIN'}
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
                  <label className="text-xs text-white/30 uppercase tracking-widest mb-2 block">Recovery Key</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input
                      type="text"
                      value={recoveryInput}
                      onChange={(e) => setRecoveryInput(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors font-mono text-sm"
                      placeholder="Enter your recovery key"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/30 uppercase tracking-widest mb-4 block text-center">New 6-Digit PIN</label>
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
                {isProcessing ? 'RECOVERING...' : 'RESET PIN'}
              </button>

              <button
                type="button"
                onClick={() => setMode('verify')}
                className="w-full text-white/30 text-xs hover:text-white/60 transition-colors uppercase tracking-widest"
              >
                Back to PIN Entry
              </button>
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
                <p className="text-xs text-emerald-500/60 uppercase tracking-widest mb-4">Your Recovery Key</p>
                <div className="bg-black/40 rounded-xl p-4 font-mono text-emerald-500 break-all text-sm mb-4 border border-emerald-500/10">
                  {recoveryKey}
                </div>
                <button
                  onClick={copyRecoveryKey}
                  className="flex items-center gap-2 mx-auto text-emerald-500/60 hover:text-emerald-500 transition-colors text-xs uppercase tracking-widest"
                >
                  {showCopySuccess ? (
                    <><CheckCircle2 className="w-3 h-3" /> COPIED</>
                  ) : (
                    <><Copy className="w-3 h-3" /> Copy Key</>
                  )}
                </button>
              </div>

              <div className="flex items-start gap-3 text-white/40 text-xs bg-white/5 p-4 rounded-xl border border-white/10">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>Store this key securely. You will need it if you forget your PIN. This is the only time it will be shown.</p>
              </div>

              <button
                onClick={() => setIsPinVerified(true)}
                className="w-full py-4 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all"
              >
                CONTINUE TO WEBSITE
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
