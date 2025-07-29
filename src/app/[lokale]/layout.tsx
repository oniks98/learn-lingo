// src/app/[lokale]/layout.tsx
import React from 'react';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Header from '@/components/header/header';

export const dynamic = 'force-dynamic';

// Генерация статических параметров для локалей
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ lokale: locale }));
}

export default async function LocaleLayout({
  children,
  modal,
  params,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
  params: Promise<{ lokale: string }>;
}) {
  const { lokale } = await params;
  if (!hasLocale(routing.locales, lokale)) notFound();

  const messages = (await import(`@/messages/${lokale}.json`)).default;

  return (
    <NextIntlClientProvider locale={lokale} messages={messages}>
      <Header />
      {children}
      {modal}
    </NextIntlClientProvider>
  );
}
