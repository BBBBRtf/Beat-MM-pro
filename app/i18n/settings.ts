// Based on next-i18next examples for App Router
// This file might not be strictly necessary if all config is in next-i18next.config.js
// but can be useful for sharing defaultNS or other options.

export const fallbackLng = 'en'; // This could be your defaultLocale if you prefer
export const defaultLocale = 'zh'; // Explicitly define and export defaultLocale
export const languages = ['en', 'zh', 'my'];
export const defaultNS = 'common'; // Default namespace if not specified in useTranslation
export const cookieName = 'i18next';

export function getOptions(lng = defaultLocale, ns = defaultNS) { // Changed fallbackLng to defaultLocale here for consistency
  return {
    // debug: process.env.NODE_ENV === 'development', // Enable for client-side debug logs
    supportedLngs: languages,
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns,
  };
}
