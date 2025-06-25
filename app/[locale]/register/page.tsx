'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useTranslation } from '../../../i18n/client';
import { UserIcon, PhoneIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { createSupabaseBrowserClient } from '../../../lib/supabase/client'; // Import Supabase client

// Animation Variants
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

const RegisterPage: React.FC = () => {
  const params = useParams();
  const locale = params.locale as string;
  const { t, i18n } = useTranslation('login'); // Using 'login' namespace
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createSupabaseBrowserClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!username || !phoneNumber || !password || !confirmPassword) {
      setError(t('validation_allFieldsRequired'));
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError(t('validation_passwordTooShort'));
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError(t('register_passwordMismatch'));
      setLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        phone: phoneNumber, // Ensure phone number is in a Supabase-accepted format (e.g., E.164)
        password: password,
        options: {
          data: {
            username: username,
          },
        },
      });

      if (signUpError) {
        console.error('Supabase Sign Up Error:', signUpError);
        setError(signUpError.message || t('error_generic_supabase'));
      } else if (data.user) {
        // data.user exists but might require phone confirmation depending on Supabase settings
        // For now, assume direct success or that confirmation email/SMS is handled by Supabase
        console.log('Registration successful for user:', data.user);
        router.push(`/${locale}/login?message=${encodeURIComponent(t('registration_successful'))}`);
      } else {
        // Fallback if no user and no error, though unlikely with phone signup
         setError(t('error_generic_supabase'));
      }
    } catch (catchError: any) {
      console.error('Catch Error During Sign Up:', catchError);
      setError(catchError.message || t('error_generic_supabase'));
    } finally {
      setLoading(false);
    }
  };

  const changeLanguage = (lng: string) => {
    router.push(`/${lng}/register`);
  };

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
          <Button variant={locale === 'en' ? 'light' : 'outline-light'} size="sm" onClick={() => changeLanguage('en')}>EN</Button>
          <Button variant={locale === 'zh' ? 'light' : 'outline-light'} size="sm" onClick={() => changeLanguage('zh')}>中文</Button>
          <Button variant={locale === 'my' ? 'light' : 'outline-light'} size="sm" onClick={() => changeLanguage('my')}>MY</Button>
        </motion.div>

        {/* Logo Placeholder */}
        <motion.div className="text-center" variants={itemVariants}>
          <div className="text-3xl font-bold text-white">BeatMM Pro</div>
        </motion.div>

        {/* Page Title */}
        <motion.h2 className="text-center text-white text-xl font-semibold" variants={itemVariants}>
          {t('register_pageTitle')}
        </motion.h2>

        {error && (
          <motion.div variants={itemVariants}>
            <Alert variant="danger" onClose={() => setError(null)} dismissible className="text-sm">
              {error}
            </Alert>
          </motion.div>
        )}

        <Form onSubmit={handleRegister} className="space-y-4">
          {/* Username Input */}
          <motion.div variants={itemVariants}>
            <Form.Group controlId="formRegisterUsername">
              <Form.Label className="sr-only">{t('register_usernameLabel')}</Form.Label>
              <div className="flex items-center bg-gray-700 rounded px-3 py-2">
                <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                <Form.Control
                  type="text"
                  placeholder={t('register_usernameLabel')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-transparent focus:outline-none text-white w-full border-0 p-0"
                  required
                  disabled={loading}
                />
              </div>
            </Form.Group>
          </motion.div>

          {/* Phone Number Input */}
          <motion.div variants={itemVariants}>
            <Form.Group controlId="formRegisterPhoneNumber">
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

          {/* Password Input */}
          <motion.div variants={itemVariants}>
            <Form.Group controlId="formRegisterPassword">
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

          {/* Confirm Password Input */}
          <motion.div variants={itemVariants}>
            <Form.Group controlId="formRegisterConfirmPassword">
              <Form.Label className="sr-only">{t('register_confirmPasswordLabel')}</Form.Label>
              <div className="flex items-center bg-gray-700 rounded px-3 py-2">
                <LockClosedIcon className="h-5 w-5 text-gray-400 mr-3" />
                <Form.Control
                  type="password"
                  placeholder={t('register_confirmPasswordLabel')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-transparent focus:outline-none text-white w-full border-0 p-0"
                  required
                  disabled={loading}
                />
              </div>
            </Form.Group>
          </motion.div>

          {/* Register Button */}
          <motion.div variants={itemVariants}>
            <Button
              type="submit"
              className="w-full py-2.5 rounded-md bg-gradient-primary text-white font-semibold hover:opacity-90 transition-opacity duration-300"
              disabled={loading}
            >
              {loading ? t('loading', 'Loading...') : t('register_buttonText')}
            </Button>
          </motion.div>
        </Form>

        {/* Login Link Footer */}
        <motion.p className="text-sm text-gray-400 mt-6 text-center" variants={itemVariants}>
          {t('loginLinkPrompt')}{' '}
          <Link href={`/${locale}/login`} className="font-medium text-cyan-400 hover:text-cyan-300">
            {t('loginLinkActionText')}
          </Link>
        </motion.p>
      </motion.div>
    </Container>
  );
};

export default RegisterPage;
