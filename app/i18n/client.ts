'use client'; // This file is for client-side specific i18n setup

import i18next from 'i18next';
import { initReactI18next, useTranslation as useTranslationOrg } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
// import LanguageDetector from 'i18next-browser-languagedetector'; // Optional
import { getOptions, languages } from '@/app/i18n/settings'; // Using path alias
import { useParams } from 'next/navigation'; // To get locale from URL

const runsOnServerSide = typeof window === 'undefined';

// Initialize i18next for client-side
i18next
  // .use(LanguageDetector) // Optional: to detect language from browser settings, local storage, etc.
  .use(initReactI18next)
  .use(resourcesToBackend((language: string, namespace: string) =>
    import(`../../public/locales/${language}/${namespace}.json`)
  ))
  .init({
    ...getOptions(), // Spread default options
    lng: undefined, // Let detector work or load from URL, will be set in useTranslationEffect
    detection: { // Optional, if using LanguageDetector
      order: ['path', 'htmlTag', 'cookie', 'navigator'],
      caches: ['cookie'],
    },
    preload: runsOnServerSide ? languages : [], // Preload languages on server, not on client
    // debug: process.env.NODE_ENV === 'development', // Enable for verbose logs
  });

// Custom hook to manage language state based on URL or detected language
export function useTranslation(ns?: string | string[], options?: any) {
  const params = useParams();
  const lng = params.locale as string || i18next.language;

  if (i18next.resolvedLanguage !== lng && !runsOnServerSide) {
    i18next.changeLanguage(lng);
  }

  return useTranslationOrg(ns, { ...options, lng });
}

// Export the i18next instance if needed elsewhere
export default i18next;
