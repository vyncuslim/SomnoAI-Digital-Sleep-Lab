import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

const Home = () => <div className="p-8"><h1>SomnoAI Digital Sleep Lab</h1></div>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/en" replace />} />
        <Route path="/en" element={<Home />} />
        <Route path="/cn" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
