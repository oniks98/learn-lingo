// src/app/users/[id]/bookings/page.tsx
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import BookingsList from '@/components/ui/bookings-list';
import { getBookings } from '@/lib/api/bookings';

export default async function BookingsPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['bookings'],
    queryFn: getBookings,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BookingsList />
    </HydrationBoundary>
  );
}
