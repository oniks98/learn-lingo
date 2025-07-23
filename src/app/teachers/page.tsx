// src/app/teachers/page.tsx
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { getAllTeachers } from '@/lib/api/teachers';
import TeachersList from '@/components/ui/teachers-list';
import EmailVerification from '@/components/email-verification';

export default async function TeachersPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['teachers'],
    queryFn: getAllTeachers,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TeachersList />
      <EmailVerification />
    </HydrationBoundary>
  );
}
