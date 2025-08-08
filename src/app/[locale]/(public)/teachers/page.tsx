// src/app/[locale]/teachers/page.tsx

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { getAllTeachers } from '@/lib/api/teachers';
import TeachersList from '@/components/teachers/teachers-list';
import EmailVerificationHandler from '@/components/handlers/email-verification-handler';
import PasswordResetHandler from '@/components/handlers/password-reset-handler';
import EmailChangeHandler from '@/components/handlers/email-change-handler';

interface Props {
  params: Promise<{
    locale: string;
  }>;
}

export default async function TeachersPage({ params }: Props) {
  const { locale } = await params;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['teachers', locale],
    queryFn: () => getAllTeachers(locale),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TeachersList />
      <EmailVerificationHandler />
      <PasswordResetHandler />
      <EmailChangeHandler />
    </HydrationBoundary>
  );
}
