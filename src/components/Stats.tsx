import React from 'react';

const Stats: React.FC = () => {
  const stats = [
    { label: 'HOURS ANALYZED', value: '10M+', sub: 'ONLINE' },
    { label: 'SLEEP ACCURACY', value: '98.4%', sub: 'HIGH' },
    { label: 'ACTIVE USERS', value: '50K', sub: 'HIGH' },
    { label: 'DATA ENCRYPTED', value: '100', sub: 'HIGH' },
  ];
  return (
    <div className="grid grid-cols-4 gap-4 px-8 py-12">
      {stats.map(stat => (
        <div key={stat.label} className="bg-[#0a0d14] p-6 rounded-xl border border-white/10 flex justify-between items-center">
          <div>
            <div className="text-xs text-gray-400">{stat.label}</div>
            <div className="text-3xl font-bold mt-2">{stat.value}</div>
          </div>
          <div className="text-xs bg-gray-800 px-2 py-1 rounded">{stat.sub}</div>
        </div>
      ))}
    </div>
  );
};

export default Stats;
