// src/app/[locale]/users/[id]/bookings/page.tsx
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import BookingsList from '@/components/bookings/bookings-list';
import { getBookings } from '@/lib/api/bookings';
import { getFavorites } from '@/lib/api/favorites';

type Props = {
  params: Promise<{ locale: string; id: string }>; // Promise в Next.js 15
};

export default async function BookingsPage({ params }: Props) {
  const { locale } = await params; // Ждем разрешения

  const queryClient = new QueryClient();

  // Префетчуємо основні дані
  await queryClient.prefetchQuery({
    queryKey: ['bookings'],
    queryFn: getBookings,
  });

  // Префетчуємо фаворити
  try {
    await queryClient.prefetchQuery({
      queryKey: ['favorites', locale],
      queryFn: ({ queryKey }) => {
        const [, locale] = queryKey;
        return getFavorites(locale);
      },
    });
  } catch (error) {
    console.log('Could not prefetch favorites:', error);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BookingsList />
    </HydrationBoundary>
  );
}
