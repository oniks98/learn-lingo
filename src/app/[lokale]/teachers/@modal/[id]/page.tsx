// src/app/teachers/@modal/[id]/page.tsx
import { notFound } from 'next/navigation';
import BookingFormModal from '@/components/modal/booking-form-modal';
import { getTeacherById } from '@/lib/api/teachers';

export default async function BookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: teacherId } = await params;
  if (!teacherId) return notFound();

  const teacher = await getTeacherById(teacherId);
  if (!teacher) return notFound();

  return <BookingFormModal isOpen={true} teacher={teacher} />;
}
