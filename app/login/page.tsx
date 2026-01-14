import React from 'react';
import { Auth } from '../../Auth.tsx';

export default function UserLoginPage({ onSuccess, onSandbox }: { onSuccess: () => void, onSandbox: () => void }) {
  return (
    <div className="min-h-screen bg-[#020617] pt-10">
      <Auth 
        lang={navigator.language.startsWith('zh') ? 'zh' : 'en'} 
        onLogin={onSuccess} 
        onGuest={onSandbox} 
      />
    </div>
  );
}