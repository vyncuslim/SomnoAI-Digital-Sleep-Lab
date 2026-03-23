import React from 'react';
import { useAuth } from '../context/AuthContext';

const Watermark: React.FC = () => {
  const { profile } = useAuth();
  const [sessionId] = React.useState(() => Math.random().toString(36).substring(2, 10).toUpperCase());
  
  if (!profile) return null;

  const isOwner = profile.email === 'ongyuze1401@gmail.com';
  const opacity = isOwner ? 'opacity-[0.01]' : 'opacity-[0.04]';

  // 包含 Email, User ID, Session ID 和日期
  const watermarkText = `SDSL-CONFIDENTIAL | ${profile.email} | ID:${profile.id?.substring(0, 8)} | SESS:${sessionId} | ${new Date().toLocaleDateString()}`;

  return (
    <div className={`fixed inset-0 z-[9999] pointer-events-none overflow-hidden ${opacity} select-none`}>
      <style>
        {`
          @keyframes drift {
            0% { transform: translate(0, 0) rotate(-25deg) scale(1.5); }
            50% { transform: translate(-20px, 20px) rotate(-23deg) scale(1.5); }
            100% { transform: translate(0, 0) rotate(-25deg) scale(1.5); }
          }
          .animate-drift {
            animation: drift 15s ease-in-out infinite;
          }
        `}
      </style>
      <div className="absolute inset-0 flex flex-wrap justify-around items-around gap-x-32 gap-y-24 p-10 animate-drift">
        {Array.from({ length: 60 }).map((_, i) => (
          <div key={i} className="text-[9px] font-mono font-black tracking-[0.2em] whitespace-nowrap text-white uppercase opacity-40">
            {watermarkText}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Watermark;
