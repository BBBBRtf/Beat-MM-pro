/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    locales: ['zh', 'en', 'my'], // Ensure all your defined locales are here
    defaultLocale: 'zh',       // Set your default locale
    localeDetection: false,    // Prevents automatic locale detection for simpler routing
  },
};

module.exports = nextConfig;
