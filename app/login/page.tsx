import React from 'react';
import { Auth } from '../../Auth.tsx';
import { Language } from '../../services/i18n.ts';

/**
 * Access terminal for standard laboratory subjects.
 */
export default function UserLoginPage({ onSuccess, onSandbox, lang = 'en' }: { onSuccess: () => void, onSandbox: () => void, lang?: Language }) {
  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4">
      <Auth 
        lang={lang} 
        onLogin={onSuccess} 
        onGuest={onSandbox} 
      />
    </div>
  );
}