'use client';

import Modal from '@/app/components/modal/modal';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { getAllTeachers } from '@/lib/api/teachers';
import type { TeacherPreview } from '@/lib/types/types';

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
  const { register, handleSubmit } = useForm();

  const { data: teachers = [] } = useQuery<TeacherPreview[]>({
    queryKey: ['teachers'],
    queryFn: getAllTeachers,
  });

  const teacher = teachers.find((t) => t.id === teacherId);

  const onSubmit = (data: any) => {
    console.log({ ...data, teacherId });
    onCloseAction();
  };

  return (
    <Modal
      isOpen={isOpen}
      onCloseAction={onCloseAction}
      title="Book trial lesson"
    >
      <p className="text-gray-muted mb-4 text-sm leading-[1.43]">
        Our experienced tutor will assess your current language level, discuss
        your learning goals, and tailor the lesson to your specific needs.
      </p>

      {teacher && (
        <div className="mb-6 flex items-center gap-3">
          <Image
            src={teacher.avatar_url}
            alt="Teacher avatar"
            width={40}
            height={40}
            className="rounded-full"
          />
          <p className="text-sm font-medium">
            <span className="text-gray-muted block">Your teacher</span>
            <span>
              {teacher.name} {teacher.surname}
            </span>
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <fieldset className="space-y-2">
          <legend className="mb-1 text-base font-semibold">
            What is your main reason for learning English?
          </legend>
          {[
            'Career and business',
            'Lesson for kids',
            'Living abroad',
            'Exams and coursework',
            'Culture, travel or hobby',
          ].map((reason) => (
            <label key={reason} className="flex items-center gap-2">
              <input
                type="radio"
                {...register('reason')}
                value={reason}
                className="accent-yellow"
              />
              <span>{reason}</span>
            </label>
          ))}
        </fieldset>

        <input
          {...register('name')}
          type="text"
          placeholder="Full Name"
          className="border-gray-muted w-full rounded-xl border p-3"
        />

        <input
          {...register('email')}
          type="email"
          placeholder="Email"
          className="border-gray-muted w-full rounded-xl border p-3"
        />

        <input
          {...register('phone')}
          type="tel"
          placeholder="Phone number"
          className="border-gray-muted w-full rounded-xl border p-3"
        />

        <button
          type="submit"
          className="bg-yellow text-dark w-full rounded-xl py-4 font-semibold"
        >
          Book
        </button>
      </form>
    </Modal>
  );
}
