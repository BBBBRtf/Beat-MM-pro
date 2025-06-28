import '@/app/globals.css';
import { ReactNode } from 'react';

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
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
