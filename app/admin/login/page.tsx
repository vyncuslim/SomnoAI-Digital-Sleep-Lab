'use client';

import React from 'react';
import { Auth } from '../../../Auth.tsx';

/**
 * Admin Login Terminal
 * Secure entrance for laboratory staff with secondary role verification handled in the main dashboard.
 */
export default function AdminLoginPage() {
  const handleSuccess = () => {
    window.location.hash = '/admin';
  };

  const handleGuest = () => {
    window.location.hash = '/';
  };

  return (
    <div className="min-h-screen bg-[#020617]">
      <Auth 
        lang="zh" 
        onLogin={handleSuccess} 
        onGuest={handleGuest} 
      />
    </div>
  );
}