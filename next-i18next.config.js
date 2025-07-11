const path = require('path');

/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: 'zh', // Aligned with next.config.js
    locales: ['zh', 'en', 'my'], // Aligned with next.config.js
  },
  localePath: path.resolve('./public/locales'),
  reloadOnPrerender: process.env.NODE_ENV === 'development', // Recommended for development
  // debug: process.env.NODE_ENV === 'development', // Uncomment to enable debug output
};
