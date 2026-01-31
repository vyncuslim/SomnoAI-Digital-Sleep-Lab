
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
        onLogin={() => {
            // 设置 Hash 以强制触发 SPA 视图切换，同时更新物理路径
            window.location.hash = '#/dashboard';
            window.history.replaceState(null, '', '/dashboard');
            onSuccess();
        }} 
        onGuest={onSandbox}
        initialTab={mode}
      />
    </div>
  );
}
