'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useTranslation } from '@/app/i18n/client'; // Using path alias
import { PhoneIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { createSupabaseBrowserClient } from '@/lib/supabase/client'; // Using path alias

const SUPER_ADMIN_PHONES = ['09787715620', '09424425049'];

// Animation Variants (ensure these are defined or imported)
const containerVariants = {
  hidden: { opacity: 0, scale: 0.90 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.15,
      duration: 0.3,
      ease: "circOut",
    },
  },
};

const itemVariants = {
  hidden: { y: 25, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.35,
      ease: "easeOut",
    },
  },
};

// This is the actual component that uses useSearchParams
const LoginContent: React.FC = () => {
  const params = useParams();
  const locale = params.locale as string;
  const { t, i18n } = useTranslation('login');
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createSupabaseBrowserClient();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setIsSuperAdmin(SUPER_ADMIN_PHONES.includes(phoneNumber));
  }, [phoneNumber]);

  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      setSuccessMessage(decodeURIComponent(message));
      const currentPath = window.location.pathname;
      window.history.replaceState({ ...window.history.state, as: currentPath, url: currentPath }, '', currentPath);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    if (!phoneNumber || !password) {
      setError(t('validation_allFieldsRequired'));
      setLoading(false);
      return;
    }

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        phone: phoneNumber,
        password: password,
      });

      if (signInError) {
        console.error('Supabase Sign In Error:', signInError);
        setError(t('login_invalidCredentials'));
      } else if (data.session) {
        console.log('Login successful, session:', data.session);
        router.push(`/${locale}/`);
      } else {
        setError(t('error_generic_supabase'));
      }
    } catch (catchError: any) {
      console.error('Catch Error During Sign In:', catchError);
      setError(catchError.message || t('error_generic_supabase'));
    } finally {
      setLoading(false);
    }
  };

  const changeLanguage = (lng: string) => {
    router.push(`/${lng}/login`);
  };

  const loginTitle = isSuperAdmin ? t('superAdminPageTitle') : t('login_welcomeTitle');

  return (
    <Container fluid className="min-h-screen bg-gray-900 flex items-center justify-center p-4 overflow-hidden">
      <motion.div
        className="w-full max-w-md bg-beatmm-card rounded-lg shadow-lg p-8 space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Language Switcher */}
        <motion.div className="text-center mb-4 space-x-2" variants={itemVariants}>
          <Button variant={locale === 'en' ? 'light' : 'outline-light'} size="sm" onClick={() => changeLanguage('en')} disabled={loading}>EN</Button>
          <Button variant={locale === 'zh' ? 'light' : 'outline-light'} size="sm" onClick={() => changeLanguage('zh')} disabled={loading}>中文</Button>
          <Button variant={locale === 'my' ? 'light' : 'outline-light'} size="sm" onClick={() => changeLanguage('my')} disabled={loading}>MY</Button>
        </motion.div>

        {/* Logo Placeholder */}
        <motion.div className="text-center" variants={itemVariants}>
          <div className="text-3xl font-bold text-white">BeatMM Pro</div>
        </motion.div>

        {/* Welcome Title */}
        <motion.h2 className="text-center text-white text-xl font-semibold" variants={itemVariants}>
          {loginTitle}
        </motion.h2>

        {successMessage && (
          <motion.div variants={itemVariants}>
            <Alert variant="success" onClose={() => setSuccessMessage(null)} dismissible className="text-sm">
              {successMessage}
            </Alert>
          </motion.div>
        )}
        {error && (
          <motion.div variants={itemVariants}>
            <Alert variant="danger" onClose={() => setError(null)} dismissible className="text-sm">
              {error}
            </Alert>
          </motion.div>
        )}

        <Form onSubmit={handleLogin} className="space-y-4">
          <motion.div variants={itemVariants}>
            <Form.Group controlId="formLoginPhoneNumber">
              <Form.Label className="sr-only">{t('phoneNumberLabel')}</Form.Label>
              <div className="flex items-center bg-gray-700 rounded px-3 py-2">
                <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                <Form.Control
                  type="tel"
                  placeholder={t('phoneNumberLabel')}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="bg-transparent focus:outline-none text-white w-full border-0 p-0"
                  required
                  disabled={loading}
                />
              </div>
            </Form.Group>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Form.Group controlId="formLoginPassword">
              <Form.Label className="sr-only">{t('passwordLabel')}</Form.Label>
              <div className="flex items-center bg-gray-700 rounded px-3 py-2">
                <LockClosedIcon className="h-5 w-5 text-gray-400 mr-3" />
                <Form.Control
                  type="password"
                  placeholder={t('passwordLabel')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent focus:outline-none text-white w-full border-0 p-0"
                  required
                  disabled={loading}
                />
              </div>
            </Form.Group>
          </motion.div>

          <motion.div className="text-right" variants={itemVariants}>
            <Link href="#" className="text-sm text-blue-400 hover:underline">
              {t('login_forgotPasswordLink')}
            </Link>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Button
              type="submit"
              className="w-full py-2.5 rounded-md bg-gradient-primary text-white font-semibold hover:opacity-90 transition-opacity duration-300"
              disabled={loading}
            >
              {loading ? t('loading') : t('loginButton')}
            </Button>
          </motion.div>
        </Form>

        <motion.p className="text-sm text-gray-400 mt-6 text-center" variants={itemVariants}>
          {t('registerPrompt')}{' '}
          <Link href={`/${locale}/register`} className="font-medium text-cyan-400 hover:text-cyan-300">
            {t('registerLink')}
          </Link>
        </motion.p>
      </motion.div>
    </Container>
  );
};

// The Page component that wraps LoginContent with Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading page...</div>}> {/* Or a more sophisticated skeleton/loader */}
      <LoginContent />
    </Suspense>
  );
}
