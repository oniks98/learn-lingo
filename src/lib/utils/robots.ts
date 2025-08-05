// src/utils/robots.ts
import { MetadataRoute } from 'next';
import { SEO_CONFIG } from '@/config/seo';

// Определяем тип для отдельного правила робота
type RobotRule = {
  userAgent: string | string[];
  allow?: string | string[];
  disallow?: string | string[];
  crawlDelay?: number;
};

/**
 * Создает правила для обычных роботов
 */
export function createGeneralRobotRules(): RobotRule {
  return {
    userAgent: '*',
    allow: '/',
    disallow: [
      ...SEO_CONFIG.routes.private,
      // Добавляем специфичные для локалей блокировки
      ...SEO_CONFIG.locales.flatMap((locale) => [
        `/${locale}/(private)/`,
        `/${locale}/users/`,
      ]),
    ],
  };
}

/**
 * Создает правила специально для Googlebot
 */
export function createGoogleBotRules(): RobotRule {
  return {
    userAgent: 'Googlebot',
    allow: [...SEO_CONFIG.robots.googleBotSpecific],
    disallow: [...SEO_CONFIG.routes.private],
  };
}

/**
 * Генерирует полную конфигурацию robots.txt
 */
export function generateRobotsConfig(): MetadataRoute.Robots {
  const generalRules = createGeneralRobotRules();
  const googleBotRules = createGoogleBotRules();

  return {
    rules: [generalRules, googleBotRules],
    sitemap: `${SEO_CONFIG.baseUrl}/sitemap.xml`,
    host: SEO_CONFIG.baseUrl,
  };
}
