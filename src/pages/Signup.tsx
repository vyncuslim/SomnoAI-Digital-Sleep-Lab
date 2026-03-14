import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);

  const handleSignup = async () => {
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (!terms || !privacy) {
      toast.error('Please agree to the Terms and Privacy Policy');
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      // Record signup attempt
      await fetch('/api/audit/auth-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: !error,
          userId: data.user?.id ?? null,
          email: email,
          errorCode: error?.message ?? null,
          needsEmailConfirmation: !!data.user && !data.user.identities?.length
        }),
      });

      if (error) throw error;
      toast.success('Account creation successful!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to sign up');
    }
  };

  const handleSocialLogin = (provider: string) => {
    toast(`Continuing with ${provider}...`);
  };

  return (
    <div className="flex flex-col items-center justify-center py-24">
      <h2 className="text-4xl font-bold mb-8">JOIN THE LAB</h2>
      <div className="bg-[#0a0d14] p-8 rounded-2xl border border-white/10 w-96">
        <input 
          type="email" 
          placeholder="Email Address" 
          className="w-full bg-gray-800 px-4 py-2 rounded-full mb-4" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input 
          type="password" 
          placeholder="Password" 
          className="w-full bg-gray-800 px-4 py-2 rounded-full mb-4" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex items-center gap-2 mb-4 text-sm">
          <input 
            type="checkbox" 
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
          />
          <span>I agree to the Terms of Service.</span>
        </div>
        <div className="flex items-center gap-2 mb-8 text-sm">
          <input 
            type="checkbox" 
            checked={privacy}
            onChange={(e) => setPrivacy(e.target.checked)}
          />
          <span>I agree to the Privacy Policy.</span>
        </div>
        <button 
          onClick={handleSignup}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-full font-bold mb-8 hover:bg-blue-700 transition-colors"
        >
          CREATE ACCOUNT
        </button>
        <div className="text-center text-gray-400 mb-4">OR CONTINUE WITH</div>
        <div className="flex justify-center gap-4">
          <button 
            onClick={() => handleSocialLogin('GOOGLE')}
            className="bg-gray-800 px-4 py-2 rounded-full hover:bg-gray-700 transition-colors"
          >
            GOOGLE
          </button>
          <button 
            onClick={() => handleSocialLogin('OTP')}
            className="bg-gray-800 px-4 py-2 rounded-full hover:bg-gray-700 transition-colors"
          >
            OTP
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
