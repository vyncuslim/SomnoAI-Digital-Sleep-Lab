
'use client';

import React from 'react';
import { Auth } from '../../Auth.tsx';

/**
 * 核心登录路由页面。
 * 如果出现 404，请确保此文件路径在项目的 app/ 目录下，且名为 login/page.tsx。
 */
export default function UserLoginPage() {
  const handleSuccess = () => {
    window.location.href = '/';
  };

  const handleSandbox = () => {
    window.location.href = '/?sandbox=true';
  };

  return (
    <Auth 
      lang="zh" 
      onLogin={handleSuccess} 
      onGuest={handleSandbox} 
    />
  );
}
