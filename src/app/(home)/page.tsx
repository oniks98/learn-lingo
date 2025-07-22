'use client';

import React from 'react';
import clsx from 'clsx';
import Button from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function HomePage() {
  const router = useRouter();

  return (
    <main
      className={clsx(
        'mx-auto max-w-338 px-5 pb-5',
        'grid gap-6',
        'md:grid-cols-[1.45fr_1fr]',
        'xl:grid-cols-[1.27fr_1fr]',
      )}
    >
      <section className="bg-gray-light @container rounded-[30px] md:col-span-2 xl:col-span-1">
        <div
          className={clsx(
            'text-center xl:text-start',
            'px-[6.25cqw] py-[6.25cqw]',
            'xl:px-[8.88cqw] xl:pt-[13.6cqw]',
          )}
        >
          <h1
            className={clsx(
              'leading-[1.17] font-medium tracking-[-0.02em]',
              'mb-[3.13cqw] text-[clamp(24px,4.7cqw,48px)]',
              'xl:mb-[4.44cqw] xl:text-[clamp(24px,6.66cqw,48px)]',
            )}
          >
            Unlock your potential with the best{' '}
            <span
              className={clsx(
                'bg-cream italic',
                'max-h-10 max-w-[195px] rounded-lg',
              )}
            >
              language
            </span>{' '}
            tutors
          </h1>

          <p
            className={clsx(
              'leading-[1.375] tracking-[-0.02em]',
              'mb-[6.25cqw] text-[clamp(14px,2.22cqw,16px)]',
              'text-center xl:mb-[8.88cqw] xl:text-start',
            )}
          >
            Embark on an Exciting Language Journey with Expert Language <br />
            Tutors: Elevate your language proficiency to new heights by <br />
            connecting with highly qualified and experienced tutors.
          </p>

          <Button
            className="px-[11.46cqw] md:px-[88px]"
            onClick={() => router.push('/teachers', { scroll: false })}
          >
            Get started
          </Button>
        </div>
      </section>

      <section className="group relative overflow-hidden rounded-[30px]">
        <h2 className="sr-only">Featured tutor illustration</h2>
        <div className="relative aspect-[568/530] w-full">
          <Image
            src="/images/dolores.png"
            alt="Original teacher"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 40vw"
            priority
            className="object-cover transition duration-500 ease-in-out"
          />
          <Image
            src="/images/dementor.png"
            alt="Alternate teacher"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 40vw"
            className={clsx(
              'absolute inset-0 scale-125 object-cover opacity-0',
              'transition duration-700 ease-out',
              'group-hover:blur-0 group-hover:scale-100 group-hover:opacity-100',
              'animate-float-scale',
            )}
          />
        </div>
      </section>

      <section className="border-yellow @container rounded-[30px] border-[1.5px] border-dashed xl:col-span-2">
        <h2 className="sr-only">Platform statistics</h2>
        <ul
          className={clsx(
            'grid items-center justify-between',
            'grid-cols-[repeat(auto-fit,minmax(210px,_1fr))]',
            'gap-4 md:gap-10 xl:grid-cols-[repeat(4,auto)] xl:gap-0',
            'px-[9.3cqw] py-[3cqw] md:pt-[20.73cqw] md:pl-[15.7cqw] xl:px-[9.3cqw] xl:py-[3cqw]',
          )}
        >
          {[
            { value: '32,000 +', label: 'Experienced\ntutors' },
            { value: '300,000 +', label: '5-star tutor\nreviews' },
            { value: '120 +', label: 'Subjects\ntaught' },
            { value: '200 +', label: 'Tutor\nnationalities' },
          ].map(({ value, label }) => (
            <li key={value} className="grid grid-cols-2 items-center gap-4">
              <p
                className={clsx(
                  'justify-self-end leading-[1.14] font-medium tracking-[-0.02em]',
                  'md:text-[7.53cqw] xl:text-[2.14cqw]',
                )}
              >
                {value}
              </p>
              <p className="text-dark-70 text-sm leading-[1.28] tracking-[-0.02em] whitespace-pre-line">
                {label}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
