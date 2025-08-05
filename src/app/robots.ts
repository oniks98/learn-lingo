// src/app/robots.ts
import { MetadataRoute } from 'next';
import { generateRobotsConfig } from '@/lib/utils/robots';

export default function robots(): MetadataRoute.Robots {
  return generateRobotsConfig();
}
