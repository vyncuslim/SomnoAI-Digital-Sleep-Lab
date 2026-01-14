
'use client';

import React from 'react';
import { Auth } from '../../Auth.tsx';

interface UserLoginPageProps {
  onSuccess?: () => void;
  onSandbox?: () => void;
}

/**
 * Subject Entry Terminal - Primary Authorization Node
 */
export default function UserLoginPage({ onSuccess, onSandbox }: UserLoginPageProps) {
  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    } else {
      window.location.hash = '/';
    }
  };

  const handleSandbox = () => {
    if (onSandbox) {
      onSandbox();
    } else {
      window.location.hash = '/?sandbox=true';
    }
  };

  return (
    <Auth 
      lang="zh" 
      onLogin={handleSuccess} 
      onGuest={handleSandbox} 
    />
  );
}
