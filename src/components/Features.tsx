import React from 'react';

const Features: React.FC = () => {
  return (
    <div className="grid grid-cols-2 gap-8 px-8 py-12">
      <div className="bg-[#0a0d14] p-8 rounded-2xl border border-white/10">
        <div className="text-xs text-gray-400 mb-4">PROTOCOL</div>
        <h3 className="text-4xl font-bold mb-4">RECOVERY OPTIMIZATION</h3>
        <p className="text-gray-400">Personalized protocols to enhance deep sleep and recovery.</p>
      </div>
      <div className="bg-[#0a0d14] p-8 rounded-2xl border border-white/10">
        <div className="text-xs text-gray-400 mb-4">SECURITY</div>
        <h3 className="text-4xl font-bold mb-4">SECURE ENCRYPTION</h3>
        <p className="text-gray-400">Your data is encrypted with AES-256 during transit and at rest.</p>
      </div>
    </div>
  );
};

export default Features;
