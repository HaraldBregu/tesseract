import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enTranslations from '../../../i18n/en/translations.json'
import itTranslations from '../../../i18n/it/translations.json'
import esTranslations from '../../../i18n/es/translations.json'
import frTranslations from '../../../i18n/fr/translations.json'
import deTranslations from '../../../i18n/de/translations.json'

const savedLocale: string | null = localStorage.getItem('locale')

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslations },
    it: { translation: itTranslations },
    es: { translation: esTranslations },
    fr: { translation: frTranslations },
    de: { translation: deTranslations }
  },
  lng: savedLocale || 'en', // Use saved language or default to 'en'
  fallbackLng: 'en', // Default language
  interpolation: {
    escapeValue: false // React already escapes values
  }
})
