"use client"

import React, { useState } from 'react';
import {
    QueryClient,
    QueryClientProvider,
    HydrationBoundary,
    DehydratedState,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from '@/contexts/auth-context';

interface ProvidersProps {
    children: React.ReactNode;
    dehydratedState?: DehydratedState;
}

export default function Providers({ children, dehydratedState }: ProvidersProps) {

    const [queryClient] = useState(() => new QueryClient());
// NOTE: (Global Provider Pattern - обгортка з HydrationBoundary, page.tsx: тепер у <Providers dehydratedState={...}>, а не тільки в HydrationBoundary
// NOTE:Per-Route Pattern- убрати Providers і тільки обгортати page.tsx у HydrationBoundary )
    return (
        <QueryClientProvider client={queryClient}>
            <HydrationBoundary state={dehydratedState}>
                <AuthProvider>
                {children}
                </AuthProvider>
            </HydrationBoundary>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}