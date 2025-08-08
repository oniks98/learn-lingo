// src/app/[locale]/users/[id]/favorites/page.tsx
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import FavoritesList from '@/components/favorites/favorites-list';
import { getFavorites } from '@/lib/api/favorites';

interface Props {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

export default async function FavoritesPage({ params }: Props) {
  const { locale } = await params;
  const queryClient = new QueryClient();

  try {
    await queryClient.prefetchQuery({
      queryKey: ['favorites', locale],
      queryFn: ({ queryKey }) => {
        const [, locale] = queryKey;
        return getFavorites(locale);
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Could not prefetch favorites:', error);
    }
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <FavoritesList />
    </HydrationBoundary>
  );
}
