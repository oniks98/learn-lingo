// src/app/[locale]/not-found.tsx
'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function NotFound() {
  const t = useTranslations('errors.notFound');

  return (
    <div className="mx-auto max-w-86 text-center">
      <h1 className="font-bold text-red-600">{t('title')}</h1>
      <p>{t('description')}</p>
      <Link href="/">{t('goHome')}</Link>
    </div>
  );
}
