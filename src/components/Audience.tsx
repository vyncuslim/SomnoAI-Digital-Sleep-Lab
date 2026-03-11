import React from 'react';

const Audience: React.FC = () => {
  const audiences = [
    { title: 'ELITE ATHLETES', desc: 'Optimize training load, predict fatigue, and peak on race day.' },
    { title: 'KNOWLEDGE WORKERS', desc: 'Maximize deep sleep to improve daytime cognitive clarity and focus.' },
    { title: 'SLEEP IMPROVERS', desc: 'Identify hidden factors disrupting sleep and establish healthy routines.' },
  ];
  return (
    <div className="py-12 px-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold">WHO IS IT FOR?</h2>
        <p className="text-gray-400 mt-4">Whatever your goal, SomnoAI Digital Sleep Lab provides customized recovery strategies.</p>
      </div>
      <div className="grid grid-cols-3 gap-8">
        {audiences.map(a => (
          <div key={a.title} className="bg-[#0a0d14] p-8 rounded-2xl border border-white/10">
            <h3 className="text-2xl font-bold mb-4">{a.title}</h3>
            <p className="text-gray-400">{a.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Audience;
