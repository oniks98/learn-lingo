'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import Modal from '@/app/components/modal/modal';
import Button from '@/app/components/ui/button';
import Image from 'next/image';

import { getAllTeachers } from '@/lib/api/teachers';
import { createBooking, type BookingData } from '@/lib/api/bookings';
import {
  bookingSchema,
  type BookingFormValues,
} from '@/lib/validation/booking';
import { learningReasons } from '@/lib/constants/reasons';
import type { TeacherPreview } from '@/lib/types/types';
import RadioButtonIcon from '@/lib/icons/radio';

interface Props {
  isOpen: boolean;
  onCloseAction: () => void;
  teacherId: string;
}

export default function BookingFormModal({
  isOpen,
  onCloseAction,
  teacherId,
}: Props) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
  });

  const selectedReason = useWatch({ control, name: 'reason' });
  const [sending, setSending] = useState(false);

  const { data: teachers = [] } = useQuery<TeacherPreview[]>({
    queryKey: ['teachers'],
    queryFn: getAllTeachers,
  });

  const teacher = teachers.find((t) => t.id === teacherId);

  const onSubmit = async (formData: BookingFormValues) => {
    if (!teacher) return;

    const booking: BookingData = {
      teacherId,
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

      await createBooking(booking);

      const response = await fetch('/api/sendBookingEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking),
      });

      const result = await response.json();

      if (!result.ok) {
        toast.error(
          result.error || 'Failed to send email. Please try again later.',
        );
        return;
      }

      toast.success(
        'Your booking request was sent successfully. Please check your email.',
      );
      reset();
      onCloseAction();
    } catch (err: any) {
      toast.error(
        err.message || 'Something went wrong. Please try again later.',
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onCloseAction={onCloseAction}
      title="Book trial lesson"
    >
      <p className="text-shadow-gray-muted mb-5 leading-snug">
        Our experienced tutor will assess your current language level, discuss
        your learning goals, and tailor the lesson to your specific needs.
      </p>

      {teacher && (
        <div className="mb-10 flex items-center gap-[14px]">
          <Image
            src={teacher.avatar_url}
            alt={`${teacher.name} ${teacher.surname}`}
            width={44}
            height={44}
            className="rounded-full"
          />
          <p className="font-medium">
            <span className="text-gray-muted block text-sm leading-[1.33]">
              Your teacher
            </span>
            <span>
              {teacher.name} {teacher.surname}
            </span>
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-[18px]">
        <fieldset className="mb-10 space-y-4">
          <legend className="mb-5 text-2xl leading-[1.33] font-medium">
            What is your main reason for learning English?
          </legend>

          {learningReasons.map((reason) => {
            const selected = selectedReason === reason;

            return (
              <label
                key={reason}
                className="flex cursor-pointer items-center gap-2"
              >
                <input
                  type="radio"
                  value={reason}
                  {...register('reason')}
                  className="sr-only"
                />
                {selected ? (
                  <RadioButtonIcon />
                ) : (
                  <div className="border-gray-muted h-5 w-5 rounded-full border-2" />
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
          type="text"
          placeholder="Full Name"
          className="border-gray-muted w-full rounded-xl border p-4"
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}

        <input
          {...register('email')}
          type="email"
          placeholder="Email"
          className="border-gray-muted w-full rounded-xl border p-4"
        />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email.message}</p>
        )}

        <input
          {...register('phone')}
          type="tel"
          placeholder="Phone number"
          className="border-gray-muted mb-10 w-full rounded-xl border p-4"
        />
        {errors.phone && (
          <p className="text-sm text-red-600">{errors.phone.message}</p>
        )}

        <Button
          type="submit"
          disabled={sending}
          className="w-full disabled:opacity-50"
        >
          {sending ? 'Sending…' : 'Book'}
        </Button>
      </form>
    </Modal>
  );
}
