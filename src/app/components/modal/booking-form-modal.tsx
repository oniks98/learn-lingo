'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import Modal from '@/app/components/modal/modal';
import Button from '@/app/components/ui/button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { createBooking, type BookingData } from '@/lib/db/bookings';
import {
  bookingSchema,
  type BookingFormValues,
} from '@/lib/validation/booking';
import { learningReasons } from '@/lib/constants/reasons';
import type { TeacherInfoModal } from '@/lib/types/types';
import RadioButtonIcon from '@/lib/icons/radio';

interface Props {
  isOpen: boolean;
  teacher: TeacherInfoModal;
}

export default function BookingFormModal({ isOpen, teacher }: Props) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<BookingFormValues>({ resolver: zodResolver(bookingSchema) });

  // NOTE: дає змогу підписатися на зміну значення одного або
  // декількох полів форми без ре‑рендеру всього компонента форми.
  const selectedReason = useWatch({ control, name: 'reason' });

  const [sending, setSending] = useState(false);

  const onSubmit = async (formData: BookingFormValues) => {
    const booking: BookingData = {
      teacherId: teacher.id,
      teacherName: teacher.name,
      teacherSurname: teacher.surname,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      reason: formData.reason,
      createdAt: Date.now(),
    };

    try {
      setSending(true);
      // NOTE: запис бронювання у базу
      await createBooking(booking);

      // NOTE: відправлення листа з підтвердженням
      const response = await fetch('/api/sendBookingEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking),
      });
      const result = await response.json();
      if (!result.ok) {
        toast.error(result.error || 'Failed to send email.');
        return;
      }
      toast.success('Your booking was sent successfully.');
      reset();
      router.back();
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onCloseAction={() => router.back()}
      title="Book trial lesson"
    >
      <p className="text-gray-muted mb-5 leading-snug">
        Our tutor will assess your level and tailor the lesson.
      </p>

      <div className="mb-8 flex items-center gap-4">
        <Image
          src={teacher.avatar_url}
          alt={`${teacher.name} ${teacher.surname}`}
          width={44}
          height={44}
          className="rounded-full"
        />
        <div>
          <p className="text-gray-muted text-sm">Your teacher</p>
          <p className="font-medium">
            {teacher.name} {teacher.surname}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <fieldset className="space-y-3">
          <legend className="text-lg font-medium">Reason for learning</legend>
          {learningReasons.map((reason) => {
            const selected = selectedReason === reason;
            return (
              <label key={reason} className="flex items-center gap-2">
                <input
                  type="radio"
                  value={reason}
                  {...register('reason')}
                  className="sr-only"
                />
                {selected ? (
                  <RadioButtonIcon />
                ) : (
                  <div className="h-5 w-5 rounded-full border" />
                )}
                <span>{reason}</span>
              </label>
            );
          })}
          {errors.reason && (
            <p className="text-sm text-red-600">{errors.reason.message}</p>
          )}
        </fieldset>

        <input
          {...register('name')}
          placeholder="Full Name"
          className="w-full rounded-xl border p-3"
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}

        <input
          {...register('email')}
          type="email"
          placeholder="Email"
          className="w-full rounded-xl border p-3"
        />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email.message}</p>
        )}

        <input
          {...register('phone')}
          type="tel"
          placeholder="Phone"
          className="w-full rounded-xl border p-3"
        />
        {errors.phone && (
          <p className="text-sm text-red-600">{errors.phone.message}</p>
        )}

        <Button type="submit" disabled={sending} className="w-full">
          {sending ? 'Sending…' : 'Book'}
        </Button>
      </form>
    </Modal>
  );
}
