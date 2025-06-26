'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from '../../i18n/client'; // Adjust path as necessary
import { Container } from 'react-bootstrap';
// You might want a language switcher here too, or handle it globally in layout.
// For simplicity, I'll omit it from these placeholder pages for now but it can be added.

export default function HomePage() {
  const params = useParams();
  const locale = params.locale as string;
  const { t } = useTranslation('login'); // Assuming 'home_pageTitle' will be in 'login.json'

  return (
    <Container fluid className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-cyan-400 mb-4">
          {t('home_pageTitle', 'Welcome to BeatMM Pro')} {/* Fallback text added */}
        </h1>
        <p className="text-lg text-gray-300">
          This is the main homepage for locale: {locale}
        </p>
        {/* Content for the homepage will go here */}
      </div>
    </Container>
  );
}
