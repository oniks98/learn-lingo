// src/app/layout.tsx
import React from 'react';
import { Roboto } from 'next/font/google';
import '@/styles/globals.css';
import { Toaster } from 'sonner';
import ScrollToTopButton from '@/components/ui/ScrollToTopButton';
import type { Metadata } from 'next';

const font = Roboto({ subsets: ['latin'], weight: ['400', '500', '700'] });

export const metadata: Metadata = {
  title: 'LearnLingo',
  description: 'Learn languages with professional teachers',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${font.className} h-full`}>
      <body className="h-full">
        {children}
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            duration: 3000,
            classNames: { title: 'text-lg font-bold text-center' },
          }}
        />
        <ScrollToTopButton />
      </body>
    </html>
  );
}
