import React, { useState } from 'react';

const EmailSubscription: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to subscribe');
      }

      setStatus('success');
      setMessage('Thank you for subscribing!');
      setEmail('');
    } catch (error) {
      setStatus('error');
      setMessage('Failed to subscribe. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-md bg-[#151619] p-6 rounded-2xl border border-white/10 shadow-2xl font-mono mt-8">
      <h2 className="text-xl font-black italic uppercase tracking-widest text-white mb-2">Stay Updated</h2>
      <p className="text-sm text-slate-400 mb-6">Join our newsletter for the latest sleep science and AI updates.</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          className="w-full p-4 bg-black/50 text-white rounded-lg border border-white/5 focus:border-indigo-500/50 focus:outline-none text-sm"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
        <button
          type="submit"
          className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-all duration-200 uppercase text-xs tracking-widest"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>
      {message && (
        <p className={`mt-4 text-sm ${status === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default EmailSubscription;
