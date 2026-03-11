import React from 'react';

const Testimonials: React.FC = () => {
  const testimonials = [
    { quote: 'The depth of analysis is unlike anything I\'ve seen. It\'s not just tracking; it\'s expert coaching.', name: 'Dr. Sarah Chen', title: 'NEUROSCIENTIST' },
    { quote: 'Finally, a sleep app that tells me "why" I\'m tired, not just "that" I\'m tired.', name: 'Marcus Thome', title: 'ELITE ATHLETE' },
  ];
  return (
    <div className="py-12 px-8 grid grid-cols-2 gap-8">
      {testimonials.map(t => (
        <div key={t.name} className="bg-[#0a0d14] p-8 rounded-2xl border border-white/10">
          <p className="text-gray-400 mb-8">"{t.quote}"</p>
          <div className="font-bold">{t.name}</div>
          <div className="text-xs text-gray-500">{t.title}</div>
        </div>
      ))}
    </div>
  );
};

export default Testimonials;
