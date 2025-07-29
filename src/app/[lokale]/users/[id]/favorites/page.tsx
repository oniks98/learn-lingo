// src/app/users/[id]/favorites/page.tsx
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import FavoritesList from '@/components/favorites/favorites-list';
import { getFavorites } from '@/lib/api/favorites';

export default async function FavoritesPage() {
  const queryClient = new QueryClient();

  // Префетчуємо дані фаворитів
  try {
    await queryClient.prefetchQuery({
      queryKey: ['favorites'],
      queryFn: getFavorites,
    });
  } catch (error) {
    // Якщо помилка (не авторизований), просто не префетчуємо
    console.log('Could not prefetch favorites:', error);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <FavoritesList />
    </HydrationBoundary>
  );
}
