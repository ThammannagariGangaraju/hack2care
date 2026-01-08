import { createContext, useContext, useState, ReactNode, useRef } from 'react';

/**
 * Global language state management using React Context.
 * Defaults to English ('en').
 */

type Language = string;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isAutoDetected: boolean;
  setIsAutoDetected: (val: boolean) => void;
  feedbackMessage: string | null;
  showFeedback: (msg: string, duration?: number) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isAutoDetected, setIsAutoDetected] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const lastLanguage = useRef<Language>('en');

  const setLanguage = (lang: Language) => {
    if (lang === lastLanguage.current) return;
    
    console.log(`[LanguageContext] Language switching: ${lastLanguage.current} -> ${lang}`);
    lastLanguage.current = lang;
    setLanguageState(lang);
  };

  const showFeedback = (msg: string, duration: number = 3000) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), duration);
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      isAutoDetected, 
      setIsAutoDetected,
      feedbackMessage,
      showFeedback
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
