'use client';
import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/auth-context';
import { CurrencyProvider } from '@/contexts/currency-context';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <CurrencyProvider>
        <AuthProvider>{children}</AuthProvider>
      </CurrencyProvider>
    </QueryClientProvider>
  );
}
