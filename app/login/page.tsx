'use client';

import React from 'react';
import { Auth } from '../../Auth.tsx';

/**
 * Subject Entry Node
 * Primary gateway for standard biometric telemetry access.
 */
export default function UserLoginPage() {
  const handleSuccess = () => {
    window.location.hash = '/';
  };

  const handleSandbox = () => {
    window.location.hash = '/?sandbox=true';
  };

  return (
    <div className="min-h-screen bg-[#020617]">
      <Auth 
        lang="zh" 
        onLogin={handleSuccess} 
        onGuest={handleSandbox} 
      />
    </div>
  );
}