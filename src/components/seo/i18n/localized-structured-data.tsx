// src/components/seo/i18n/localized-structured-data.tsx

interface LocalizedStructuredDataProps {
  locale: string;
  additionalData?: object[];
}

export default function LocalizedStructuredData({
  locale,
  additionalData = [],
}: LocalizedStructuredDataProps) {
  const isUkrainian = locale === 'uk';
  const baseUrl =
    process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'
      : 'http://localhost:3000';

  // Основные схемы для организации и сайта (глобальные)
  const organizationSchema = {
    '@type': 'Organization',
    '@id': `${baseUrl}/#organization`,
    name: 'LearnLingo',
    alternateName: 'LearnLingo Education Platform',
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}/brand/logo.png`,
      width: 512,
      height: 512,
    },
    sameAs: [
      'https://facebook.com/learnlingo',
      'https://twitter.com/learnlingo',
      'https://linkedin.com/company/learnlingo',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'support@yourdomain.com',
    },
  };

  const websiteSchema = {
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    url: baseUrl,
    name: 'LearnLingo',
    description:
      'Professional language learning platform with certified teachers',
    inLanguage: ['en-US', 'uk-UA'],
    publisher: {
      '@id': `${baseUrl}/#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/teachers?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  const educationalOrgSchema = {
    '@type': 'EducationalOrganization',
    '@id': `${baseUrl}/#educational-org`,
    name: 'LearnLingo',
    description:
      'Online language learning platform connecting students with certified language teachers',
    url: baseUrl,
    logo: `${baseUrl}/brand/logo.png`,
    hasCredential: 'Certified Language Teachers',
    educationalCredentialAwarded: 'Language Proficiency Certificates',
    teaches: [
      'English Language',
      'Ukrainian Language',
      'Spanish Language',
      'French Language',
      'German Language',
    ],
  };

  // Локализованная схема для конкретной страницы
  const webPageSchema = {
    '@type': 'WebPage',
    '@id': `${baseUrl}/${locale}#webpage`,
    url: `${baseUrl}/${locale}`,
    name: isUkrainian
      ? 'LearnLingo - Вивчайте мови з професійними викладачами'
      : 'LearnLingo - Learn Languages with Professional Teachers',
    description: isUkrainian
      ? 'Знайдіть сертифікованих викладачів мов онлайн. 500+ репетиторів, 20+ мов, персоналізовані уроки.'
      : 'Find certified language teachers online. 500+ tutors, 20+ languages, personalized lessons.',
    inLanguage: locale === 'uk' ? 'uk-UA' : 'en-US',
    isPartOf: {
      '@id': `${baseUrl}/#website`,
    },
    about: {
      '@type': 'Thing',
      name: isUkrainian ? 'Вивчення мов онлайн' : 'Online language learning',
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: isUkrainian ? 'Головна' : 'Home',
          item: `${baseUrl}/${locale}`,
        },
      ],
    },
  };

  // Объединяем все схемы
  const allSchemas = [
    organizationSchema,
    websiteSchema,
    educationalOrgSchema,
    webPageSchema,
    ...additionalData,
  ];

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': allSchemas,
  };

  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}
