'use client';

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Container, Form, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useTranslation } from '../../../i18n/client'; // Path updated as login page is now one level deeper
import { PhoneIcon, LockClosedIcon } from '@heroicons/react/24/outline';

const SUPER_ADMIN_PHONES = ['09787715620', '09424425049'];

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0, scale: 0.90 }, // Slightly more noticeable scale
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      delayChildren: 0.2,    // Faster start for children
      staggerChildren: 0.15, // Children appear a bit quicker after each other
      duration: 0.3,       // Container fades in a bit faster
      ease: "circOut",       // Smoother easing for container
    },
  },
};

const itemVariants = {
  hidden: { y: 25, opacity: 0 }, // Slightly more y offset
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.35,      // Items appear a bit faster
      ease: "easeOut",     // Standard easeOut for items
    },
  },
};

const LoginPage: React.FC = () => {
  const params = useParams();
  const locale = params.locale as string;
  const { t, i18n } = useTranslation('login');
  const router = useRouter();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false); // Keep super admin logic for now

  useEffect(() => {
    setIsSuperAdmin(SUPER_ADMIN_PHONES.includes(phoneNumber));
  }, [phoneNumber]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt:', { phoneNumber, password });
    // Backend logic later
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
          <Button variant={locale === 'en' ? 'light' : 'outline-light'} size="sm" onClick={() => changeLanguage('en')}>EN</Button>
          <Button variant={locale === 'zh' ? 'light' : 'outline-light'} size="sm" onClick={() => changeLanguage('zh')}>中文</Button>
          <Button variant={locale === 'my' ? 'light' : 'outline-light'} size="sm" onClick={() => changeLanguage('my')}>MY</Button>
        </motion.div>

        {/* Logo Placeholder */}
        <motion.div className="text-center" variants={itemVariants}>
          <div className="text-3xl font-bold text-white">BeatMM Pro</div>
        </motion.div>

        {/* Welcome Title */}
        <motion.h2 className="text-center text-white text-xl font-semibold" variants={itemVariants}>
          {loginTitle}
        </motion.h2>

        <Form onSubmit={handleLogin} className="space-y-4">
          {/* Phone Number Input */}
          <motion.div variants={itemVariants}>
            <Form.Group controlId="formLoginPhoneNumber">
              <Form.Label className="sr-only">{t('phoneNumberLabel')}</Form.Label>
              <div className="flex items-center bg-gray-700 rounded px-3 py-2">
                <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" /> {/* Increased margin for icon */}
                <Form.Control
                  type="tel"
                  placeholder={t('phoneNumberLabel')}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="bg-transparent focus:outline-none text-white w-full border-0 p-0" // Removed default padding from Form.Control
                  required
                />
              </div>
            </Form.Group>
          </motion.div>

          {/* Password Input */}
          <motion.div variants={itemVariants}>
            <Form.Group controlId="formLoginPassword">
              <Form.Label className="sr-only">{t('passwordLabel')}</Form.Label>
              <div className="flex items-center bg-gray-700 rounded px-3 py-2">
                <LockClosedIcon className="h-5 w-5 text-gray-400 mr-3" /> {/* Increased margin for icon */}
                <Form.Control
                  type="password"
                  placeholder={t('passwordLabel')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent focus:outline-none text-white w-full border-0 p-0" // Removed default padding
                  required
                />
              </div>
            </Form.Group>
          </motion.div>

          {/* Forgot Password Link */}
          <motion.div className="text-right" variants={itemVariants}>
            <Link href="#" className="text-sm text-blue-400 hover:underline">
              {t('login_forgotPasswordLink')}
            </Link>
          </motion.div>

          {/* Login Button */}
          <motion.div variants={itemVariants}>
            <Button
              type="submit"
              className="w-full py-2.5 rounded-md bg-gradient-primary text-white font-semibold hover:opacity-90 transition-opacity duration-300" // py-2.5 for a bit more height
            >
              {t('loginButton')}
            </Button>
          </motion.div>
        </Form>

        {/* Register Link Footer */}
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

export default LoginPage;
