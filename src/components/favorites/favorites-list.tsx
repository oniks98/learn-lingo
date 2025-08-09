'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

import { useFavorites } from '@/hooks/use-favorites';
import TeacherCard from '@/components/teachers/teacher-card';
import SignUpFormModal from '@/components/modal/sign-up-form-modal';
import Loader from '@/components/ui/loader';
import Button from '@/components/ui/button';
import {
  containerVariants,
  cardVariants,
  headerVariants,
  emptyStateVariants,
  loadMoreVariants,
} from '@/lib/constants/animations';

export default function FavoritesList() {
  const t = useTranslations();
  const { data: favoritesData, isLoading, error } = useFavorites();

  // Стан для модального вікна реєстрації
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [pendingFavoriteTeacherId, setPendingFavoriteTeacherId] =
    useState<string>('');

  // Пагінація - кількість видимих карток
  const [visibleCount, setVisibleCount] = useState(4);

  // Мемоізовані дані улюблених викладачів
  const allFavorites = useMemo(() => {
    return favoritesData?.favorites || [];
  }, [favoritesData]);

  const visibleFavorites = useMemo(
    () => allFavorites.slice(0, visibleCount),
    [allFavorites, visibleCount],
  );

  // Завантаження додаткових карток з автоскролом
  const handleLoadMore = () => {
    setVisibleCount((prev) => {
      const newCount = prev + 4;

      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth',
        });
      }, 100);

      return newCount;
    });
  };

  const hasMore = visibleCount < allFavorites.length;

  const handleCloseRegisterModal = () => {
    setIsRegisterModalOpen(false);
    setPendingFavoriteTeacherId('');
  };

  // Стан завантаження
  if (isLoading || (!favoritesData && !error)) {
    return (
      <section className="mx-auto max-w-338 px-5 pb-5">
        <div className="bg-gray-light mx-auto rounded-3xl px-5 py-16">
          <Loader />
        </div>
      </section>
    );
  }

  // Стан помилки з можливістю перезавантаження
  if (error) {
    return (
      <section className="mx-auto max-w-338 px-5 pb-5">
        <div className="bg-gray-light mx-auto rounded-3xl px-5 py-16">
          <div className="text-center">
            <p className="mb-4 text-red-500">{t('favorites.error')}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-yellow hover:bg-yellow/80 rounded px-4 py-2 text-white"
            >
              {t('favorites.retry')}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="mx-auto max-w-338 px-5 pb-5">
        <div className="bg-gray-light mx-auto rounded-3xl px-5 pt-8 pb-5">
          {/* Заголовок сторінки з анімацією */}
          <motion.div
            className="mb-8 text-center"
            variants={headerVariants}
            initial="hidden"
            animate="visible"
          >
            <h1 className="mb-2 text-3xl font-bold text-gray-800">
              {t('favorites.title')}
            </h1>
            <p className="text-gray-600">
              {allFavorites.length > 0
                ? t('favorites.count', { count: allFavorites.length })
                : t('favorites.empty')}
            </p>
          </motion.div>

          {/* Пустий стан - коли немає улюблених викладачів */}
          {allFavorites.length === 0 ? (
            <motion.div
              className="py-16 text-center"
              variants={emptyStateVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="mb-6">
                <svg
                  className="mx-auto h-24 w-24 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-medium text-gray-800">
                {t('favorites.emptyTitle')}
              </h3>
              <p className="mb-6 text-gray-600">
                {t('favorites.emptyDescription')}
              </p>
              <Link
                href="/teachers"
                className="bg-yellow hover:bg-yellow/80 inline-flex items-center rounded-lg px-6 py-3 font-medium text-black transition-colors"
              >
                {t('favorites.browse')}
              </Link>
            </motion.div>
          ) : (
            /* Список улюблених викладачів */
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <motion.div className="grid gap-6" variants={containerVariants}>
                {visibleFavorites.map((teacher) => (
                  <motion.div
                    key={teacher.id}
                    variants={cardVariants}
                    viewport={{ once: true, margin: '1%' }}
                    whileInView="visible"
                    initial="hidden"
                  >
                    <TeacherCard
                      level=""
                      teacher={teacher}
                      pendingFavoriteTeacherId={pendingFavoriteTeacherId}
                    />
                  </motion.div>
                ))}
              </motion.div>

              {/* Кнопка "Завантажити ще" */}
              {hasMore && (
                <motion.div
                  className="mt-8 text-center"
                  variants={loadMoreVariants}
                  viewport={{ once: true, margin: '1%' }}
                  whileInView="visible"
                  initial="hidden"
                >
                  <Button onClick={handleLoadMore}>
                    {t('favorites.loadMore')}
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* Модальне вікно реєстрації */}
      <SignUpFormModal
        isOpen={isRegisterModalOpen}
        onCloseAction={handleCloseRegisterModal}
      />
    </>
  );
}
