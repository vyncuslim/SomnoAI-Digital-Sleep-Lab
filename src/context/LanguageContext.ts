import { createContext } from 'react';
import { Language } from '../services/i18n';

interface LanguageContextType {
  lang: Language;
  langPrefix: string;
  t: (section: string) => any;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
