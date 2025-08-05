// src/config/fonts.ts
import { Roboto } from 'next/font/google';

export const roboto = Roboto({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '700'],
  display: 'swap',
  preload: true,
  variable: '--font-roboto'
});

export const fontClassName = roboto.className;