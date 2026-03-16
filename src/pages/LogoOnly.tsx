import React from 'react';
import { Logo } from '../components/Logo';

const LogoOnly: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#01040a]">
      <Logo className="scale-150" />
    </div>
  );
};

export default LogoOnly;
