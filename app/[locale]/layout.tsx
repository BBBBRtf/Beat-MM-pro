import './globals.css'; // Assuming a global CSS file might exist or be created later

export const metadata = {
  title: 'BeatMM Pro',
  description: 'The ultimate DJ music and live streaming community in Myanmar.',
};

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <html lang={params.locale}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* PWA primary meta tags */}
        <meta name="application-name" content="BeatMM Pro" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="BeatMM Pro" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Theme Color */}
        <meta name="msapplication-TileColor" content="#0a0a0f" /> {/* Typically matches background_color or a complementary color */}
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#8b5cf6" />

        {/* Manifest Link */}
        <link rel="manifest" href="/manifest.json" />

        {/* Apple Touch Icons (using placeholder PNG paths) */}
        {/* You'll need to replace these with actual PNG files later or ensure your SVG-to-PNG conversion creates these paths */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512x512.png" />

        {/* Favicon links (optional but good practice) - using SVG for now, can be PNGs */}
        <link rel="icon" type="image/svg+xml" href="/icons/icon-192x192.svg" />
        {/* <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png"> */}
        {/* <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png"> */}

      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
