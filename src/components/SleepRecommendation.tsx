import React, { useState } from 'react';
import { getSleepRecommendation } from '../services/geminiService';
import { useAuth } from '../context/AuthContext';

const SleepRecommendation: React.FC = () => {
  const { profile } = useAuth();
  const [userData, setUserData] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [loading, setLoading] = useState(false);
  const [dailyCount, setDailyCount] = useState(0);

  const DAILY_LIMIT = (profile?.id === '8f424e4f-e53d-447f-ba5f-98428fe0a34e' || profile?.subscription_plan === 'unlimited') ? Infinity : 4;

  const handleGetRecommendation = async () => {
    if (dailyCount >= DAILY_LIMIT) {
      setRecommendation('Daily limit reached. Please upgrade to unlimited to continue.');
      return;
    }

    setLoading(true);
    try {
      const rec = await getSleepRecommendation(userData);
      setRecommendation(rec);
      setDailyCount(prev => prev + 1);
    } catch (error) {
      setRecommendation('Error generating recommendation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#151619] p-6 rounded-2xl border border-white/10 shadow-2xl font-mono">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs uppercase tracking-widest text-[#8E9299]">Neural Telemetry Input</h2>
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
      </div>
      
      <textarea
        className="w-full h-32 p-4 bg-black/50 text-white rounded-lg border border-white/5 focus:border-emerald-500/50 focus:outline-none resize-none text-sm"
        value={userData}
        onChange={(e) => setUserData(e.target.value)}
        placeholder="Input sleep telemetry data..."
      />
      
      <button
        className="w-full mt-4 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-black font-bold rounded-lg transition-all duration-200 uppercase text-xs tracking-widest"
        onClick={handleGetRecommendation}
        disabled={loading}
      >
        {loading ? 'Analyzing...' : 'Execute Analysis'}
      </button>

      {recommendation && (
        <div className="mt-6 p-4 bg-black/50 rounded-lg border border-white/5">
          <h3 className="text-xs uppercase tracking-widest text-[#8E9299] mb-2">Telemetry Output</h3>
          <p className="text-sm text-emerald-400 leading-relaxed">{recommendation}</p>
        </div>
      )}
    </div>
  );
};

export default SleepRecommendation;
