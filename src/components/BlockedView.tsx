import React from 'react';
import { ShieldAlert, Mail } from 'lucide-react';
import { useLanguage } from '../context/useLanguage';

export const BlockedView: React.FC = () => {
  const { lang } = useLanguage();
  const isZh = lang === 'zh';

  return (
    <div className="min-h-screen bg-[#01040a] flex flex-col items-center justify-center text-white p-8 text-center">
      <div className="w-24 h-24 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-8 border border-rose-500/20 animate-pulse">
        <ShieldAlert size={48} />
      </div>
      
      <h1 className="text-3xl font-black italic mb-4 uppercase tracking-tighter">
        {isZh ? "账户受限" : "Account Restricted"}
      </h1>
      
      <p className="text-slate-400 max-w-md mb-8 leading-relaxed">
        {isZh 
          ? "为了保护您的账户安全，我们检测到异常活动并暂时限制了访问。请联系支持团队以恢复访问权限。" 
          : "For your security, we detected unusual activity and have temporarily restricted access to this account. Please contact support to restore access."}
      </p>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 max-w-sm w-full mb-8 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-sm text-slate-300 mb-2">
          <div className="w-2 h-2 rounded-full bg-rose-500" />
          <span className="font-mono uppercase tracking-wider text-xs text-slate-500">
            {isZh ? "状态代码" : "Status Code"}:
          </span>
          <span className="font-mono text-rose-400">ACCESS_DENIED_0x92</span>
        </div>
        <div className="h-px bg-slate-800 my-3" />
        <p className="text-xs text-slate-500">
          {isZh ? "参考 ID" : "Reference ID"}: {Math.random().toString(36).substring(7).toUpperCase()}
        </p>
      </div>

      <a 
        href="mailto:support@digitalsleeplab.com" 
        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
      >
        <Mail size={18} />
        {isZh ? "联系支持团队" : "Contact Support Team"}
      </a>
    </div>
  );
};
