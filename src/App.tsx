import React from 'react';
import HomePage from './pages/HomePage';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 border-b border-white/10">
        <h1 className="text-2xl font-bold">SomnoAI Digital Sleep Lab</h1>
        <p className="text-sm text-gray-400">NEURAL_TELEMETRY_V4.2</p>
      </header>
      <main className="flex-grow">
        <HomePage />
      </main>
      <footer className="p-4 border-t border-white/10 text-xs text-gray-500">
        <p>© 2026 SOMNOAI DIGITAL SLEEP LAB. ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
  );
};

export default App;
