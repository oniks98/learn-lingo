// src/utils/locale.ts
import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';

export function validateLocale(locale: string): boolean {
  return hasLocale(routing.locales, locale);
}

export async function getMessages(locale: string) {
  try {
    return (await import(`@/messages/${locale}.json`)).default;
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`);
    // Fallback to English
    return (await import(`@/messages/en.json`)).default;
  }
}

export function generateStaticLocaleParams() {
  return routing.locales.map((locale) => ({ locale }));
}
