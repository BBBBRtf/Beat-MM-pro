import 'server-only';
import type { Locale } from '@/i18n-config';

const dictionaries = {
  en: () => import('@/../public/locales/en/common.json').then((module) => module.default),
  zh: () => import('@/../public/locales/zh/common.json').then((module) => module.default),
  my: () => import('@/../public/locales/my/common.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
  const loadDictionary = dictionaries[locale] || dictionaries.en;
  try {
    return await loadDictionary();
  } catch (error) {
    console.warn(`Could not load dictionary for locale: ${locale}, falling back to 'en'.`, error);
    return await dictionaries.en();
  }
};
