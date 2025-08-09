import { MetadataRoute } from 'next';
import { SEO_CONFIG } from '@/config/seo';

// Тип для правила окремого робота
type RobotRule = {
  userAgent: string | string[];
  allow?: string | string[];
  disallow?: string | string[];
  crawlDelay?: number;
};

/**
 * Створює правила для звичайних роботів
 * @returns правила для загальних веб-краулерів
 */
export function createGeneralRobotRules(): RobotRule {
  return {
    userAgent: '*',
    allow: '/',
    disallow: [
      ...SEO_CONFIG.routes.private,
      // Додаємо специфічні блокування для локалей
      ...SEO_CONFIG.locales.flatMap((locale) => [
        `/${locale}/(private)/`,
        `/${locale}/users/`,
      ]),
    ],
  };
}

/**
 * Створює правила спеціально для Googlebot
 * @returns правила для Google веб-краулера
 */
export function createGoogleBotRules(): RobotRule {
  return {
    userAgent: 'Googlebot',
    allow: [...SEO_CONFIG.robots.googleBotSpecific],
    disallow: [...SEO_CONFIG.routes.private],
  };
}

/**
 * Генерує повну конфігурацію robots.txt
 * @returns об'єкт конфігурації для Next.js MetadataRoute.Robots
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
