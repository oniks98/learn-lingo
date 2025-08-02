// src/app/[locale]/layout.tsx
import React from 'react';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Header from '@/components/header/header';
import Footer from '@/components/footer/footer';
import Providers from '@/providers/providers'; // Импортируем ваш существующий компонент

export const dynamic = 'force-dynamic';

// Генерация статических параметров для локалей
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale: locale }));
}

export default async function LocaleLayout({
  children,
  modal,
  params,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const messages = (await import(`@/messages/${locale}.json`)).default;

  return (
    <Providers>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <div className="grid min-h-full w-full grid-rows-[auto_1fr_auto]">
          <Header />
          <main>{children}</main>
          <Footer />
          {modal}
        </div>
      </NextIntlClientProvider>
    </Providers>
  );
}
