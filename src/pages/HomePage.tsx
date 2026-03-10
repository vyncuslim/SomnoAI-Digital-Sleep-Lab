import React from 'react';
import SleepRecommendation from '../components/SleepRecommendation';

const HomePage: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">SomnoAI Digital Sleep Lab</h1>
      <p className="text-xl text-gray-400">NEURAL_TELEMETRY_V4.2</p>
      <div className="mt-8">
        <h2 className="text-2xl">Join SomnoAI Digital Sleep Lab Early Access — Limited Beta Access</h2>
        <p className="mt-4">Our mission is to decode human sleep through neural interfaces and advanced AI telemetry at the SomnoAI Digital Sleep Lab.</p>
      </div>
      <div className="mt-8">
        <SleepRecommendation />
      </div>
      <div className="mt-8">
        <h3 className="text-xl">Facility Location</h3>
        <p>SomnoAI Digital Sleep Lab Inc.</p>
        <p>100 Innovation Drive, Suite 400</p>
        <p>San Francisco, CA 94105</p>
      </div>
    </div>
  );
};

export default HomePage;
