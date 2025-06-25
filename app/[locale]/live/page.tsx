'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from '../../../i18n/client'; // Adjusted path
import { Container } from 'react-bootstrap';

export default function LivePage() {
  const params = useParams();
  const locale = params.locale as string;
  const { t } = useTranslation('login'); // Assuming 'live_pageTitle' will be in 'login.json'

  return (
    <Container fluid className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-cyan-400 mb-4">
          {t('live_pageTitle', 'Live Streams')} {/* Fallback text added */}
        </h1>
        <p className="text-lg text-gray-300">
          Live streaming page content for locale: {locale}
        </p>
        {/* Content for the live page will go here */}
      </div>
    </Container>
  );
}
