// src/app/[lokale]/teachers/page.tsx
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { getAllTeachers } from '@/lib/api/teachers';
import TeachersList from '@/components/teachers/teachers-list';
import EmailVerificationHandler from '@/components/handlers/email-verification-handler';
import PasswordResetHandler from '@/components/handlers/password-reset-handler';

export default async function TeachersPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['teachers'],
    queryFn: getAllTeachers,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TeachersList />
      <EmailVerificationHandler />
      <PasswordResetHandler />
    </HydrationBoundary>
  );
}
