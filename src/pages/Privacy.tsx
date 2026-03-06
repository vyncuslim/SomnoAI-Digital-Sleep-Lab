import React from 'react';

export const Privacy: React.FC = () => {
  return (
    <div className="container mx-auto max-w-4xl py-16 px-4 text-slate-300">
      <h1 className="text-4xl font-bold mb-8 text-white">Privacy Policy</h1>
      <p className="mb-4">Effective Date: January 4, 2026</p>
      
      <h2 className="text-2xl font-semibold mt-8 mb-4 text-indigo-400">1. Data Accessed</h2>
      <p>To provide personalized sleep analysis, after your explicit authorization, SomnoAI Digital Sleep Lab accesses the following types of health data via the Health Connect secure cloud bridge:</p>
      <ul className="list-disc pl-6 mb-4">
        <li>Sleep Segments: Used to identify your sleep duration, awakenings, and cycles of Deep, REM, and Light sleep.</li>
        <li>Heart Rate Data: Used to read minute-level heart rate during sleep and evaluate Resting Heart Rate (RHR) for recovery assessment.</li>
        <li>Body Metrics & Activity: Used to sync daily caloric expenditure and physical metrics to analyze the correlation between metabolism and sleep quality.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4 text-indigo-400">2. Data Usage</h2>
      <p>Your data is used exclusively for the following core functions; we do not collect or process this information for any other purposes:</p>
      <ul className="list-disc pl-6 mb-4">
        <li>Personalized Sleep Insights: Converting your Health Connect data into visual charts and sleep scores through built-in analysis algorithms.</li>
        <li>AI Deep Analysis: Your de-identified physiological metrics are sent to the Google Gemini AI model to generate tailored sleep improvement recommendations.</li>
        <li>Local Experience Optimization: Data is used to provide immediate historical trend comparisons within your browser to help you monitor health changes.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4 text-indigo-400">3. Data Storage & Security</h2>
      <p>We adopt a "Privacy by Design" principle when handling your health data:</p>
      <ul className="list-disc pl-6 mb-4">
        <li>No Server-Side Storage: Your personal physiological data is never uploaded to or stored on our backend servers. All data processing is completed on the client side.</li>
        <li>Transient Session Storage: Data is saved only in your browser's sessionStorage. Once you close the browser tab or log out, all synchronized data is completely purged from your device.</li>
      </ul>
    </div>
  );
};
