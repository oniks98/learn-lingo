// переробити на сервер для not found
'use client';

import { useRouter, useParams } from 'next/navigation';
import BookingFormModal from '@/app/components/modal/booking-form-modal';
import { notFound } from 'next/navigation';

export default function BookingModalRoute() {
  const router = useRouter();
  const params = useParams();
  const teacherId = params.id as string;

  if (!teacherId) return notFound();

  return (
    <BookingFormModal
      isOpen={true}
      onCloseAction={() => router.back()}
      teacherId={teacherId}
    />
  );
}
