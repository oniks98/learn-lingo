// src/app/components/ui/booking-card.tsx
'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookingData, TeacherInfoModal } from '@/lib/types/types';
import { getTeacherById } from '@/lib/api/teachers';
import { deleteBooking } from '@/lib/api/bookings';
import Loader from '@/components/ui/loader';
import Image from 'next/image';
import OnlineIcon from '@/lib/icons/online.svg';
import HeartIcon from '@/lib/icons/heart.svg';
import Button from '@/components/ui/button';
import clsx from 'clsx';

type Props = {
  booking: BookingData;
};

export default function BookingCard({ booking }: Props) {
  const queryClient = useQueryClient();

  // Fetch teacher data
  const { data: teacher, isLoading: isLoadingTeacher } =
    useQuery<TeacherInfoModal | null>({
      queryKey: ['teacher', booking.teacherId],
      queryFn: () => getTeacherById(booking.teacherId),
      enabled: !!booking.teacherId,
    });

  const deleteBookingMutation = useMutation({
    mutationFn: deleteBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this reservation?')) {
      deleteBookingMutation.mutate(booking.id);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatBookingDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  return (
    <section
      className={clsx(
        'rounded-xl bg-white p-6 shadow transition-all duration-300',
      )}
    >
      <div
        className={clsx(
          '@container grid gap-x-[3.92cqw]',
          'md:grid-cols-[120px_1fr] md:grid-rows-[auto_56px_repeat(4,auto)]',
          'xl:grid-rows-[32px_56px_repeat(4,auto)]',
        )}
      >
        {/* Teacher Avatar */}
        <div
          className={clsx(
            'border-yellow relative mb-[2.61cqw]',
            'grid h-30 w-30 place-items-center justify-self-center',
            'rounded-full border-3 sm:row-1 md:row-[1/3]',
          )}
        >
          {isLoadingTeacher ? (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200">
              <Loader />
            </div>
          ) : teacher ? (
            <>
              <Image
                width={96}
                height={96}
                src={teacher.avatar_url}
                alt={`${teacher.name} ${teacher.surname}`}
                className={clsx('rounded-full')}
              />
              <OnlineIcon
                className={clsx('absolute top-[19px] right-[23px] h-3 w-3')}
                aria-hidden="true"
              />
            </>
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200">
              <span className="text-sm text-gray-500">No Photo</span>
            </div>
          )}
        </div>

        {/* Booking Header Info */}
        <div
          className={clsx(
            'mb-2 flex flex-wrap items-center justify-between self-start',
            'md:col-2 md:row-1',
          )}
        >
          <span className={clsx('text-gray-muted font-medium')}>Booking</span>

          <span className="text-right">
            <HeartIcon className="inline-block h-[26px] w-[26px]" />
          </span>
        </div>

        {/* Teacher Name */}
        <h2
          className={clsx(
            'row-2 mb-[2.61cqw] text-2xl font-medium',
            'sm:justify-self-center md:col-2 md:justify-self-start',
          )}
        >
          {teacher ? `${teacher.name} ${teacher.surname}` : 'Loading...'}
        </h2>

        {/* Main Booking Information */}
        <ul
          className={clsx(
            'mb-2 grid gap-2 font-medium',
            'md:col-[1/3] md:row-[3/4] xl:col-2 xl:row-3',
          )}
        >
          <li>
            <p>
              <span className="text-gray-muted">Reason:</span> {booking.reason}
            </p>
          </li>
          <li>
            <p>
              <span className="text-gray-muted">Lesson Date:</span>{' '}
              <span className="font-semibold text-blue-600">
                {formatBookingDate(booking.bookingDate)}
              </span>
            </p>
          </li>
          {booking.comment && (
            <li>
              <p>
                <span className="text-gray-muted">Comment:</span>{' '}
                {booking.comment}
              </p>
            </li>
          )}
          <li>
            <p>
              <span className="text-gray-muted">Created:</span>{' '}
              {formatDate(booking.createdAt)}
            </p>
          </li>
          {teacher && (
            <li>
              <p>
                <span className="text-gray-muted">Teacher Languages:</span>{' '}
                <span className="underline">
                  {/* We'll need to get languages from the full teacher data */}
                  Available on request
                </span>
              </p>
            </li>
          )}
        </ul>

        {/* Delete Button */}
        <Button
          className={clsx(
            'max-w-58 px-[3.55cqw]',
            'sm:justify-self-center',
            'md:col-[1/3] md:row-[7/8] md:justify-self-start',
            'xl:col-2 xl:row-7',
            deleteBookingMutation.isPending && 'cursor-not-allowed opacity-50',
          )}
          onClick={handleDelete}
          disabled={deleteBookingMutation.isPending}
        >
          <span className="leading-[1.56]">
            {deleteBookingMutation.isPending ? 'Deleting...' : 'Delete booking'}
          </span>
        </Button>
      </div>
    </section>
  );
}
