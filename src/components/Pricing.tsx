import React from 'react';
import { Link } from 'react-router-dom';

const Pricing: React.FC = () => {
  const plans = [
    { name: 'GO', price: '$0', desc: 'Free access to core sleep analysis features.', features: ['Basic Sleep Tracking', '7-Day History'] },
    { name: 'PRO', price: '$9.99', desc: 'In-depth insights, long-term trend analysis, and personalized recommendations.', features: ['AI Sleep Analysis Reports', 'Neural Insights'] },
    { name: 'PLUS', price: 'Custom', desc: 'Advanced features and API access for health organizations.', features: ['Custom Neural Models', 'Priority Support', 'Real-time Telemetry API'] },
  ];
  return (
    <div className="py-12 px-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold">PRICING PLANS</h2>
        <p className="text-gray-400 mt-4">Choose the plan that fits your needs.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map(plan => (
          <div key={plan.name} className="bg-[#0a0d14] p-8 rounded-2xl border border-white/10 flex flex-col hover:border-blue-500/50 transition-colors">
            <div className="text-xs text-gray-400 mb-4">{plan.name}</div>
            <div className="text-4xl font-bold mb-4">{plan.price}</div>
            <p className="text-gray-400 mb-8 flex-grow">{plan.desc}</p>
            <ul className="space-y-2 text-sm mb-8">
              {plan.features.map(f => <li key={f}>✓ {f}</li>)}
            </ul>
            <Link 
              to="/signup"
              className="bg-white text-black px-4 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors text-center"
            >
              SELECT {plan.name}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pricing;
