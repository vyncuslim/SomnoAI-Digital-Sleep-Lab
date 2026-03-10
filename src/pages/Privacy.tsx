import React from 'react';
import { LegalPageTemplate } from '../components/ui/LegalPageTemplate';

export const Privacy: React.FC = () => {
  return (
    <LegalPageTemplate
      title="Privacy Policy"
      lastUpdated="January 4, 2026"
      breadcrumbs={[{ label: 'Legal', link: '/legal' }, { label: 'Privacy Policy' }]}
    >
      <h2 className="text-2xl font-black mt-12 mb-6 text-indigo-400 uppercase tracking-tight italic">1. Data Accessed</h2>
      <p className="mb-6">To provide personalized sleep analysis, after your explicit authorization, SomnoAI Digital Sleep Lab accesses the following types of health data via the Health Connect secure cloud bridge:</p>
      <ul className="list-disc pl-6 mb-8 space-y-3">
        <li><strong className="text-white">Sleep Segments:</strong> Used to identify your sleep duration, awakenings, and cycles of Deep, REM, and Light sleep.</li>
        <li><strong className="text-white">Heart Rate Data:</strong> Used to read minute-level heart rate during sleep and evaluate Resting Heart Rate (RHR) for recovery assessment.</li>
        <li><strong className="text-white">Body Metrics & Activity:</strong> Used to sync daily caloric expenditure and physical metrics to analyze the correlation between metabolism and sleep quality.</li>
      </ul>

      <h2 className="text-2xl font-black mt-12 mb-6 text-indigo-400 uppercase tracking-tight italic">2. Data Usage</h2>
      <p className="mb-6">Your data is used exclusively for the following core functions; we do not collect or process this information for any other purposes:</p>
      <ul className="list-disc pl-6 mb-8 space-y-3">
        <li><strong className="text-white">Personalized Sleep Insights:</strong> Converting your Health Connect data into visual charts and sleep scores through built-in analysis algorithms.</li>
        <li><strong className="text-white">AI Deep Analysis:</strong> Your de-identified physiological metrics are sent to the Google Gemini AI model to generate tailored sleep improvement recommendations.</li>
        <li><strong className="text-white">Local Experience Optimization:</strong> Data is used to provide immediate historical trend comparisons within your browser to help you monitor health changes.</li>
      </ul>

      <h2 className="text-2xl font-black mt-12 mb-6 text-indigo-400 uppercase tracking-tight italic">3. Data Storage & Security</h2>
      <p className="mb-6">We adopt a "Privacy by Design" principle when handling your health data:</p>
      <ul className="list-disc pl-6 mb-8 space-y-3">
        <li><strong className="text-white">No Server-Side Storage:</strong> Your personal physiological data is never uploaded to or stored on our backend servers. All data processing is completed on the client side.</li>
        <li><strong className="text-white">Transient Session Storage:</strong> Data is saved only in your browser's sessionStorage. Once you close the browser tab or log out, all synchronized data is completely purged from your device.</li>
      </ul>
    </LegalPageTemplate>
  );
};
