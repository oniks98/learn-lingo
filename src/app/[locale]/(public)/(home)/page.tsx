// src/app/[locale]/(public)/(home)/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

// Компонент анимированного счетчика
const AnimatedCounter = ({
  value,
  duration = 2000,
  suffix = '',
  className = '',
}: {
  value: number;
  duration?: number;
  suffix?: string;
  className?: string;
}) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const startTime = Date.now();
    const startValue = 0;
    const endValue = value;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function для плавности
      const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      const currentValue = Math.floor(
        startValue + (endValue - startValue) * easeOutExpo,
      );
      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [isVisible, value, duration]);

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US');
  };

  return (
    <p ref={counterRef} className={className}>
      {formatNumber(count)}
      {suffix}
    </p>
  );
};

export default function HomePage() {
  const t = useTranslations('homepage');
  const tStats = useTranslations('homepage.stats');

  const stats = [
    {
      value: 32000,
      suffix: ' +',
      label: tStats('tutors'),
      duration: 2500,
    },
    {
      value: 300000,
      suffix: ' +',
      label: tStats('reviews'),
      duration: 3000,
    },
    {
      value: 120,
      suffix: ' +',
      label: tStats('subjects'),
      duration: 1500,
    },
    {
      value: 200,
      suffix: ' +',
      label: tStats('nationalities'),
      duration: 2000,
    },
  ];

  // Функция для стилизации текста заголовка
  const renderStyledTitle = (title: string) => {
    // Для английского языка - выделяем "language"
    if (title.includes('language')) {
      const parts = title.split('language');
      return (
        <>
          {parts[0]}
          <span className="relative inline-block px-2 italic">
            <span className="bg-cream absolute top-[10px] right-0 bottom-[6px] left-0 rounded-lg" />
            <span className="relative z-10">language</span>
          </span>
          {parts[1]}
        </>
      );
    }

    // Для украинского языка - выделяем "мов"
    if (title.includes('мов')) {
      const parts = title.split('мов');
      return (
        <>
          {parts[0]}
          <span className="relative inline-block px-2 italic">
            <span className="bg-cream absolute top-[10px] right-0 bottom-[6px] left-0 rounded-lg" />
            <span className="relative z-10">мов</span>
          </span>
          {parts[1]}
        </>
      );
    }

    return title;
  };

  return (
    <section
      className={clsx(
        'mx-auto max-w-338 px-5 pb-5',
        'grid gap-6',
        'md:grid-cols-[1.45fr_1fr]',
        'xl:grid-cols-[1.19fr_1fr]',
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
            {renderStyledTitle(t('title'))}
          </h1>

          <p
            className={clsx(
              'leading-[1.375] tracking-[-0.02em]',
              'mb-[6.25cqw] text-[clamp(14px,2.22cqw,16px)]',
              'text-center xl:mb-[8.88cqw] xl:text-start',
            )}
          >
            {t('subtitle')}
          </p>

          <Link
            href="/teachers"
            scroll={false}
            className="bg-yellow hover:bg-yellow-light inline-block rounded-xl px-[11.46cqw] py-4 text-center leading-[1.56] font-bold transition-colors md:px-[88px]"
          >
            {useTranslations('common')('getStarted')}
          </Link>
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
          {stats.map(({ value, suffix, label, duration }) => (
            <li key={value} className="grid grid-cols-2 items-center gap-4">
              <AnimatedCounter
                value={value}
                suffix={suffix}
                duration={duration}
                className={clsx(
                  'justify-self-end leading-[1.14] font-medium tracking-[-0.02em]',
                  'md:text-[7.53cqw] xl:text-[2.14cqw]',
                  'transition-all duration-200',
                  'bg-clip-text text-black',
                )}
              />
              <p className="text-dark-70 text-sm leading-[1.28] tracking-[-0.02em] whitespace-pre-line">
                {label}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
