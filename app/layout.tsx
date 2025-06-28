import '@/app/globals.css';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS here as well for consistency
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
