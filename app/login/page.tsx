
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
  mode?: 'login' | 'join' 
}) {
  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center">
      <Auth 
        lang={lang} 
        onLogin={onSuccess} 
        onGuest={onSandbox}
        initialTab={mode}
      />
    </div>
  );
}
