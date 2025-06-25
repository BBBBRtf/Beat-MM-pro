'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Container, Form, Button } from 'react-bootstrap';

const SUPER_ADMIN_PHONES = ['09787715620', '09424425049'];

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
    <Container fluid className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-xl">
        <h1 className={`text-3xl font-bold text-center mb-8 ${isSuperAdmin ? 'text-yellow-400' : 'text-purple-500'}`}>
          {isSuperAdmin ? 'Super Admin Login' : 'BeatMM Pro Login'}
        </h1>

        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-6" controlId="formPhoneNumber">
            <Form.Label className="text-gray-300 mb-2 block text-sm font-medium">Phone Number</Form.Label>
            <Form.Control
              type="tel"
              placeholder="Enter your phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-3 placeholder-gray-400"
              required
            />
          </Form.Group>

          <Form.Group className="mb-6" controlId="formPassword">
            <Form.Label className="text-gray-300 mb-2 block text-sm font-medium">Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-3 placeholder-gray-400"
              required
            />
          </Form.Group>

          <Button
            type="submit"
            className={`w-full font-semibold py-3 px-4 rounded-lg text-white transition-all duration-300 ease-in-out focus:outline-none focus:ring-4
              ${isSuperAdmin
                ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:bg-gradient-to-br focus:ring-yellow-300 dark:focus:ring-yellow-800 shadow-lg shadow-yellow-500/50 dark:shadow-lg dark:shadow-yellow-800/80'
                : 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-300 dark:focus:ring-purple-800 shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80'
              }`}
          >
            Login
          </Button>
        </Form>

        <p className="text-sm text-gray-400 mt-8 text-center">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-purple-400 hover:text-purple-300">
            Register Now
          </Link>
        </p>
      </div>
    </Container>
  );
};

export default LoginPage;
