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

export default async function UserProfilePage({ params }: Props) {
  const { id } = await params;
  const queryClient = new QueryClient();

  try {
    await queryClient.prefetchQuery({
      queryKey: ['userStats'],
      queryFn: getUserStats,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Could not prefetch user stats:', error);
    }
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProfileList userId={id} />
    </HydrationBoundary>
  );
}
