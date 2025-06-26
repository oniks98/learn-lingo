import React from 'react';
import { Roboto  } from 'next/font/google';
import Providers from '@/providers/providers';
import '@/styles/globals.css';

const font = Roboto ({ subsets: ['latin'],
    weight: ['400', '500', '700'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={font.className}>
      <body >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}