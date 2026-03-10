import React from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Hero = () => {
  return (
    <section className="bg-[#050505] text-white py-24 px-6 text-center">
      <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6">
        <span className="text-white">SOMNOAI</span><br />
        <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">SLEEP LAB</span>
      </h1>
      <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
        Integrating physiological monitoring, AI deep insights, and health recommendations to provide users with a comprehensive digital sleep laboratory experience.
      </p>
      <div className="flex gap-4 justify-center">
        <Link to="/signup" className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold hover:bg-blue-700 transition-colors">START ANALYSIS</Link>
        <button onClick={() => toast('More information coming soon!')} className="bg-white/10 text-white px-8 py-4 rounded-full font-bold hover:bg-white/20 transition-colors">LEARN MORE</button>
      </div>
    </section>
  );
};

export default Hero;
