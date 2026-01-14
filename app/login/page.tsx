
'use client';

import React from 'react';
import { Auth } from '../../Auth.tsx';

interface UserLoginPageProps {
  onSuccess?: () => void;
  onSandbox?: () => void;
}

/**
 * 核心登录路由页面。
 */
export default function UserLoginPage({ onSuccess, onSandbox }: UserLoginPageProps) {
  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    } else {
      window.location.href = '/';
    }
  };

  const handleSandbox = () => {
    if (onSandbox) {
      onSandbox();
    } else {
      window.location.href = '/?sandbox=true';
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
