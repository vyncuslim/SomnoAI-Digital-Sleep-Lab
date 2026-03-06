import React, { ReactNode } from 'react';
import { Language } from '../services/i18n';
import { LanguageContext } from './LanguageContext';

export const LanguageProvider: React.FC<{ lang: Language; children: ReactNode }> = ({ lang, children }) => {
  const langPrefix = lang === 'zh' ? '/cn' : '/en';
  return (
    <LanguageContext.Provider value={{ lang, langPrefix }}>
      {children}
    </LanguageContext.Provider>
  );
};
