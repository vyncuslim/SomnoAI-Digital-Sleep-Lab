import React from 'react';
import { Auth } from '../../Auth.tsx';

/**
 * Access terminal for standard laboratory subjects.
 */
export default function UserLoginPage({ onSuccess, onSandbox }: { onSuccess: () => void, onSandbox: () => void }) {
  const lang = navigator.language.startsWith('zh') ? 'zh' : 'en';
  
  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4">
      <Auth 
        lang={lang as any} 
        onLogin={onSuccess} 
        onGuest={onSandbox} 
      />
    </div>
  );
}