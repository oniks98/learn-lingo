// src/app/[locale]/global-error.tsx
'use client';

import Button from '@/components/ui/button';
import { useTranslations } from 'next-intl';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors.global');

  return (
    <html>
      <body>
        <div className="mx-auto max-w-46 text-center">
          <h2 className="font-bold text-red-600">{t('title')}</h2>
          <pre>{error.message}</pre>
          {error.digest && (
            <p>
              {t('errorCode')}: {error.digest}
            </p>
          )}
          <Button onClick={() => reset()}>{t('tryAgain')}</Button>
        </div>
      </body>
    </html>
  );
}
