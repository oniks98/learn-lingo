import type { Metadata } from 'next';
import clsx from 'clsx';

// Базова URL для різних середовищ
const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_SITE_URL ||
      'https://learn-lingo-amber-eight.vercel.app'
    : 'http://localhost:3000';

// Логування тільки для розробки
if (process.env.NODE_ENV === 'development') {
  console.log('Base URL:', BASE_URL);
}

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: 'LearnLingo - Вивчай мови з професійними викладачами онлайн',
    template: '%s | LearnLingo - Професійна платформа для вивчення мов',
  },

  description:
    'Знайди сертифікованих викладачів мов онлайн. Вивчай англійську, українську, іспанську, французьку та 20+ мов з персоналізованими уроками. Забронюй свій перший урок сьогодні та почни говорити вільно.',

  keywords: [
    'вивчення мов',
    'онлайн репетитори',
    'викладачі англійської',
    'уроки української',
    'викладачі мов',
    'онлайн освіта',
    'вивчення мов онлайн',
    'сертифіковані репетитори',
    'мовні курси',
    'розмовна практика',
    'уроки граматики',
    'практика спілкування',
  ],

  authors: [{ name: 'Команда LearnLingo', url: `${BASE_URL}/about` }],
  creator: 'LearnLingo',
  publisher: 'Освітня платформа LearnLingo',
  category: 'Освіта',
  classification: 'Платформа для вивчення мов',

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

  // Мультимовність та канонічні URL
  alternates: {
    canonical: '/',
    languages: {
      en: '/en',
      uk: '/uk',
      'x-default': '/uk', // Українська як основна
    },
  },

  // Open Graph для соціальних мереж
  openGraph: {
    type: 'website',
    siteName: 'LearnLingo',
    title: 'LearnLingo - Вивчай мови з професійними викладачами',
    description:
      'Знайди сертифікованих викладачів мов онлайн. 500+ репетиторів, 20+ мов, персоналізовані уроки. Почни свою мовну подорож сьогодні!',
    url: BASE_URL,
    locale: 'uk_UA',
    alternateLocale: ['en_US'],
    images: [
      {
        url: `${BASE_URL}/social/opengraph/opengraph-image-uk.png`,
        width: 1200,
        height: 630,
        alt: 'LearnLingo - Професійна платформа для вивчення мов',
        type: 'image/png',
      },
    ],
  },

  // Twitter/X карточки
  twitter: {
    card: 'summary_large_image',
    site: '@LearnLingo_UA',
    creator: '@LearnLingo_UA',
    title: 'LearnLingo - Вивчай мови онлайн',
    description:
      'Знайди сертифікованих викладачів мов. 500+ репетиторів, 20+ мов. Забронюй свій урок сьогодні!',
    images: [
      {
        url: `${BASE_URL}/social/twitter/twitter-image-uk.png`,
        alt: 'Платформа для вивчення мов LearnLingo',
        width: 1200,
        height: 600,
      },
    ],
  },

  // Іконки - favicon.ico першим для сумісності
  icons: {
    icon: [
      { url: '/icons/favicon.ico', type: 'image/x-icon' },
      { url: '/icons/favicon.svg', type: 'image/svg+xml' },
      {
        url: '/icons/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/icons/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
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

  // PWA налаштування
  manifest: '/pwa/manifest.json',

  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'LearnLingo',
    startupImage: [
      {
        url: '/apple/apple-startup-1170x2532.png',
        media: clsx(
          '(device-width: 390px)',
          'and (device-height: 844px)',
          'and (-webkit-device-pixel-ratio: 3)',
        ),
      },
    ],
  },

  // Автодетекція контактної інформації
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
    date: true,
    url: true,
  },

  // Додаткові мета-теги для PWA та мобільних пристроїв
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
