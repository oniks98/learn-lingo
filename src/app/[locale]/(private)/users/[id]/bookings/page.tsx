// src/app/[locale]/users/[id]/bookings/page.tsx
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import BookingsList from '@/components/bookings/bookings-list';
import { getBookings } from '@/lib/api/bookings';
import { getFavorites } from '@/lib/api/favorites';

interface Props {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

export default async function BookingsPage({ params }: Props) {
  const { locale } = await params;

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['bookings'],
    queryFn: getBookings,
  });

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
      <BookingsList />
    </HydrationBoundary>
  );
}
