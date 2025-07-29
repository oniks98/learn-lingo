'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useFavorites } from '@/hooks/use-favorites';
import { useAuth } from '@/contexts/auth-context';
import TeacherCard from '@/components/teachers/teacher-card';
import SignUpFormModal from '@/components/modal/sign-up-form-modal';
import Loader from '@/components/ui/loader';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/button';
import { useTranslations } from 'next-intl';

export default function FavoritesList() {
  const t = useTranslations();
  const { user, loading: authLoading } = useAuth();
  const { data: favoritesData, isLoading, error } = useFavorites();
  const router = useRouter();

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [pendingFavoriteTeacherId, setPendingFavoriteTeacherId] =
    useState<string>('');
  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/teachers');
    }
  }, [user, authLoading, router]);

  const allFavorites = useMemo(() => {
    return favoritesData?.favorites || [];
  }, [favoritesData]);

  const visibleFavorites = useMemo(
    () => allFavorites.slice(0, visibleCount),
    [allFavorites, visibleCount],
  );

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

  if (authLoading || isLoading) {
    return (
      <main className="mx-auto max-w-338 px-5 pb-5">
        <div className="bg-gray-light mx-auto rounded-3xl px-5 py-16">
          <Loader />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-338 px-5 pb-5">
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
      </main>
    );
  }

  return (
    <>
      <main className="mx-auto max-w-338 px-5 pb-5">
        <div className="bg-gray-light mx-auto rounded-3xl px-5 pt-8 pb-5">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-gray-800">
              {t('favorites.title')}
            </h1>
            <p className="text-gray-600">
              {allFavorites.length > 0
                ? t('favorites.count', { count: allFavorites.length })
                : t('favorites.empty')}
            </p>
          </div>

          {allFavorites.length === 0 ? (
            <div className="py-16 text-center">
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
              <a
                href="/teachers"
                className="bg-yellow hover:bg-yellow/80 inline-flex items-center rounded-lg px-6 py-3 font-medium text-black transition-colors"
              >
                {t('favorites.browse')}
              </a>
            </div>
          ) : (
            <>
              <div className="grid gap-6">
                {visibleFavorites.map((teacher) => (
                  <TeacherCard
                    key={teacher.id}
                    level=""
                    teacher={teacher}
                    pendingFavoriteTeacherId={pendingFavoriteTeacherId}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="mt-8 text-center">
                  <Button onClick={handleLoadMore}>
                    {t('common.loadMore')}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <SignUpFormModal
        isOpen={isRegisterModalOpen}
        onCloseAction={handleCloseRegisterModal}
      />
    </>
  );
}
