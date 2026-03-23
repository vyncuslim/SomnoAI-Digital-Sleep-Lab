import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Logo } from './Logo';
import { supabase } from '../services/supabaseService';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    console.log('AuthCallback rendered, URL:', window.location.href);
    
    const checkSession = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      
      if (code) {
        try {
          await supabase.auth.exchangeCodeForSession(code);
        } catch (error) {
          console.error('Error exchanging code for session:', error);
        }
      }

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        if (window.opener) {
          window.close();
        } else {
          navigate('/dashboard', { replace: true });
        }
      }
    };
    checkSession();

    if (user) {
      if (window.opener) {
        window.close();
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutReached(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (timeoutReached && !loading && !user) {
      if (window.opener) {
        window.close();
      } else {
        navigate('/auth/login?error=unverified', { replace: true });
      }
    }
  }, [timeoutReached, loading, user, navigate]);

  return (
    <div className="min-h-screen bg-[#01040a] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <Logo className="mx-auto scale-150" />
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-4 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent rounded-full"
          ></motion.div>
        </div>
        <p className="text-slate-500 font-mono text-xs uppercase tracking-[0.3em] animate-pulse">
          Verifying Identity...
        </p>
      </motion.div>
    </div>
  );
};
