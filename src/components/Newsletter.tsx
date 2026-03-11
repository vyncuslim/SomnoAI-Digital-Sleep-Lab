import React, { useState } from 'react';

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubscribe = async () => {
    if (!email) return;
    setStatus('loading');
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className="py-12 px-8 text-center bg-[#0a0d14] rounded-2xl border border-white/10 mx-8">
      <h2 className="text-4xl font-bold mb-4">STAY UPDATED</h2>
      <p className="text-gray-400 mb-8">Join our newsletter for the latest sleep science and AI updates.</p>
      <div className="flex justify-center gap-4">
        <input 
          type="email" 
          placeholder="Enter your email" 
          className="bg-gray-800 px-4 py-2 rounded-full w-64" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button 
          className="bg-white text-black px-8 py-2 rounded-full font-bold"
          onClick={handleSubscribe}
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'SUBSCRIBING...' : 'SUBSCRIBE'}
        </button>
      </div>
      {status === 'success' && <p className="text-green-500 mt-4">Successfully subscribed!</p>}
      {status === 'error' && <p className="text-red-500 mt-4">Subscription failed. Please try again.</p>}
    </div>
  );
};

export default Newsletter;
