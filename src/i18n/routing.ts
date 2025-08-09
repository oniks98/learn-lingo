import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // Список підтримуваних мов
  locales: ['en', 'uk'],

  // Мова за замовчуванням
  defaultLocale: 'en',
});
