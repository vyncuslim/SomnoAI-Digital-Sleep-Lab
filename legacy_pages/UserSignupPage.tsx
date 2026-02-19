
import React from 'react';
import { Auth } from '../components/Auth.tsx';
import { Language } from '../services/i18n.ts';

/**
 * Access terminal for new laboratory subjects.
 * Initializes the registration protocol for new neural links.
 */
export default function UserSignupPage({ 
  onSuccess, 
  onSandbox, 
  lang = 'en'
}: { 
  onSuccess: () => void, 
  onSandbox: () => void, 
  lang?: Language
}) {
  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center">
      <Auth 
        lang={lang} 
        onLogin={() => {
            window.history.replaceState(null, '', '/dashboard');
            onSuccess();
        }} 
        onGuest={onSandbox}
        // Fixed: Changed 'join' to 'signup' to match Auth component's allowed initialTab values
        initialTab="signup"
      />
    </div>
  );
}
