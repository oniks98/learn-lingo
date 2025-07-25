'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import Modal from '@/components/modal/modal';
import Button from '@/components/ui/button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import {
  bookingSchema,
  type BookingFormValues,
} from '@/lib/validation/booking';
import { learningReasons } from '@/lib/constants/reasons';
import type { TeacherInfoModal, TeacherPreview } from '@/lib/types/types';
import { useAuth } from '@/contexts/auth-context';
import { createBooking } from '@/lib/api/bookings';
import { getAllTeachers } from '@/lib/api/teachers';
import { sendBookingEmail } from '@/lib/api/send-booking-email';
import RadioButtonIcon from '@/lib/icons/radio';

interface Props {
  isOpen: boolean;
  teacher: TeacherInfoModal;
}

export default function BookingFormModal({ isOpen, teacher }: Props) {
  const router = useRouter();
  const { user } = useAuth();

  // Получаем всех учителей из кеша React Query
  const { data: teachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: getAllTeachers,
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      name: user?.username || '',
      email: user?.email || '',
      comment: '',
    },
  });

  const selectedReason = useWatch({ control, name: 'reason' });
  const [sending, setSending] = useState(false);

  const onSubmit = async (formData: BookingFormValues) => {
    if (!user) {
      toast.error('You must be logged in to book a lesson.');
      return;
    }

    // Находим полные данные учителя в кеше
    const fullTeacherData = teachers?.find(
      (t: TeacherPreview) => t.id === teacher.id,
    );

    if (!fullTeacherData) {
      toast.error('Teacher data not found. Please refresh the page.');
      return;
    }

    // Подготавливаем данные бронирования
    const bookingData = {
      userId: user.uid,
      teacherId: teacher.id,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      reason: formData.reason,
      bookingDate: formData.bookingDate,
      comment: formData.comment,
      createdAt: Date.now(),
    };

    try {
      setSending(true);

      // 1. Создаем бронирование
      const createdBooking = await createBooking(bookingData);

      // 2. Отправляем email с данными учителя из кеша
      const emailPayload = {
        ...createdBooking,
        teacherName: fullTeacherData.name,
        teacherSurname: fullTeacherData.surname,
      };

      try {
        await sendBookingEmail(emailPayload);
        toast.success(
          'Your booking was sent successfully and email confirmation was sent.',
        );
      } catch (emailError) {
        console.warn('Email sending failed:', emailError);
        toast.success(
          'Booking created successfully, but email notification failed.',
        );
      }

      // 3. Очищаем форму и закрываем модалку
      reset();
      router.back();
    } catch (err: any) {
      console.error('Booking error:', err);
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
        Our experienced tutor will assess your current language level, discuss
        your learning goals, and tailor the lesson to your specific needs.
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

        <input
          {...register('bookingDate')}
          type="datetime-local"
          placeholder="Booking Date"
          className="w-full rounded-xl border p-3"
        />
        {errors.bookingDate && (
          <p className="text-sm text-red-600">{errors.bookingDate.message}</p>
        )}

        <textarea
          {...register('comment')}
          placeholder="Comment (optional)"
          rows={3}
          className="w-full resize-none rounded-xl border p-3"
        />
        {errors.comment && (
          <p className="text-sm text-red-600">{errors.comment.message}</p>
        )}

        <Button type="submit" disabled={sending} className="w-full">
          {sending ? 'Sending…' : 'Book'}
        </Button>
      </form>
    </Modal>
  );
}
