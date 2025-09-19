
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // This will be managed by LocalizationContext
      // Just a placeholder to prevent errors
      placeholder: 'English'
    }
  },
  id: {
    translation: {
      // This will be managed by LocalizationContext
      // Just a placeholder to prevent errors
      placeholder: 'Indonesian'
    }
  }
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'id', // Default to Indonesian
    lng: 'id', // Set default language to Indonesian
    
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    }
  });

export default i18n;
