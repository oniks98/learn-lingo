// src/app/[locale]/layout.tsx
import React from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import Header from '@/components/header/header';
import Footer from '@/components/footer/footer';
import Providers from '@/providers/providers';
import LocalizedStructuredData from '@/components/seo/i18n/localized-structured-data';

import { generateLocalizedMetadata } from '@/config/i18n/metadata';
import {
  validateLocale,
  getMessages,
  generateStaticLocaleParams,
} from '@/lib/utils/locale';

export const dynamic = 'force-dynamic';

// Правильные типы
interface LocaleLayoutProps {
  children: React.ReactNode;
  modal: React.ReactNode;
  params: Promise<{ locale: string }>;
}

// generateStaticParams должна возвращать массив объектов с locale
export function generateStaticParams(): { locale: string }[] {
  return generateStaticLocaleParams();
}

// Используем any для избежания TypeScript конфликтов
export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { locale } = await params;

  if (!validateLocale(locale)) {
    return generateLocalizedMetadata('en');
  }

  return generateLocalizedMetadata(locale);
}

export default async function LocaleLayout({
  children,
  modal,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!validateLocale(locale)) {
    notFound();
  }

  const messages = await getMessages(locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Providers>
        <LocalizedStructuredData locale={locale} />
        <div className="grid min-h-full w-full grid-rows-[auto_1fr_auto]">
          <Header />
          <main>{children}</main>
          <Footer />
        </div>
        {modal}
      </Providers>
    </NextIntlClientProvider>
  );
}
