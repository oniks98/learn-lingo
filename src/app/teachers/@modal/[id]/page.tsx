'use client';

import { useRouter, useParams } from 'next/navigation';
import BookingFormModal from '@/app/components/modal/booking-form-modal';

export default function BookingModalRoute() {
  const router = useRouter();
  const params = useParams();
  const teacherId = params.id as string;

  if (!teacherId) return null;

  return (
    <BookingFormModal
      isOpen={true}
      onCloseAction={() => router.back()}
      teacherId={teacherId}
    />
  );
}
