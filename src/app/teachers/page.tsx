import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { getAllTeachers } from '@/lib/db/teachers';
import TeachersList from '@/app/components/ui/teachers-list';

export default async function TeachersPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['teachers'],
    queryFn: getAllTeachers,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TeachersList />
    </HydrationBoundary>
  );
}
