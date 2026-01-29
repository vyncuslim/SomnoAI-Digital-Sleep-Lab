
import React from 'react';
import { AdminView } from '../../components/AdminView.tsx';

/**
 * FIXED: 移除 redundant get_profile_status 调用
 * 页面权限由 App.tsx 中的 <ProtectedRoute> 统一控制，防止重复的网络冲突和 AbortError。
 */
export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[#020617] p-4 md:p-12 animate-in fade-in duration-1000">
      <AdminView onBack={() => window.location.hash = '#/'} />
    </div>
  );
}
