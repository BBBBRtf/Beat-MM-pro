/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    locales: ['zh', 'en', 'my'],
    defaultLocale: 'zh',
    localeDetection: false,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/zh', // Redirect root to defaultLocale
        permanent: false,   // Set to true if this is a permanent redirect
        locale: false,      // This redirect is not locale-specific itself
      },
    ];
  },
};

module.exports = nextConfig;
