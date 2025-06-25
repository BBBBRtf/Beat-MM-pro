'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link'; // Keep for potential future use, though not directly in form
import { useRouter, useParams } from 'next/navigation';
import { Container, Form, Button, Image, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useTranslation } from '../../../i18n/client';
import {
  MusicalNoteIcon,
  UserCircleIcon,
  CurrencyDollarIcon,
  PhotoIcon,
  ArrowUpTrayIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

// Animation Variants (can be shared or defined per page)
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

const UploadPage: React.FC = () => {
  const params = useParams();
  const locale = params.locale as string;
  const { t, i18n } = useTranslation('login'); // Using 'login' namespace
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [price, setPrice] = useState(''); // Store as string to handle empty input
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const coverFileRef = useRef<HTMLInputElement>(null); // For clearing file input
  const audioFileRef = useRef<HTMLInputElement>(null); // For clearing file input


  useEffect(() => {
    // Clean up the object URL when the component unmounts or coverPreviewUrl changes
    return () => {
      if (coverPreviewUrl) {
        URL.revokeObjectURL(coverPreviewUrl);
      }
    };
  }, [coverPreviewUrl]);

  const handleCoverFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCoverFile(file);
      if (coverPreviewUrl) {
        URL.revokeObjectURL(coverPreviewUrl); // Revoke old object URL
      }
      setCoverPreviewUrl(URL.createObjectURL(file));
    } else {
      setCoverFile(null);
      if (coverPreviewUrl) {
        URL.revokeObjectURL(coverPreviewUrl);
      }
      setCoverPreviewUrl(null);
    }
  };

  const handleAudioFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAudioFile(file);
    } else {
      setAudioFile(null);
    }
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    // Basic Validation (more can be added)
    if (!title || !artistName || !coverFile || !audioFile) {
      setError(t('validation_allFieldsRequired')); // Assuming this key exists or will be added
      setLoading(false);
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue < 0) {
        setError(t('validation_invalidPrice', 'Price must be a valid non-negative number.')); // Add this key
        setLoading(false);
        return;
    }

    console.log('Uploading song (static):', {
      title,
      artistName,
      price: priceValue,
      coverFile,
      audioFile,
    });

    // Simulate API call for now
    setTimeout(() => {
      setSuccessMessage(t('upload_successful_placeholder', 'Song submitted for review!')); // Add this key
      setLoading(false);
      // Reset form (optional)
      setTitle('');
      setArtistName('');
      setPrice('');
      setCoverFile(null);
      setAudioFile(null);
      if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
      setCoverPreviewUrl(null);
      if(coverFileRef.current) coverFileRef.current.value = "";
      if(audioFileRef.current) audioFileRef.current.value = "";

    }, 1500);
    // Actual Supabase upload logic will be implemented in the next step
  };

  const changeLanguage = (lng: string) => {
    router.push(`/${lng}/upload`);
  };

  return (
    <Container fluid className="min-h-screen bg-gray-900 flex items-center justify-center p-4 overflow-hidden">
      <motion.div
        className="w-full max-w-lg bg-beatmm-card rounded-lg shadow-lg p-8 space-y-6" // max-w-lg for more space
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

        {/* Logo Placeholder - Consistent with other pages */}
        <motion.div className="text-center" variants={itemVariants}>
          <div className="text-3xl font-bold text-white">BeatMM Pro</div>
        </motion.div>

        {/* Page Title */}
        <motion.h2 className="text-center text-white text-xl font-semibold" variants={itemVariants}>
          {t('upload_pageTitle')}
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

        <Form onSubmit={handleUpload} className="space-y-4">
          {/* Song Title */}
          <motion.div variants={itemVariants}>
            <Form.Group controlId="formSongTitle">
              <Form.Label className="text-gray-300 flex items-center">
                <MusicalNoteIcon className="h-5 w-5 mr-2 text-cyan-400" /> {t('upload_songTitleLabel')}
              </Form.Label>
              <Form.Control
                type="text"
                placeholder={t('upload_songTitleLabel')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-gray-700 text-white border-gray-600 placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500"
                required
                disabled={loading}
              />
            </Form.Group>
          </motion.div>

          {/* Artist Name */}
          <motion.div variants={itemVariants}>
            <Form.Group controlId="formArtistName">
              <Form.Label className="text-gray-300 flex items-center">
                <UserCircleIcon className="h-5 w-5 mr-2 text-cyan-400" /> {t('upload_artistNameLabel')}
              </Form.Label>
              <Form.Control
                type="text"
                placeholder={t('upload_artistNameLabel')}
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                className="bg-gray-700 text-white border-gray-600 placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500"
                required
                disabled={loading}
              />
            </Form.Group>
          </motion.div>

          {/* Price */}
          <motion.div variants={itemVariants}>
            <Form.Group controlId="formPrice">
              <Form.Label className="text-gray-300 flex items-center">
                <CurrencyDollarIcon className="h-5 w-5 mr-2 text-cyan-400" /> {t('upload_priceLabel')}
              </Form.Label>
              <Form.Control
                type="number"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                step="0.01"
                className="bg-gray-700 text-white border-gray-600 placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500"
                required
                disabled={loading}
              />
            </Form.Group>
          </motion.div>

          {/* Cover Image */}
          <motion.div variants={itemVariants}>
            <Form.Group controlId="formCoverImage">
              <Form.Label className="text-gray-300 flex items-center">
                <PhotoIcon className="h-5 w-5 mr-2 text-cyan-400" /> {t('upload_coverImageLabel')}
              </Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleCoverFileChange}
                className="bg-gray-700 text-white border-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700"
                required
                disabled={loading}
                ref={coverFileRef}
              />
            </Form.Group>
            {coverPreviewUrl && (
              <motion.div className="mt-3 text-center" variants={itemVariants}>
                <Image src={coverPreviewUrl} alt="Cover preview" thumbnail fluid style={{ maxHeight: '200px', objectFit: 'contain' }} />
              </motion.div>
            )}
          </motion.div>

          {/* Audio File */}
          <motion.div variants={itemVariants}>
            <Form.Group controlId="formAudioFile">
              <Form.Label className="text-gray-300 flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2 text-cyan-400" /> {t('upload_audioFileLabel')}
              </Form.Label>
              <Form.Control
                type="file"
                accept="audio/*"
                onChange={handleAudioFileChange}
                className="bg-gray-700 text-white border-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700"
                required
                disabled={loading}
                ref={audioFileRef}
              />
              {audioFile && <p className="text-xs text-gray-400 mt-1">{audioFile.name}</p>}
            </Form.Group>
          </motion.div>

          {/* Upload Button */}
          <motion.div variants={itemVariants} className="pt-4">
            <Button
              type="submit"
              className="w-full py-2.5 rounded-md bg-gradient-primary text-white font-semibold hover:opacity-90 transition-opacity duration-300 flex items-center justify-center"
              disabled={loading}
            >
              <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
              {loading ? t('loading') : t('upload_buttonText')}
            </Button>
          </motion.div>
        </Form>

      </motion.div>
    </Container>
  );
};

export default UploadPage;
