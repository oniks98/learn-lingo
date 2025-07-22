// src/app/users/[id]/bookings/page.tsx

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import BookingsList from '@/components/ui/bookings-list';

export default async function BookingsPage() {
  const queryClient = new QueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BookingsList />
    </HydrationBoundary>
  );
}
