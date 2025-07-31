// src/app/[locale]/users/[id]/profile/page.tsx
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import ProfileList from '@/components/profile/profile-list';

import { getUserStats } from '@/lib/api/profile';

interface Props {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

export default async function UserProfilePage({
  params: paramsPromise,
}: Props) {
  const params = await paramsPromise;
  const queryClient = new QueryClient();

  // Префетчуємо статистику користувача
  try {
    await queryClient.prefetchQuery({
      queryKey: ['userStats'],
      queryFn: getUserStats,
    });
  } catch (error) {
    // Якщо помилка при префетчингу, просто не префетчуємо
    console.log('Could not prefetch user stats:', error);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProfileList userId={params.id} />
    </HydrationBoundary>
  );
}
