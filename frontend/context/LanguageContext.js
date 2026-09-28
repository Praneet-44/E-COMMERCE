import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { locales, LANGUAGES } from '../locales';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const router = useRouter();
  const { locale, defaultLocale, asPath, pathname, query } = router;
  
  // Current active locale code ('en', 'hi', 'ta')
  const currentLocale = locale || defaultLocale || 'en';
  
  const [activeLanguage, setActiveLanguage] = useState(currentLocale);

  useEffect(() => {
    if (locale && locale !== activeLanguage) {
      setActiveLanguage(locale);
    }
  }, [locale]);

  // Helper function to navigate to new locale route sub-path
  const changeLanguage = (newLocale) => {
    if (newLocale === activeLanguage) return;
    
    // Use Next.js built-in locale routing
    router.push({ pathname, query }, asPath, { locale: newLocale });
  };

  /**
   * Helper function to get translation string by key path (e.g. 'nav.collections')
   * @param {string} pathKey - dot separated key path
   * @param {string} fallback - fallback string if key is not found
   */
  const t = (pathKey, fallback = '') => {
    if (!pathKey) return fallback;
    
    const keys = pathKey.split('.');
    
    // Try target language dictionary first
    let result = locales[activeLanguage];
    for (const k of keys) {
      if (result && result[k] !== undefined) {
        result = result[k];
      } else {
        result = null;
        break;
      }
    }
    
    if (result !== null && typeof result === 'string') {
      return result;
    }

    // Fallback to English dictionary
    result = locales['en'];
    for (const k of keys) {
      if (result && result[k] !== undefined) {
        result = result[k];
      } else {
        result = null;
        break;
      }
    }

    if (result !== null && typeof result === 'string') {
      return result;
    }

    return fallback || pathKey;
  };

  return (
    <LanguageContext.Provider value={{
      locale: activeLanguage,
      locales: Object.keys(locales),
      languages: LANGUAGES,
      changeLanguage,
      t,
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const useTranslation = () => useLanguage();

export default LanguageContext;
