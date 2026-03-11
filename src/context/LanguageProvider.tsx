import React, { ReactNode } from 'react';
import { Language, getTranslation } from '../services/i18n';
import { LanguageContext } from './LanguageContext';

export const LanguageProvider: React.FC<{ lang: Language; setLang: (lang: Language) => void; children: ReactNode }> = ({ lang, setLang, children }) => {
  const langPrefix = lang === 'zh' ? '/cn' : '/en';
  const t = (section: string) => getTranslation(lang, section);
  
  return (
    <LanguageContext.Provider value={{ lang, langPrefix, t, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
};
