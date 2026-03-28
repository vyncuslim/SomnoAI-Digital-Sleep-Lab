import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Key, CheckCircle2, AlertCircle, Usb } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/useLanguage';
import { UsbAuth } from './UsbAuth';

export const SecuritySettings: React.FC = () => {
  const { hasPinSet, setPin, resetPinWithRecoveryKey } = useAuth();
  const { t } = useLanguage();
  const [mode, setMode] = useState<'idle' | 'change' | 'recovery' | 'success'>('idle');
  const [pin, setPinInput] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [recoveryInput, setRecoveryInput] = useState('');
  const [recoveryKey, setRecoveryKey] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const PinInput = ({ value, onChange, disabled = false, autoFocus = false }: { value: string, onChange: (val: string) => void, disabled?: boolean, autoFocus?: boolean }) => {
    return (
      <div className="relative group max-w-[240px] mx-auto">
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
          className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-4 text-center text-3xl font-mono tracking-[0.4em] text-indigo-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-white/5"
        />
      </div>
    );
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
      setError(t('auth.pinMismatch'));
      setIsProcessing(false);
      return;
    }

    try {
      const { recoveryKey: key } = await setPin(pin);
      setRecoveryKey(key);
      setMode('success');
    } catch (err: any) {
      setError(err.message || t('auth.pinSetError'));
      console.error('PIN Setup Error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    if (!recoveryInput || pin.length !== 6) {
      setError(t('auth.pinRecoveryError'));
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
        setError(t('auth.pinRecoveryInvalid'));
      }
    } catch (err: any) {
      setError(err.message || t('auth.pinRecoveryFailed'));
      console.error('PIN Recovery Error:', err);
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
            <h3 className="text-sm font-bold text-white">{t('auth.pinLabel')}</h3>
            <p className="text-xs text-slate-400">{hasPinSet ? t('auth.pinProtectionActive') : t('auth.pinProtectionInactive')}</p>
          </div>
        </div>
        <button
          onClick={() => setMode(hasPinSet ? 'change' : 'change')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors"
        >
          {hasPinSet ? t('auth.pinChange') : t('auth.pinCreate')}
        </button>
      </div>

      <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
            <Usb className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">U-disk Authentication</h3>
            <p className="text-xs text-slate-400">Bind a physical U-disk for hardware-based unlocking</p>
          </div>
        </div>
        <div className="w-40">
          <UsbAuth mode="bind" />
        </div>
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
                    <h4 className="text-lg font-bold text-white mb-1">{hasPinSet ? t('auth.pinChange') : t('auth.pinSetupTitle')}</h4>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-slate-400 font-mono"
                    >
                      {'> '}{t('auth.pinSetupDesc')}
                    </motion.p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 block text-center font-bold">{t('auth.pinLabel')}</label>
                      <PinInput value={pin} onChange={setPinInput} autoFocus />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 block text-center font-bold">{t('auth.pinConfirmLabel')}</label>
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
                      {t('auth.pinCancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing || pin.length !== 6 || pin !== confirmPin}
                      className="flex-1 py-3 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-500 disabled:opacity-50 transition-all"
                    >
                      {isProcessing ? t('auth.pinProcessing') : t('auth.pinSave')}
                    </button>
                  </div>

                  {hasPinSet && (
                    <button
                      type="button"
                      onClick={() => setMode('recovery')}
                      className="w-full text-slate-500 text-[10px] uppercase tracking-widest hover:text-slate-300 transition-colors"
                    >
                      {t('auth.pinForgot')}
                    </button>
                  )}
                </form>
              )}

              {mode === 'recovery' && (
                <form onSubmit={handleRecoverySubmit} className="space-y-6">
                  <div className="text-center">
                    <h4 className="text-lg font-bold text-white mb-1">{t('auth.pinRecoveryTitle')}</h4>
                    <p className="text-xs text-slate-400">{t('auth.pinRecoverySubtitle')}</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 block">{t('auth.pinRecoveryKeyLabel')}</label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                        <input
                          type="text"
                          value={recoveryInput}
                          onChange={(e) => setRecoveryInput(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors font-mono text-xs"
                          placeholder={t('auth.pinRecoveryKeyPlaceholder')}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 block text-center">{t('auth.pinNewPlaceholder')}</label>
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
                      {t('auth.pinCancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing || !recoveryInput || pin.length !== 6}
                      className="flex-1 py-3 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-500 disabled:opacity-50 transition-all"
                    >
                      {isProcessing ? t('auth.pinResetting') : t('auth.pinReset')}
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
                    <h4 className="text-lg font-bold text-white mb-1">{t('auth.pinSetSuccess')}</h4>
                    <p className="text-xs text-slate-400">{t('auth.pinRecoveryWarning')}</p>
                  </div>

                  <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 text-center">
                    <div className="bg-black/40 rounded-lg p-3 font-mono text-emerald-500 break-all text-xs mb-3">
                      {recoveryKey}
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(recoveryKey)}
                      className="text-emerald-500/60 hover:text-emerald-500 transition-colors text-[10px] uppercase tracking-widest font-bold"
                    >
                      {t('auth.pinCopyKey')}
                    </button>
                  </div>

                  <button
                    onClick={() => setMode('idle')}
                    className="w-full py-3 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-500 transition-all"
                  >
                    {t('auth.pinDone')}
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
