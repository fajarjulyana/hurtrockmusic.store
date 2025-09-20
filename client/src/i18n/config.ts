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
      placeholder: 'English',
      hero: {
        title: "Rock Music for All Levels",
        subtitle: "START YOUR ROCK JOURNEY",
        description: "Discover entry-level and professional instruments, quality amplifiers, and music accessories that support your rock journey. From beginner guitars to high-quality professional equipment.",
        shopNow: "Shop Now",
        exploreCollection: "Explore Collection"
      },
    }
  },
  id: {
    translation: {
      // This will be managed by LocalizationContext
      // Just a placeholder to prevent errors
      placeholder: 'Indonesian',
      hero: {
        title: "Musik Rock untuk Semua Level",
        subtitle: "WUJUDKAN PERJALANAN ROCK ANDA",
        description: "Temukan alat musik entry level dan profesional, amplifier berkualitas, dan aksesoris musik yang mendukung perjalanan rock Anda. Dari gitar pemula hingga peralatan profesional berkualitas tinggi.",
        shopNow: "Belanja Sekarang",
        exploreCollection: "Jelajahi Koleksi"
      },
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