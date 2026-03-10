import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Language } from '../types';

interface UserProfileViewProps {
  lang: Language;
  onBack: () => void;
  onNavigate: (path: string) => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({ lang, onBack, onNavigate }) => {
  const { profile } = useAuth();

  return (
    <div className="max-w-2xl mx-auto p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">{lang === 'zh' ? '用户资料' : 'User Profile'}</h1>
      <div className="bg-white/5 p-6 rounded-xl border border-white/10">
        <div className="mb-4">
          <label className="text-slate-400 text-sm">{lang === 'zh' ? '邮箱' : 'Email'}</label>
          <p className="text-lg">{profile?.email}</p>
        </div>
        <div className="mb-4">
          <label className="text-slate-400 text-sm">{lang === 'zh' ? '订阅计划' : 'Subscription Plan'}</label>
          <p className="text-lg font-bold text-indigo-400 uppercase">{profile?.subscription_plan || (lang === 'zh' ? '免费' : 'Free')}</p>
        </div>
        <button 
          onClick={() => onNavigate('subscription')}
          className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {lang === 'zh' ? '管理订阅' : 'Manage Subscription'}
        </button>
      </div>
    </div>
  );
};
