'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Container, Form, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';

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
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    setIsSuperAdmin(SUPER_ADMIN_PHONES.includes(phoneNumber));
  }, [phoneNumber]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Phone Number:', phoneNumber);
    console.log('Password:', password);
    // Actual Supabase login logic will be added later
  };

  return (
    <Container fluid className="min-h-screen bg-black flex items-center justify-center p-4 overflow-hidden">
      <motion.div
        className={`w-full max-w-md bg-gray-900 p-8 rounded-xl border border-gray-700 shadow-2xl ${isSuperAdmin ? 'shadow-yellow-500/30' : 'shadow-cyan-500/20'}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className={`text-3xl font-bold text-center mb-8 ${isSuperAdmin ? 'text-yellow-400' : 'text-cyan-400'}`}
          variants={itemVariants}
        >
          {isSuperAdmin ? 'Super Admin Login' : 'BeatMM Pro Login'}
        </motion.h1>

        <Form onSubmit={handleLogin}>
          <motion.div variants={itemVariants}>
            <Form.Group className="mb-6" controlId="formPhoneNumber">
              <Form.Label className="text-gray-400 mb-2 block text-sm font-medium">Phone Number</Form.Label>
              <Form.Control
                type="tel"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="bg-gray-800 border-0 border-b-2 border-gray-600 text-gray-200 text-sm focus:ring-0 focus:border-cyan-500 block w-full p-3 placeholder-gray-500 transition-colors duration-300"
                required
              />
            </Form.Group>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Form.Group className="mb-6" controlId="formPassword">
              <Form.Label className="text-gray-400 mb-2 block text-sm font-medium">Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-800 border-0 border-b-2 border-gray-600 text-gray-200 text-sm focus:ring-0 focus:border-cyan-500 block w-full p-3 placeholder-gray-500 transition-colors duration-300"
                required
              />
            </Form.Group>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Button
              type="submit"
              className={`w-full font-semibold py-3 px-4 rounded-md text-white transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black
                ${isSuperAdmin
                  ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 focus:ring-yellow-400'
                  : 'bg-cyan-600 hover:bg-cyan-700 focus:ring-cyan-500'
                }`}
            >
              Login
            </Button>
          </motion.div>
        </Form>

        <motion.p
          className="text-sm text-gray-500 mt-8 text-center"
          variants={itemVariants}
        >
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-cyan-400 hover:text-cyan-300">
            Register Now
          </Link>
        </motion.p>
      </motion.div>
    </Container>
  );
};

export default LoginPage;
