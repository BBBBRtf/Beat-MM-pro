/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Standard Next.js option, good to have
  i18n: {
    locales: ['en', 'zh', 'my'],
    defaultLocale: 'en',
  },
};

module.exports = nextConfig;
