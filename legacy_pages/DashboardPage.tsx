
import React from 'react';
import { Dashboard } from '../components/Dashboard.tsx';
import { SleepRecord } from '../types.ts';
import { Language } from '../services/i18n.ts';

/**
 * Subject Dashboard Terminal.
 * The primary visualization node for verified laboratory subjects.
 */
export default function DashboardPage({ 
  data, 
  lang = 'en', 
  onNavigate 
}: { 
  data: SleepRecord, 
  lang: Language, 
  onNavigate: (view: any) => void 
}) {
  return (
    <div className="w-full flex flex-col min-h-screen">
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 pt-10 pb-48">
        <Dashboard data={data} lang={lang} onNavigate={onNavigate} />
      </main>
    </div>
  );
}
