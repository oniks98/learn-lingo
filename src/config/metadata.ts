// src/config/metadata.ts
import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: 'LearnLingo - Learn Languages with Professional Teachers Online',
    template: '%s | LearnLingo - Professional Language Learning Platform',
  },

  description:
    'Find certified language teachers and tutors online. Learn English, Ukrainian, Spanish, French and 20+ languages with personalized lessons. Book your first lesson today and start speaking fluently.',

  keywords: [
    'language learning',
    'online tutors',
    'English teachers',
    'Ukrainian lessons',
    'language teachers',
    'online education',
    'learn languages online',
    'certified tutors',
    'language courses',
    'speaking practice',
    'grammar lessons',
    'conversation practice',
  ],

  authors: [{ name: 'LearnLingo Team', url: `${BASE_URL}/about` }],
  creator: 'LearnLingo',
  publisher: 'LearnLingo Education Platform',
  category: 'Education',
  classification: 'Language Learning Platform',

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  alternates: {
    canonical: '/',
    languages: {
      en: '/en',
      uk: '/uk',
      'x-default': '/en',
    },
  },

  openGraph: {
    type: 'website',
    siteName: 'LearnLingo',
    title: 'LearnLingo - Learn Languages with Professional Teachers',
    description:
      'Find certified language teachers online. 500+ tutors, 20+ languages, personalized lessons. Start your language journey today!',
    url: BASE_URL,
    locale: 'en_US',
    alternateLocale: ['uk_UA'],
    images: [
      {
        url: `${BASE_URL}/social/opengraph/opengraph-image-en.png`,
        width: 1200,
        height: 630,
        alt: 'LearnLingo - Professional Language Learning Platform',
        type: 'image/png',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    site: '@LearnLingo',
    creator: '@LearnLingo',
    title: 'LearnLingo - Learn Languages Online',
    description:
      'Find certified language teachers. 500+ tutors, 20+ languages. Book your lesson today!',
    images: [
      {
        url: `${BASE_URL}/social/twitter/twitter-image-en.png`,
        alt: 'LearnLingo Language Learning Platform',
        width: 1200,
        height: 600,
      },
    ],
  },

  // ❗️ ИСПРАВЛЕННЫЙ порядок иконок - favicon.ico должен быть ПЕРВЫМ
  icons: {
    icon: [
      { url: '/icons/favicon.ico', type: 'image/x-icon' }, // ❗️ Первым идет favicon.ico
      { url: '/icons/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/icons/favicon.svg',
    apple: [
      {
        url: '/apple/apple-icon-180x180.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        url: '/apple/apple-icon-152x152.png',
        sizes: '152x152',
        type: 'image/png',
      },
      {
        url: '/apple/apple-icon-120x120.png',
        sizes: '120x120',
        type: 'image/png',
      },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/icons/safari-pinned-tab.svg',
        color: '#f4c550',
      },
    ],
  },

  manifest: '/pwa/manifest.json',

  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'LearnLingo',
    startupImage: [
      {
        url: '/apple/apple-startup-1170x2532.png',
        media:
          '(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)',
      },
    ],
  },

  formatDetection: {
    telephone: true,
    email: true,
    address: true,
    date: true,
    url: true,
  },

  other: {
    'application-name': 'LearnLingo',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'theme-color': '#ffffff',
    'color-scheme': 'light dark',
    'supported-color-schemes': 'light dark',
  },
};

export { BASE_URL };
