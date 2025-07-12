'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import Modal from '@/app/components/modal/modal';
import Image from 'next/image';
import { getAllTeachers } from '@/lib/api/teachers';
import { createBooking, type BookingData } from '@/lib/api/bookings';
import type { TeacherPreview } from '@/lib/types/types';
import { learningReasons } from '@/lib/constants/reasons';
import RadioButtonIcon from '@/lib/icons/radio';

interface Props {
  isOpen: boolean;
  onCloseAction: () => void;
  teacherId: string;
}

type BookingFormValues = {
  name: string;
  email: string;
  phone: string;
  reason: string;
};

export default function BookingFormModal({
  isOpen,
  onCloseAction,
  teacherId,
}: Props) {
  const { register, handleSubmit, reset } = useForm<BookingFormValues>();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedReason, setSelectedReason] = useState<string | null>(null);

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
      await createBooking(booking);

      const response = await fetch('/api/sendBookingEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking),
      });

      const result = await response.json();
      if (!result.ok) {
        setError(result.error || 'Email send failed');
        return;
      }

      reset();
      onCloseAction();
    } catch (err: any) {
      setError(err.message || 'Unknown error');
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <fieldset className="space-y-4">
          <legend className="mb-5 text-2xl leading-[1.33] font-medium">
            What is your main reason for learning English?
          </legend>
          {learningReasons.map((reason) => (
            <label
              key={reason}
              className="flex cursor-pointer items-center gap-3"
            >
              <input
                type="radio"
                value={reason}
                className="hidden"
                {...register('reason', {
                  required: true,
                  onChange: (e) => setSelectedReason(e.target.value),
                })}
              />
              <RadioButtonIcon selected={selectedReason === reason} />
              <span>{reason}</span>
            </label>
          ))}
        </fieldset>

        <input
          {...register('name', { required: true })}
          type="text"
          placeholder="Full Name"
          className="border-gray-muted w-full rounded-xl border p-3"
        />
        <input
          {...register('email', { required: true })}
          type="email"
          placeholder="Email"
          className="border-gray-muted w-full rounded-xl border p-3"
        />
        <input
          {...register('phone', { required: true })}
          type="tel"
          placeholder="Phone number"
          className="border-gray-muted w-full rounded-xl border p-3"
        />

        {error && <p className="text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={sending}
          className="bg-yellow text-dark w-full rounded-xl py-4 font-semibold disabled:opacity-50"
        >
          {sending ? 'Sending…' : 'Book'}
        </button>
      </form>
    </Modal>
  );
}
