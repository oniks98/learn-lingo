// src/app/components/ui/booking-card.tsx
'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookingData, TeacherExtraInfo, Review } from '@/lib/types/types';
import { getTeacherExtraInfo } from '@/lib/db/teachers';
import { deleteBooking } from '@/lib/api/bookings';
import Loader from '@/components/ui/loader';
import Image from 'next/image';
import SeparatorIcon from '@/lib/icons/separator.svg';
import BookIcon from '@/lib/icons/book.svg';
import OnlineIcon from '@/lib/icons/online.svg';
import StarIcon from '@/lib/icons/star.svg';
import HeartIcon from '@/lib/icons/heart.svg';
import Button from '@/components/ui/button';
import clsx from 'clsx';

type Props = {
  booking: BookingData;
  teacher?: {
    name: string;
    surname: string;
    avatar_url: string;
    languages: string[];
    lesson_info: string;
    conditions: string[];
    lessons_done: number;
    rating: number;
    price_per_hour: number;
    levels: string[];
  };
};

export default function BookingCard({ booking, teacher }: Props) {
  const [expanded, setExpanded] = useState(false);
  const queryClient = useQueryClient();

  const { data: extraInfo, isLoading } = useQuery<TeacherExtraInfo | null>({
    queryKey: ['teacherExtra', booking.teacherId],
    queryFn: () => getTeacherExtraInfo(booking.teacherId),
    enabled: expanded && !!teacher,
  });

  const deleteBookingMutation = useMutation({
    mutationFn: deleteBooking,
    onSuccess: () => {
      // Обновляем кэш после удаления
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  const handleDelete = () => {
    if (confirm('Вы уверены, что хотите удалить это бронирование?')) {
      deleteBookingMutation.mutate(booking.id);
    }
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
          'md:grid-cols-[120px_1fr] md:grid-rows-[auto_56px_repeat(6,auto)]',
          'xl:grid-rows-[32px_56px_repeat(6,auto)]',
        )}
      >
        {/* Аватар учителя или заглушка */}
        <div
          className={clsx(
            'border-yellow relative mb-[2.61cqw]',
            'grid h-30 w-30 place-items-center justify-self-center',
            'rounded-full border-3 sm:row-1 md:row-[1/3]',
          )}
        >
          {teacher ? (
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

        {/* Информация о бронировании */}
        <div
          className={clsx(
            'mb-2 flex flex-wrap items-center self-start',
            'md:col-2 md:row-1',
          )}
        >
          <span
            className={clsx(
              'text-gray-muted w-full font-medium xl:w-min xl:grow-3',
            )}
          >
            Booking Info
          </span>

          <span className="grid grid-cols-[repeat(2,auto)] items-center">
            <BookIcon className="mr-1 h-4 w-4" />
            <span className="font-medium">Teacher ID: {booking.teacherId}</span>
          </span>

          <span className="px-[1.3cqw]">
            <SeparatorIcon className="h-4 w-0.5" />
          </span>

          <span className="grid grid-cols-[repeat(2,auto)] items-center">
            <span className="font-medium">Created:</span>
            <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
          </span>

          {teacher && (
            <>
              <span className="px-[1.3cqw]">
                <SeparatorIcon className="h-4 w-0.5" />
              </span>

              <span className="grid grid-cols-[repeat(3,auto)] items-center">
                <StarIcon className="mr-1 h-4 w-4" />
                <span className="font-medium">Rating:</span>
                <span>{teacher.rating.toFixed(1)}</span>
              </span>

              <span className="px-[1.3cqw]">
                <SeparatorIcon className="h-4 w-0.5" />
              </span>

              <span className="mr-4 grid grid-cols-[repeat(3,auto)] items-center">
                <span className="font-medium">Price / 1 hour:</span>
                <span className="text-green">{teacher.price_per_hour}</span>
                <span className="text-green">$</span>
              </span>
            </>
          )}

          <span className="text-right xl:grow-1">
            <HeartIcon className="inline-block h-[26px] w-[26px]" />
          </span>
        </div>

        {/* Имя и фамилия */}
        <h2
          className={clsx(
            'row-2 mb-[2.61cqw] text-2xl font-medium',
            'sm:justify-self-center md:col-2 md:justify-self-start',
          )}
        >
          {teacher ? `${teacher.name} ${teacher.surname}` : booking.name}
        </h2>

        {/* Основная информация о бронировании */}
        <ul
          className={clsx(
            'gap-2font-medium mb-2 grid',
            'md:col-[1/3] md:row-[3/4] xl:col-2 xl:row-3',
          )}
        >
          <li>
            <p>
              <span className="text-gray-muted">Student Name:</span>{' '}
              <span className="underline">{booking.name}</span>
            </p>
          </li>
          <li>
            <p>
              <span className="text-gray-muted">Email:</span> {booking.email}
            </p>
          </li>
          <li>
            <p>
              <span className="text-gray-muted">Phone:</span> {booking.phone}
            </p>
          </li>
          <li>
            <p>
              <span className="text-gray-muted">Reason:</span> {booking.reason}
            </p>
          </li>
          {teacher && (
            <>
              <li>
                <p>
                  <span className="text-gray-muted">Speaks:</span>{' '}
                  <span className="underline">
                    {teacher.languages.join(', ')}
                  </span>
                </p>
              </li>
              <li>
                <p>
                  <span className="text-gray-muted">Lesson Info:</span>{' '}
                  {teacher.lesson_info}
                </p>
              </li>
              <li>
                <p>
                  <span className="text-gray-muted">Conditions:</span>{' '}
                  {teacher.conditions.join(', ')}
                </p>
              </li>
            </>
          )}
        </ul>

        {/* Кнопка Read more/Show less */}
        {teacher && (
          <Button
            onClick={() => setExpanded((v) => !v)}
            className={clsx(
              'hover:text-yellow mb-[1.96cqw] w-[78px]',
              'py-2font-medium bg-white px-0 underline hover:bg-white',
              'md:col-[1/3] md:row-[4/5] xl:col-2 xl:row-4',
            )}
          >
            {expanded ? 'Show less' : 'Read more'}
          </Button>
        )}

        {/* Дополнительная информация */}
        {expanded &&
          teacher &&
          (isLoading ? (
            <Loader />
          ) : extraInfo ? (
            <div
              className={clsx(
                'font-medium',
                'md:col-[1/3] md:row-[5/6] xl:col-2 xl:row-5',
              )}
            >
              <p className="mb-[2.61cqw]">{extraInfo.experience}</p>
              <ul className="mb-[2.61cqw] space-y-2">
                {extraInfo.reviews.map((rev: Review, idx: number) => (
                  <li key={idx}>
                    <span className="text-gray-muted mr-2">
                      {rev.reviewer_name}
                    </span>
                    <StarIcon className="mr-2 inline h-4 w-4" />
                    <span>{rev.reviewer_rating}</span>
                    <p>{rev.comment}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-yellow">Error loading details.</p>
          ))}

        {/* Уровни */}
        {teacher && (
          <ul
            className={clsx(
              'mb-[2.61cqw] flex flex-wrap gap-2',
              'md:col-[1/3] md:row-[6/7] xl:col-2 xl:row-6',
            )}
          >
            {teacher.levels.map((lev, idx) => (
              <li key={idx}>
                <p
                  className={clsx(
                    'border-gray-muted rounded-[35px] border px-3 py-2 text-sm leading-[1.14] font-medium',
                  )}
                >
                  {lev}
                </p>
              </li>
            ))}
          </ul>
        )}

        {/* Кнопка удаления бронирования */}
        <Button
          className={clsx(
            'max-w-58 bg-red-500 px-[4.55cqw] text-white hover:bg-red-600',
            'sm:justify-self-center',
            'md:col-[1/3] md:row-[7/8] md:justify-self-start',
            'xl:col-2 xl:row-7',
            deleteBookingMutation.isPending && 'cursor-not-allowed opacity-50',
          )}
          onClick={handleDelete}
          disabled={deleteBookingMutation.isPending}
        >
          <span className="leading-[1.56]">
            {deleteBookingMutation.isPending
              ? 'Удаление...'
              : 'Удалить Бронирование'}
          </span>
        </Button>
      </div>
    </section>
  );
}
