import '@/app/globals.css'; // Assuming global styles are relevant or can be empty
import { ReactNode } from 'react';

// Minimal metadata for the root layout, can be expanded if needed
export const metadata = {
  title: 'BeatMM Pro - Loading...',
  description: 'Redirecting to your preferred language.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // The lang attribute might be tricky here as we don't know the locale yet.
    // For a redirecting page, it might be less critical or could be omitted.
    // Or, we can set a default/fallback lang.
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
