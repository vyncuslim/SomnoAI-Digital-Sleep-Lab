import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { GlassCard } from './components/GlassCard';

const Home = () => (
  <div className="min-h-screen bg-[#01040a] text-white p-8 flex flex-col items-center justify-center">
    <h1 className="text-5xl font-bold mb-8">SomnoAI Digital Sleep Lab</h1>
    <p className="text-xl text-slate-400 mb-12">AI-Powered Sleep Restoration</p>
    <div className="flex gap-4">
      <Link to="/login" className="px-6 py-3 bg-indigo-600 rounded-full hover:bg-indigo-700 transition">Login</Link>
      <Link to="/signup" className="px-6 py-3 bg-white/10 rounded-full hover:bg-white/20 transition">Sign Up</Link>
      <Link to="/dashboard" className="px-6 py-3 bg-emerald-600/20 text-emerald-400 rounded-full hover:bg-emerald-600/30 transition">Dashboard</Link>
    </div>
  </div>
);

const Login = () => (
  <div className="min-h-screen bg-[#01040a] text-white p-8 flex items-center justify-center">
    <GlassCard className="p-8 rounded-2xl w-full max-w-md">
      <h2 className="text-3xl font-bold mb-6 text-center">Login</h2>
      <form className="space-y-4">
        <input type="email" placeholder="Email" className="w-full p-3 bg-white/5 rounded-lg border border-white/10 focus:border-indigo-500 outline-none" />
        <input type="password" placeholder="Password" className="w-full p-3 bg-white/5 rounded-lg border border-white/10 focus:border-indigo-500 outline-none" />
        <button type="submit" className="w-full py-3 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition font-bold">Sign In</button>
      </form>
      <p className="mt-4 text-center text-slate-400 text-sm">
        Don't have an account? <Link to="/signup" className="text-indigo-400 hover:text-indigo-300">Sign up</Link>
      </p>
    </GlassCard>
  </div>
);

const Signup = () => (
  <div className="min-h-screen bg-[#01040a] text-white p-8 flex items-center justify-center">
    <GlassCard className="p-8 rounded-2xl w-full max-w-md">
      <h2 className="text-3xl font-bold mb-6 text-center">Sign Up</h2>
      <form className="space-y-4">
        <input type="text" placeholder="Full Name" className="w-full p-3 bg-white/5 rounded-lg border border-white/10 focus:border-indigo-500 outline-none" />
        <input type="email" placeholder="Email" className="w-full p-3 bg-white/5 rounded-lg border border-white/10 focus:border-indigo-500 outline-none" />
        <input type="password" placeholder="Password" className="w-full p-3 bg-white/5 rounded-lg border border-white/10 focus:border-indigo-500 outline-none" />
        <button type="submit" className="w-full py-3 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition font-bold">Create Account</button>
      </form>
      <p className="mt-4 text-center text-slate-400 text-sm">
        Already have an account? <Link to="/login" className="text-indigo-400 hover:text-indigo-300">Login</Link>
      </p>
    </GlassCard>
  </div>
);

const Dashboard = () => (
  <div className="min-h-screen bg-[#01040a] text-white p-8">
    <header className="flex justify-between items-center mb-12">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="flex gap-4">
        <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">🔔</button>
        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">JD</div>
      </div>
    </header>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <GlassCard className="p-6 rounded-2xl h-48 flex flex-col justify-between">
        <h3 className="text-slate-400 uppercase text-xs font-bold tracking-widest">Sleep Score</h3>
        <p className="text-6xl font-bold text-indigo-400">85</p>
        <p className="text-emerald-400 text-sm">↑ 5% from last week</p>
      </GlassCard>
      <GlassCard className="p-6 rounded-2xl h-48 flex flex-col justify-between">
        <h3 className="text-slate-400 uppercase text-xs font-bold tracking-widest">Deep Sleep</h3>
        <p className="text-6xl font-bold text-white">1h 45m</p>
        <p className="text-slate-400 text-sm">Optimal range</p>
      </GlassCard>
      <GlassCard className="p-6 rounded-2xl h-48 flex flex-col justify-between">
        <h3 className="text-slate-400 uppercase text-xs font-bold tracking-widest">Heart Rate Dip</h3>
        <p className="text-6xl font-bold text-white">12%</p>
        <p className="text-slate-400 text-sm">Good recovery</p>
      </GlassCard>
    </div>
  </div>
);

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/index.html" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login.html" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signup.html" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard.html" element={<Dashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
