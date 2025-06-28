'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from '@/app/i18n/client';
import { Container } from 'react-bootstrap';

export default function HomePage() {
  const params = useParams();
  const locale = params.locale as string;
  const { t } = useTranslation('login');

  return (
    <Container fluid className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-cyan-400 mb-4">
          {t('home_pageTitle', 'Welcome to BeatMM Pro')}
        </h1>
        <p className="text-lg text-gray-300">
          This is the main homepage for locale: {locale}
        </p>
      </div>
    </Container>
  );
}
