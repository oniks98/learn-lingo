// components/error-page.tsx
'use client';

import Button from '@/components/ui/button';
import { useTranslations } from 'next-intl';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const t = useTranslations('errors.page');

  return (
    <div className="mx-auto max-w-46 text-center">
      <h2 className="font-bold text-red-600">{t('title')}</h2>
      <p className="mb-4 text-gray-600">{t('description')}</p>
      {process.env.NODE_ENV === 'development' && (
        <pre className="mb-4 overflow-auto rounded bg-gray-100 p-2 text-left text-sm text-gray-500">
          {error.message}
        </pre>
      )}
      {error.digest && (
        <p className="mb-4 text-sm text-gray-500">
          {t('errorCode')}: {error.digest}
        </p>
      )}
      <Button onClick={reset}>{t('tryAgain')}</Button>
    </div>
  );
}
