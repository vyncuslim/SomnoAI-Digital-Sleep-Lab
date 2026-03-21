import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Shield, Key, RefreshCw, CheckCircle2, AlertCircle, Copy } from 'lucide-react';

interface PinProtectionProps {
  children: React.ReactNode;
}

export const PinProtection: React.FC<PinProtectionProps> = ({ children }) => {
  const { user, loading, hasPinSet, isPinVerified, verifyPin, setPin, resetPinWithRecoveryKey } = useAuth();
  const [pin, setPinInput] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [recoveryKey, setRecoveryKey] = useState('');
  const [recoveryInput, setRecoveryInput] = useState('');
  const [mode, setMode] = useState<'verify' | 'setup' | 'recovery' | 'success'>('verify');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

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

    if (pin.length !== 6) {
      setError('PIN must be 6 digits');
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

    if (pin.length !== 6) {
      setError('PIN must be 6 digits');
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
    } catch (err) {
      setError('Failed to set PIN. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    if (!recoveryInput || pin.length !== 6) {
      setError('Please provide recovery key and new 6-digit PIN');
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

  const copyRecoveryKey = () => {
    navigator.clipboard.writeText(recoveryKey);
    // Could add a toast here
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
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20">
            {mode === 'verify' && <Lock className="w-8 h-8 text-emerald-500" />}
            {mode === 'setup' && <Shield className="w-8 h-8 text-emerald-500" />}
            {mode === 'recovery' && <RefreshCw className="w-8 h-8 text-emerald-500" />}
            {mode === 'success' && <CheckCircle2 className="w-8 h-8 text-emerald-500" />}
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-tight">
            {mode === 'verify' && 'Security Verification'}
            {mode === 'setup' && 'Set Security PIN'}
            {mode === 'recovery' && 'Account Recovery'}
            {mode === 'success' && 'PIN Set Successfully'}
          </h2>
          <p className="text-white/50 text-sm">
            {mode === 'verify' && 'Enter your 6-digit security PIN to continue.'}
            {mode === 'setup' && 'Create a 6-digit PIN to protect your account.'}
            {mode === 'recovery' && 'Use your recovery key to reset your PIN.'}
            {mode === 'success' && 'Please save your recovery key in a safe place.'}
          </p>
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
              <div className="flex justify-center gap-2">
                <input
                  type="password"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-center text-3xl tracking-[1em] text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                  placeholder="••••••"
                  autoFocus
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing || pin.length !== 6}
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
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-white/30 uppercase tracking-widest mb-2 block">New 6-Digit PIN</label>
                  <input
                    type="password"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                    placeholder="••••••"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/30 uppercase tracking-widest mb-2 block">Confirm PIN</label>
                  <input
                    type="password"
                    maxLength={6}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                    placeholder="••••••"
                  />
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
              <div className="space-y-4">
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
                  <label className="text-xs text-white/30 uppercase tracking-widest mb-2 block">New 6-Digit PIN</label>
                  <input
                    type="password"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                    placeholder="••••••"
                  />
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
                  <Copy className="w-3 h-3" />
                  Copy Key
                </button>
              </div>

              <div className="flex items-start gap-3 text-white/40 text-xs bg-white/5 p-4 rounded-xl border border-white/10">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>Store this key securely. You will need it if you forget your PIN. This is the only time it will be shown.</p>
              </div>

              <button
                onClick={() => window.location.reload()}
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
