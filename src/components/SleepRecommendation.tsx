import React, { useState } from 'react';
import { getSleepRecommendation } from '../services/geminiService';

const SleepRecommendation: React.FC = () => {
  const [userData, setUserData] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGetRecommendation = async () => {
    setLoading(true);
    try {
      const rec = await getSleepRecommendation(userData);
      setRecommendation(rec);
    } catch (error) {
      setRecommendation('Error generating recommendation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border border-white/10 rounded-xl">
      <h2 className="text-xl font-bold">Personalized Sleep Recommendation</h2>
      <textarea
        className="w-full mt-2 p-2 bg-gray-900 text-white rounded"
        value={userData}
        onChange={(e) => setUserData(e.target.value)}
        placeholder="Enter your sleep data (e.g., hours slept, quality, bedtime)..."
      />
      <button
        className="mt-2 px-4 py-2 bg-white text-black rounded font-bold"
        onClick={handleGetRecommendation}
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Get Recommendation'}
      </button>
      {recommendation && (
        <div className="mt-4 p-4 bg-gray-900 rounded">
          <p>{recommendation}</p>
        </div>
      )}
    </div>
  );
};

export default SleepRecommendation;
