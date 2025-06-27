/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // i18n routing is handled by the app/[locale] directory structure
  // and middleware for locale detection if needed,
  // so this configuration might be redundant or conflict with App Router's i18n patterns.
  // Temporarily commenting out to see if it resolves build issues.
  // i18n: {
  //   locales: ['zh', 'en', 'my'],
  //   defaultLocale: 'zh',
  //   localeDetection: false,
  // },
};

module.exports = nextConfig;
