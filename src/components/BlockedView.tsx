import React from 'react';
import { ShieldAlert, Mail, ExternalLink } from 'lucide-react';
import { useLanguage } from '../context/useLanguage';

interface BlockedViewProps {
  reason?: string;
}

export const BlockedView: React.FC<BlockedViewProps> = ({ reason }) => {
  const { lang } = useLanguage();
  const isZh = lang === 'zh';

  return (
    <div className="min-h-screen bg-[#01040a] flex flex-col items-center justify-center text-white p-8 text-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-rose-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-lg w-full">
        <div className="w-24 h-24 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-8 border border-rose-500/20 animate-pulse shadow-[0_0_30px_rgba(244,63,94,0.2)]">
          <ShieldAlert size={48} />
        </div>
        
        <h1 className="text-4xl font-black italic mb-4 uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">
          {isZh ? "账户受限" : "Account Restricted"}
        </h1>
        
        <p className="text-slate-400 text-lg mb-8 leading-relaxed">
          {isZh 
            ? "为了保护您的账户安全，我们检测到异常活动并暂时限制了访问。" 
            : "For your security, we detected unusual activity and have temporarily restricted access to this account."}
        </p>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 w-full mb-8 backdrop-blur-md shadow-xl">
          <div className="flex items-center gap-3 text-sm text-slate-300 mb-4">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span className="font-mono uppercase tracking-wider text-xs text-slate-500 font-bold">
              {isZh ? "状态代码" : "Status Code"}
            </span>
            <span className="font-mono text-rose-400 ml-auto bg-rose-500/10 px-2 py-1 rounded text-xs border border-rose-500/20">ACCESS_DENIED_0x92</span>
          </div>
          
          {reason && (
            <div className="mb-4 text-left bg-black/20 p-3 rounded-lg border border-white/5">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 block mb-1">
                {isZh ? "原因" : "Reason"}
              </span>
              <p className="text-sm text-slate-300 font-mono">{reason}</p>
            </div>
          )}

          <div className="h-px bg-slate-800 my-3" />
          <p className="text-xs text-slate-500 flex justify-between items-center">
            <span>{isZh ? "参考 ID" : "Reference ID"}</span>
            <span className="font-mono text-slate-400">{Math.random().toString(36).substring(7).toUpperCase()}</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <a 
            href="mailto:support@digitalsleeplab.com" 
            className="flex-1 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 group"
          >
            <Mail size={18} className="group-hover:scale-110 transition-transform" />
            {isZh ? "联系支持团队" : "Contact Support"}
          </a>
          <a 
            href="/help" 
            className="flex-1 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
          >
            <ExternalLink size={18} />
            {isZh ? "帮助中心" : "Help Center"}
          </a>
        </div>
      </div>
    </div>
  );
};
