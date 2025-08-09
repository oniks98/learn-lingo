// src/config/seo.ts

export const SEO_CONFIG = {
  baseUrl:
    process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'
      : 'http://localhost:3000',

  locales: ['en', 'uk'] as const,

  routes: {
    public: [
      '', // головна сторінка
      '/teachers', // список викладачів
    ],

    private: ['/api/', '/(private)/', '/*/users/', '/@modal/'],

    dynamic: {
      teachers: '/teachers/', // для динамічних сторінок викладачів
    },
  },

  sitemap: {
    changeFrequencies: {
      home: 'daily' as const,
      teachers: 'weekly' as const,
      teacherProfile: 'monthly' as const,
    },

    priorities: {
      home: 1,
      teachers: 0.8,
      teacherProfile: 0.6,
    },
  },

  robots: {
    googleBotSpecific: [
      '/',
      '/en/',
      '/uk/',
      '/en/teachers',
      '/uk/teachers',
      '/en/teachers/*',
      '/uk/teachers/*',
    ],
  },
} as const;

export type Locale = (typeof SEO_CONFIG.locales)[number];

// Логування тільки для розробки
if (process.env.NODE_ENV === 'development') {
  console.log('SEO Config loaded:', SEO_CONFIG.baseUrl);
}
