// src/app/teachers/@modal/[id]/page.tsx
import { notFound } from 'next/navigation';
import BookingFormModal from '@/components/modal/booking-form-modal';
import { getTeacherById } from '@/lib/api/teachers';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function BookingPage({ params }: Props) {
  const { id: teacherId } = await params;

  const teacher = await getTeacherById(teacherId);
  if (!teacher) return notFound();

  return <BookingFormModal isOpen={true} teacher={teacher} />;
}
