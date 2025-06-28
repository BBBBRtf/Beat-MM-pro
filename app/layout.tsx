import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import 'bootstrap/dist/css/bootstrap.min.css'; // This line is crucial for Bootstrap CSS!

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BeatMM Pro',
  description: 'The ultimate DJ music and live streaming community in Myanmar.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
