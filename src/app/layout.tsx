import React from 'react';
import { Roboto } from 'next/font/google';
import Providers from '@/providers/providers';
import Header from '@/app/components/header/header';
import '@/styles/globals.css';
import { Toaster } from 'sonner';

const font = Roboto({ subsets: ['latin'], weight: ['400', '500', '700'] });

export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <html lang="en" className={font.className}>
      <body>
        <Providers>
          <Header />
          {children}
          {modal}
          <Toaster
            position="top-center"
            richColors
            toastOptions={{
              duration: 6000,
              classNames: {
                title: 'text-lg font-bold',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
