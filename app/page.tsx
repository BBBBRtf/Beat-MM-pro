'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { defaultLocale } from './i18n/settings'; // Assuming settings.ts exports defaultLocale

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/${defaultLocale}`);
  }, [router]);

  return null; // Or a loading spinner, but for a quick redirect, null is fine.
}
