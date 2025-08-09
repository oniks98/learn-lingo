import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

/**
 * Конфігурація для next-intl з підтримкою локалізації
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;

  // Перевіряємо чи підтримується запитувана локаль
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`@/messages/${locale}.json`)).default,
  };
});
