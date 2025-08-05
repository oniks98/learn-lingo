// src/config/i18n/metadata.ts
import type { Metadata } from 'next';

const getBaseUrl = () => {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.NODE_ENV === 'production') {
    return 'https://yourdomain.com'; // Замените на ваш домен
  }
  return 'http://localhost:3000';
};

export const translations = {
  en: {
    title: 'LearnLingo - Learn Languages with Professional Teachers Online',
    description:
      'Find certified language teachers and tutors online. Learn English, Ukrainian, Spanish, French and 20+ languages with personalized lessons. Book your first lesson today.',
    keywords: [
      'language learning',
      'online tutors',
      'English teachers',
      'language courses',
      'learn languages online',
      'certified tutors',
      'speaking practice',
      'grammar lessons',
    ],
    ogTitle: 'LearnLingo - Professional Language Learning Platform',
    ogDescription:
      'Find certified teachers for 20+ languages. Personalized lessons, flexible schedule. Start learning today!',
    twitterTitle: 'LearnLingo - Learn Languages Online',
    twitterDescription:
      'Certified teachers • 20+ languages • Personalized lessons • Book now!',
    templateSuffix: 'Professional Language Learning Platform',
  },
  uk: {
    title: 'LearnLingo - Вивчайте мови з професійними викладачами онлайн',
    description:
      'Знайдіть сертифікованих викладачів та репетиторів мов онлайн. Вивчайте англійську, українську, іспанську, французьку та 20+ мов з персоналізованими уроками.',
    keywords: [
      'вивчення мов',
      'онлайн репетитори',
      'викладачі англійської',
      'курси мов',
      'вивчення мов онлайн',
      'сертифіковані репетитори',
      'розмовна практика',
      'уроки граматики',
    ],
    ogTitle: 'LearnLingo - Професійна платформа для вивчення мов',
    ogDescription:
      'Знайдіть сертифікованих викладачів для 20+ мов. Персоналізовані уроки, гнучкий графік. Почніть вивчати сьогодні!',
    twitterTitle: 'LearnLingo - Вивчайте мови онлайн',
    twitterDescription:
      'Сертифіковані викладачі • 20+ мов • Персоналізовані уроки • Забронюйте зараз!',
    templateSuffix: 'Професійна платформа для вивчення мов',
  },
};

type SupportedLocale = keyof typeof translations;

export function generateLocalizedMetadata(locale: string): Metadata {
  const isValidLocale = locale in translations;
  const normalizedLocale = (isValidLocale ? locale : 'en') as SupportedLocale;
  const isUkrainian = normalizedLocale === 'uk';
  const t = translations[normalizedLocale];
  const baseUrl = getBaseUrl();

  return {
    title: {
      default: t.title,
      template: `%s | LearnLingo - ${t.templateSuffix}`,
    },

    description: t.description,
    keywords: t.keywords,

    alternates: {
      canonical: `${baseUrl}/${normalizedLocale}`,
      languages: {
        en: `${baseUrl}/en`,
        uk: `${baseUrl}/uk`,
        'x-default': `${baseUrl}/en`,
      },
    },

    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      url: `${baseUrl}/${normalizedLocale}`,
      locale: isUkrainian ? 'uk_UA' : 'en_US',
      alternateLocale: isUkrainian ? ['en_US'] : ['uk_UA'],
      type: 'website',
      siteName: 'LearnLingo',
      images: [
        {
          url: `${baseUrl}/opengraph-image-${normalizedLocale}.png`,
          width: 1200,
          height: 630,
          alt: isUkrainian
            ? 'LearnLingo - Професійна платформа для вивчення мов'
            : 'LearnLingo - Professional Language Learning Platform',
        },
      ],
    },

    twitter: {
      title: t.twitterTitle,
      description: t.twitterDescription,
      images: [
        {
          url: `${baseUrl}/twitter-image-${normalizedLocale}.png`,
          alt: t.twitterTitle,
          width: 1200,
          height: 600,
        },
      ],
    },

    other: {
      'og:locale:alternate': isUkrainian ? 'en_US' : 'uk_UA',
    },
  };
}
