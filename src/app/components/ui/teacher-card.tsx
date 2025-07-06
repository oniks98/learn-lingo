'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TeacherPreview, TeacherExtraInfo, Review } from '@/lib/types/types';
import { getTeacherExtraInfo } from '@/lib/api/teachers';
import Loader from '@/app/components/ui/loader';
import Image from 'next/image';
import SeparatorIcon from '@/lib/icons/separator.svg';
import BookIcon from '@/lib/icons/book.svg';
import OnlineIcon from '@/lib/icons/online.svg';
import StarIcon from '@/lib/icons/star.svg';
import HeartIcon from '@/lib/icons/heart.svg';
import Button from '@/app/components/ui/button';
import { useRouter } from 'next/navigation';

type Props = {
  teacher: TeacherPreview;
};

export default function TeacherCard({ teacher }: Props) {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();

  const { data: extraInfo, isLoading } = useQuery<TeacherExtraInfo | null>({
    queryKey: ['teacherExtra', teacher.id],
    queryFn: () => getTeacherExtraInfo(teacher.id),
    enabled: expanded,
  });

  return (
    <div className="rounded-xl bg-white p-6 shadow transition-all duration-300">
      <div className="grid grid-cols-[120px_1fr] gap-12">
        <div className="border-yellow relative self-start rounded-full border-3 p-3">
          <Image
            width={96}
            height={96}
            src={teacher.avatar_url}
            alt={`${teacher.name} ${teacher.surname}`}
            className="rounded-full"
          />
          <OnlineIcon
            className="absolute top-[19px] right-[23px] h-3 w-3"
            aria-hidden="true"
          />
        </div>

        <div className="@container grid">
          <div className="mb-2 grid grid-cols-[auto_3fr_repeat(7,auto)_1fr_auto] items-center">
            <span className="text-gray-muted text-base leading-6 font-medium">
              Languages
            </span>
            <span className="col-3 grid grid-cols-[repeat(2,auto)] items-center">
              <BookIcon className="mr-1 h-4 w-4" />
              <span className="text-dark text-base leading-6 font-medium">
                Lessons online
              </span>
            </span>
            <span className="px-[1.5cqw]">
              <SeparatorIcon className="h-4 w-0.5" />
            </span>
            <span className="grid grid-cols-[repeat(2,auto)] items-center">
              <span className="text-dark text-base leading-6 font-medium">
                Lessons done:
              </span>
              <span>{teacher.lessons_done}</span>
            </span>
            <span className="px-[1.5cqw]">
              <SeparatorIcon className="h-4 w-0.5" />
            </span>
            <span className="grid grid-cols-[repeat(3,auto)] items-center">
              <StarIcon className="mr-1 h-4 w-4" />
              <span className="text-dark text-base leading-6 font-medium">
                Rating:
              </span>
              <span>{teacher.rating.toFixed(1)}</span>
            </span>
            <span className="px-[1.5cqw]">
              <SeparatorIcon className="h-4 w-0.5" />
            </span>
            <span className="grid grid-cols-[repeat(3,auto)] items-center">
              <span className="text-dark text-base leading-6 font-medium">
                Price / 1 hour:
              </span>
              <span className="text-green">{teacher.price_per_hour}</span>
              <span className="text-green">$</span>
            </span>
            <span className="col-12">
              <HeartIcon className="h-[26px] w-[26px]" />
            </span>
          </div>

          <h2 className="mb-[3.03cqw] text-2xl font-medium">
            {teacher.name} {teacher.surname}
          </h2>

          <ul className="text-dark mb-[0.75cqw] grid gap-2 text-base leading-6 font-medium">
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
          </ul>

          <Button
            onClick={() => setExpanded((v) => !v)}
            className="hover:text-yellow mb-2 w-[78px] bg-white px-0 py-2 text-base leading-6 font-medium underline hover:bg-white"
          >
            {expanded ? 'Show less' : 'Read more'}
          </Button>

          {expanded &&
            (isLoading ? (
              <Loader />
            ) : extraInfo ? (
              <div className="text-dark mb-[3.03cqw] text-base leading-6 font-medium">
                <p className="mb-[3.03cqw]">{extraInfo.experience}</p>
                <ul className="mb-[3.03cqw] space-y-2">
                  {extraInfo.reviews.map((rev: Review, idx: number) => (
                    <li key={idx}>
                      <strong>{rev.reviewer_name}</strong> ★
                      {rev.reviewer_rating}
                      <p> {rev.comment}</p>
                    </li>
                  ))}
                </ul>
                <p className="text-sm leading-[1.14]">
                  {teacher.levels.join(', ')}
                </p>
              </div>
            ) : (
              <p className="text-yellow">Error loading details.</p>
            ))}
          <Button
            className="w-58"
            onClick={() => router.push('/booking', { scroll: false })}
          >
            <span className="text-base leading-5">Book trial lesson</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
