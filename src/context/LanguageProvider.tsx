import React, { ReactNode } from 'react';
import { Language, getTranslation } from '../services/i18n';
import { LanguageContext } from './LanguageContext';

export const LanguageProvider: React.FC<{ lang: Language; children: ReactNode }> = ({ lang, children }) => {
  const langPrefix = lang === 'zh' ? '/cn' : '/en';
  const t = (section: string) => getTranslation(lang, section);
  
  return (
    <LanguageContext.Provider value={{ lang, langPrefix, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
