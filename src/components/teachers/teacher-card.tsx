// src/components/teachers/teacher-card.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { TeacherPreview, TeacherExtraInfo, Review } from '@/lib/types/types';
import { getTeacherExtraInfo } from '@/lib/api/teachers';
import { useFavoriteStatus, useToggleFavorite } from '@/hooks/use-favorites';
import { useCurrencyConverter } from '@/hooks/use-currency-converter';
import { useAuth } from '@/contexts/auth-context';
import { savePendingAction } from '@/lib/utils/pending-actions';
import Loader from '@/components/ui/loader';
import Image from 'next/image';
import SeparatorIcon from '@/lib/icons/separator.svg';
import BookIcon from '@/lib/icons/book.svg';
import OnlineIcon from '@/lib/icons/online.svg';
import StarIcon from '@/lib/icons/star.svg';
import HeartIcon from '@/lib/icons/heart';
import Button from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

import { getFunnyAvatarForTeacher } from '@/lib/constants/avatars';

type Props = {
  teacher: TeacherPreview;
  level: string;
  pendingFavoriteTeacherId?: string;
};

export default function TeacherCard({
  teacher,
  level,
  pendingFavoriteTeacherId,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { formatPrice } = useCurrencyConverter();
  const t = useTranslations('teacherCard');

  // Мемоизируем смешной аватар для текущего учителя
  const funnyAvatar = useMemo(
    () => getFunnyAvatarForTeacher(teacher.id),
    [teacher.id],
  );

  const { data: extraInfo, isLoading } = useQuery<TeacherExtraInfo | null>({
    queryKey: ['teacherExtra', teacher.id],
    queryFn: () => getTeacherExtraInfo(teacher.id),
    enabled: expanded,
  });

  const { data: isFavorite = false } = useFavoriteStatus(teacher.id);
  const { toggleFavorite, isLoading: isFavoriteLoading } = useToggleFavorite();

  const isPendingFavorite = pendingFavoriteTeacherId === teacher.id;
  const displayAsFavorite = isFavorite || isPendingFavorite;

  const handleFavoriteClick = () => {
    if (!user || !user.emailVerified) {
      savePendingAction({
        type: 'favorite',
        teacherId: teacher.id,
      });
      router.push('/signup');
      return;
    }
    toggleFavorite(teacher.id, isFavorite);
  };

  const handleBookingClick = () => {
    if (!user || !user.emailVerified) {
      savePendingAction({
        type: 'booking',
        teacherId: teacher.id,
      });
      router.push('/signup');
      return;
    }
    router.push(`/teachers/${teacher.id}`, { scroll: false });
  };

  // Определяем какой аватар показывать
  const currentAvatar = expanded ? funnyAvatar : teacher.avatar_url;
  const avatarAlt = expanded
    ? `${teacher.name} ${teacher.surname} (funny avatar)`
    : `${teacher.name} ${teacher.surname}`;

  return (
    <section
      className={clsx(
        'rounded-xl bg-white p-6 shadow transition-all duration-300',
      )}
    >
      <div
        className={clsx(
          '@container grid gap-x-[3.92cqw]',
          'md:grid-cols-[120px_1fr] md:grid-rows-[auto_56px_repeat(5,auto)]',
          'xl:grid-rows-[32px_56px_repeat(5,auto)]',
        )}
      >
        <div
          className={clsx(
            'border-yellow relative mb-[2.61cqw]',
            'grid h-30 w-30 place-items-center',
            'justify-self-center rounded-full border-3',
            'sm:row-1 md:row-[1/3]',
          )}
        >
          <div className="relative h-24 w-24 overflow-hidden rounded-full">
            <Image
              fill
              sizes="96px"
              src={currentAvatar}
              alt={avatarAlt}
              className="object-cover transition-all duration-500 ease-in-out"
              key={expanded ? 'funny' : 'original'}
            />
          </div>
          <OnlineIcon className="absolute top-[19px] right-[23px] h-3 w-3" />
        </div>

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
            {t('languages')}
          </span>

          <span className="grid grid-cols-[repeat(2,auto)] items-center">
            <BookIcon className="mr-1 h-4 w-4" />
            <span className="font-medium">{t('lessonsOnline')}</span>
          </span>

          <span className="px-[1.3cqw]">
            <SeparatorIcon className="h-4 w-0.5" />
          </span>

          <span className="grid grid-cols-[repeat(2,auto)] items-center">
            <span className="font-medium">{t('lessonsDone')}</span>
            <span>{teacher.lessons_done}</span>
          </span>

          <span className="px-[1.3cqw]">
            <SeparatorIcon className="h-4 w-0.5" />
          </span>

          <span className="grid grid-cols-[repeat(3,auto)] items-center">
            <StarIcon className="mr-1 h-4 w-4" />
            <span className="font-medium">{t('rating')}</span>
            <span>{teacher.rating.toFixed(1)}</span>
          </span>

          <span className="px-[1.3cqw]">
            <SeparatorIcon className="h-4 w-0.5" />
          </span>

          <span className="mr-4 grid grid-cols-[repeat(2,auto)] items-center">
            <span className="font-medium">{t('pricePerHour')}</span>
            <span className="text-green ml-1 font-medium">
              {formatPrice(teacher.price_per_hour)}
            </span>
          </span>

          <button
            onClick={handleFavoriteClick}
            disabled={isFavoriteLoading}
            className={clsx(
              'text-right transition-all duration-200 xl:grow-1',
              'hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50',
              isFavoriteLoading && 'animate-pulse',
            )}
            aria-label={
              displayAsFavorite ? t('removeFromFavorites') : t('addToFavorites')
            }
          >
            <HeartIcon
              className={clsx(
                'inline-block h-[26px] w-[26px] transition-colors duration-200',
                displayAsFavorite
                  ? 'fill-yellow stroke-yellow'
                  : 'hover:text-yellow fill-none text-black',
              )}
            />
          </button>
        </div>

        <h2
          className={clsx(
            'row-2 mb-[2.61cqw] text-2xl font-medium',
            'sm:justify-self-center md:col-2 md:justify-self-start',
          )}
        >
          {teacher.name} {teacher.surname}
        </h2>

        <ul
          className={clsx(
            'gap-2font-medium mb-2 grid',
            'md:col-[1/3] md:row-[3/4] xl:col-2 xl:row-3',
          )}
        >
          <li>
            <p>
              <span className="text-gray-muted">{t('speaks')}</span>{' '}
              <span className="underline">{teacher.languages.join(', ')}</span>
            </p>
          </li>
          <li>
            <p>
              <span className="text-gray-muted">{t('lessonInfo')}</span>{' '}
              {teacher.lesson_info}
            </p>
          </li>
          <li>
            <p>
              <span className="text-gray-muted">{t('conditions')}</span>{' '}
              {teacher.conditions.join(', ')}
            </p>
          </li>
        </ul>

        <Button
          onClick={() => setExpanded((v) => !v)}
          className={clsx(
            'hover:text-yellow mb-[1.96cqw] w-23',
            'py-2font-medium bg-white px-0 underline hover:bg-white',
            'md:col-[1/3] md:row-[4/5] xl:col-2 xl:row-4',
          )}
        >
          <span className="animated-text">
            {(expanded ? t('showLess') : t('readMore'))
              .split('')
              .map((char, index) => (
                <span
                  key={index}
                  className="animated-letter"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
          </span>
        </Button>

        {expanded &&
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
            <p className="text-yellow">{t('errorLoadingDetails')}</p>
          ))}

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
                  level === lev && 'bg-yellow',
                )}
              >
                {lev}
              </p>
            </li>
          ))}
        </ul>

        {expanded && (
          <Button
            className={clsx(
              'max-w-88 px-[4.55cqw]',
              'sm:justify-self-center',
              'md:col-[1/3] md:row-[7/8] md:justify-self-start',
              'xl:col-2 xl:row-7',
            )}
            onClick={handleBookingClick}
          >
            <span className="leading-[1.56]">{t('bookTrialLesson')}</span>
          </Button>
        )}
      </div>
    </section>
  );
}
