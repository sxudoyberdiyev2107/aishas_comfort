'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import uzTranslations from '../locales/uz.json';
import ruTranslations from '../locales/ru.json';

const LanguageContext = createContext();

const translationDicts = {
  uz: uzTranslations,
  ru: ruTranslations
};

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState('uz');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read preference on client mount
    const savedLang = localStorage.getItem('language');
    if (savedLang && (savedLang === 'uz' || savedLang === 'ru')) {
      setLanguageState(savedLang);
    }
    setMounted(true);
  }, []);

  const changeLanguage = (lang) => {
    if (lang === 'uz' || lang === 'ru') {
      setLanguageState(lang);
      localStorage.setItem('language', lang);
    }
  };

  const t = (key) => {
    const keys = key.split('.');
    let result = translationDicts[language];
    
    for (const k of keys) {
      if (result && result[k] !== undefined) {
        result = result[k];
      } else {
        return key; // Fallback to raw key string if translation missing
      }
    }
    
    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, mounted }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
