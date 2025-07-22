'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import Modal from '@/components/modal/modal';
import Button from '@/components/ui/button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import {
  bookingSchema,
  type BookingFormValues,
} from '@/lib/validation/booking';
import { learningReasons } from '@/lib/constants/reasons';
import type { TeacherInfoModal } from '@/lib/types/types';
import { useAuth } from '@/contexts/auth-context';
import { createBooking } from '@/lib/api/bookings'; // Import the API function
import RadioButtonIcon from '@/lib/icons/radio';

interface Props {
  isOpen: boolean;
  teacher: TeacherInfoModal;
}

export default function BookingFormModal({ isOpen, teacher }: Props) {
  const router = useRouter();
  const { user } = useAuth();

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
    },
  });

  const selectedReason = useWatch({ control, name: 'reason' });

  const [sending, setSending] = useState(false);

  const onSubmit = async (formData: BookingFormValues) => {
    // Check if user exists before proceeding
    if (!user) {
      toast.error('You must be logged in to book a lesson.');
      return;
    }

    // Prepare booking data (without userId as it's added by the API function)
    const bookingData = {
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

      // Use the createBooking function which handles authentication
      await createBooking(bookingData);

      // After successful booking, send confirmation email
      const emailPayload = {
        userId: user.uid,
        ...bookingData,
      };

      const emailResponse = await fetch('/api/send-booking-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload),
      });

      if (!emailResponse.ok) {
        const emailResult = await emailResponse.json();
        console.warn('Email sending failed:', emailResult.error);
        // Don't fail the entire process if email fails
        toast.success(
          'Booking created successfully, but email notification failed.',
        );
      } else {
        toast.success('Your booking was sent successfully.');
      }

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
