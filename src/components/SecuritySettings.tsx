import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Key, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const SecuritySettings: React.FC = () => {
  const { hasPinSet, setPin, resetPinWithRecoveryKey } = useAuth();
  const [mode, setMode] = useState<'idle' | 'change' | 'recovery' | 'success'>('idle');
  const [pin, setPinInput] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [recoveryInput, setRecoveryInput] = useState('');
  const [recoveryKey, setRecoveryKey] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const PinInput = ({ value, onChange, disabled = false }: { value: string, onChange: (val: string) => void, disabled?: boolean }) => {
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (index: number, val: string) => {
      if (!/^\d*$/.test(val)) return;
      
      const newPin = value.split('');
      newPin[index] = val.slice(-1);
      const updatedPin = newPin.join('');
      onChange(updatedPin);

      if (val && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !value[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    };

    return (
      <div className="flex justify-center gap-2">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="\d*"
            maxLength={1}
            value={value[i] || ''}
            disabled={disabled}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="w-10 h-12 bg-slate-800 border border-slate-700 rounded-lg text-center text-xl font-bold text-white focus:outline-none focus:border-indigo-500 transition-all"
          />
        ))}
      </div>
    );
  };

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    if (pin.length !== 6 || !/^\d+$/.test(pin)) {
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
      setError('Failed to update PIN');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    if (!recoveryInput || pin.length !== 6) {
      setError('Provide recovery key and new 6-digit PIN');
      setIsProcessing(false);
      return;
    }

    try {
      const success = await resetPinWithRecoveryKey(recoveryInput, pin);
      if (success) {
        setMode('idle');
        setPinInput('');
        setRecoveryInput('');
      } else {
        setError('Invalid recovery key');
      }
    } catch (err) {
      setError('Recovery failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${hasPinSet ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Security PIN</h3>
            <p className="text-xs text-slate-400">{hasPinSet ? 'PIN protection is active' : 'Set a PIN to protect your account'}</p>
          </div>
        </div>
        <button
          onClick={() => setMode(hasPinSet ? 'change' : 'change')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors"
        >
          {hasPinSet ? 'CHANGE PIN' : 'SET PIN'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {mode !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
              {mode === 'change' && (
                <form onSubmit={handleSetupSubmit} className="space-y-6">
                  <div className="text-center">
                    <h4 className="text-lg font-bold text-white mb-1">{hasPinSet ? 'Change Security PIN' : 'Set Security PIN'}</h4>
                    <p className="text-xs text-slate-400">Enter a new 6-digit numeric PIN</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 block text-center">New PIN</label>
                      <PinInput value={pin} onChange={setPinInput} />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 block text-center">Confirm PIN</label>
                      <PinInput value={confirmPin} onChange={setConfirmPin} />
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setMode('idle')}
                      className="flex-1 py-3 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-700 transition-all"
                    >
                      CANCEL
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing || pin.length !== 6 || pin !== confirmPin}
                      className="flex-1 py-3 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-500 disabled:opacity-50 transition-all"
                    >
                      {isProcessing ? 'PROCESSING...' : 'SAVE PIN'}
                    </button>
                  </div>

                  {hasPinSet && (
                    <button
                      type="button"
                      onClick={() => setMode('recovery')}
                      className="w-full text-slate-500 text-[10px] uppercase tracking-widest hover:text-slate-300 transition-colors"
                    >
                      Forgot PIN? Use Recovery Key
                    </button>
                  )}
                </form>
              )}

              {mode === 'recovery' && (
                <form onSubmit={handleRecoverySubmit} className="space-y-6">
                  <div className="text-center">
                    <h4 className="text-lg font-bold text-white mb-1">PIN Recovery</h4>
                    <p className="text-xs text-slate-400">Use your recovery key to reset your PIN</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 block">Recovery Key</label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                        <input
                          type="text"
                          value={recoveryInput}
                          onChange={(e) => setRecoveryInput(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors font-mono text-xs"
                          placeholder="Enter recovery key"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 block text-center">New 6-Digit PIN</label>
                      <PinInput value={pin} onChange={setPinInput} />
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setMode('idle')}
                      className="flex-1 py-3 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-700 transition-all"
                    >
                      CANCEL
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing || !recoveryInput || pin.length !== 6}
                      className="flex-1 py-3 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-500 disabled:opacity-50 transition-all"
                    >
                      {isProcessing ? 'RESETTING...' : 'RESET PIN'}
                    </button>
                  </div>
                </form>
              )}

              {mode === 'success' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-1">PIN Set Successfully</h4>
                    <p className="text-xs text-slate-400">Save your recovery key in a safe place</p>
                  </div>

                  <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 text-center">
                    <div className="bg-black/40 rounded-lg p-3 font-mono text-emerald-500 break-all text-xs mb-3">
                      {recoveryKey}
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(recoveryKey)}
                      className="text-emerald-500/60 hover:text-emerald-500 transition-colors text-[10px] uppercase tracking-widest font-bold"
                    >
                      Copy Key
                    </button>
                  </div>

                  <button
                    onClick={() => setMode('idle')}
                    className="w-full py-3 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-500 transition-all"
                  >
                    DONE
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
