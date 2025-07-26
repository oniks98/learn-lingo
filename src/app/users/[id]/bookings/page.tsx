// src/app/users/[id]/bookings/page.tsx
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import BookingsList from '@/components/ui/bookings-list';
import { getBookings } from '@/lib/api/bookings';
import { getFavorites } from '@/lib/api/favorites';

export default async function BookingsPage() {
  const queryClient = new QueryClient();

  // Префетчуємо основні дані
  await queryClient.prefetchQuery({
    queryKey: ['bookings'],
    queryFn: getBookings,
  });

  // Префетчуємо фаворити для показу желтых сердечек
  // teachers уже в кеше из страницы /teachers, поэтому не префетчим
  try {
    await queryClient.prefetchQuery({
      queryKey: ['favorites'],
      queryFn: getFavorites,
    });
  } catch (error) {
    // Якщо помилка з фаворитами, просто не префетчуємо
    console.log('Could not prefetch favorites:', error);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BookingsList />
    </HydrationBoundary>
  );
}
