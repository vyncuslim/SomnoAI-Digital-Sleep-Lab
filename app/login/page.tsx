
import React from 'react';
import { Auth } from '../../components/Auth.tsx';
import { Language } from '../../services/i18n.ts';

/**
 * Access terminal for standard laboratory subjects.
 */
export default function UserLoginPage({ 
  onSuccess, 
  onSandbox, 
  lang = 'en',
  mode = 'login' 
}: { 
  onSuccess: () => void, 
  onSandbox: () => void, 
  lang?: Language,
  // Fix: Added 'otp' to the allowed mode types to match Auth component requirements
  mode?: 'login' | 'join' | 'otp'
}) {
  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center">
      <Auth 
        lang={lang} 
        onLogin={() => {
            // 物理路径清洗：在通知上层 onSuccess 之前，
            // 强制将 sleepsomno.com/login 改为 sleepsomno.com/#dashboard
            window.history.replaceState(null, '', '/#dashboard');
            onSuccess();
        }} 
        onGuest={onSandbox}
        initialTab={mode}
      />
    </div>
  );
}
