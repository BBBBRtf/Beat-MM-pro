'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Container, Form, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useTranslation } from '../../../i18n/client'; // Adjusted path

// Animation Variants (can be shared or defined per page)
// For now, copying from login page for consistency
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
  const { t, i18n } = useTranslation('login'); // Using 'login' namespace as keys are added there
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation example (can be expanded)
    if (password !== confirmPassword) {
      alert(t('register_passwordMismatch')); // Assuming you add this key for error messages
      return;
    }
    console.log('Registering:', { username, phoneNumber, password });
    // Actual API call will be added later
  };

  const changeLanguage = (lng: string) => {
    router.push(`/${lng}/register`);
  };

  return (
    <Container fluid className="min-h-screen bg-black flex items-center justify-center p-4 overflow-hidden">
      <motion.div
        className="w-full max-w-md bg-gray-900 p-8 rounded-xl border border-gray-700 shadow-2xl shadow-cyan-500/20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Language Switcher */}
        <motion.div className="text-center mb-6 space-x-2" variants={itemVariants}>
          <Button variant={locale === 'en' ? 'light' : 'outline-light'} size="sm" onClick={() => changeLanguage('en')}>EN</Button>
          <Button variant={locale === 'zh' ? 'light' : 'outline-light'} size="sm" onClick={() => changeLanguage('zh')}>中文</Button>
          <Button variant={locale === 'my' ? 'light' : 'outline-light'} size="sm" onClick={() => changeLanguage('my')}>MY</Button>
        </motion.div>

        <motion.h1
          className="text-3xl font-bold text-center mb-8 text-cyan-400"
          variants={itemVariants}
        >
          {t('register_pageTitle')}
        </motion.h1>

        <Form onSubmit={handleRegister}>
          <motion.div variants={itemVariants}>
            <Form.Group className="mb-6" controlId="formUsername">
              <Form.Label className="text-gray-400 mb-2 block text-sm font-medium">{t('register_usernameLabel')}</Form.Label>
              <Form.Control
                type="text"
                placeholder={t('register_usernameLabel')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-gray-800 border-0 border-b-2 border-gray-600 text-gray-200 text-sm focus:ring-0 focus:border-cyan-500 block w-full p-3 placeholder-gray-500 transition-colors duration-300"
                required
              />
            </Form.Group>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Form.Group className="mb-6" controlId="formPhoneNumberRegister">
              <Form.Label className="text-gray-400 mb-2 block text-sm font-medium">{t('phoneNumberLabel')}</Form.Label>
              <Form.Control
                type="tel"
                placeholder={t('phoneNumberLabel')}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="bg-gray-800 border-0 border-b-2 border-gray-600 text-gray-200 text-sm focus:ring-0 focus:border-cyan-500 block w-full p-3 placeholder-gray-500 transition-colors duration-300"
                required
              />
            </Form.Group>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Form.Group className="mb-6" controlId="formPasswordRegister">
              <Form.Label className="text-gray-400 mb-2 block text-sm font-medium">{t('passwordLabel')}</Form.Label>
              <Form.Control
                type="password"
                placeholder={t('passwordLabel')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-800 border-0 border-b-2 border-gray-600 text-gray-200 text-sm focus:ring-0 focus:border-cyan-500 block w-full p-3 placeholder-gray-500 transition-colors duration-300"
                required
              />
            </Form.Group>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Form.Group className="mb-6" controlId="formConfirmPassword">
              <Form.Label className="text-gray-400 mb-2 block text-sm font-medium">{t('register_confirmPasswordLabel')}</Form.Label>
              <Form.Control
                type="password"
                placeholder={t('register_confirmPasswordLabel')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-gray-800 border-0 border-b-2 border-gray-600 text-gray-200 text-sm focus:ring-0 focus:border-cyan-500 block w-full p-3 placeholder-gray-500 transition-colors duration-300"
                required
              />
            </Form.Group>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Button
              type="submit"
              className="w-full font-semibold py-3 px-4 rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-cyan-500 transition-all duration-300 ease-in-out"
            >
              {t('register_buttonText')}
            </Button>
          </motion.div>
        </Form>

        <motion.p
          className="text-sm text-gray-500 mt-8 text-center"
          variants={itemVariants}
        >
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
