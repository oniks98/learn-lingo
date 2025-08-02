// src/components/profile/profile-list.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/contexts/auth-context';
import { updateProfile, deleteAccount, getUserStats } from '@/lib/api/profile';
import Loader from '@/components/ui/loader';
import Button from '@/components/ui/button';
import EmailChangeModal from '@/components/modal/email-change-modal';
import ProfileDeleteModal from '@/components/modal/profile-delete-modal';

export default function ProfileList({ userId }: { userId: string }) {
  const t = useTranslations('profile');
  const locale = useLocale();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const queryClient = useQueryClient();

  // ВСЕ ХУКИ ВСЕГДА ВЫЗЫВАЮТСЯ В ОДИНАКОВОМ ПОРЯДКЕ
  // State для редагування імені
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.username || '');

  // State для модалок
  const [isChangeEmailModalOpen, setIsChangeEmailModalOpen] = useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] =
    useState(false);

  // Завантаження статистики користувача - как в BookingsList
  const {
    data: userStats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ['userStats'],
    queryFn: getUserStats,
  });

  // Мутація для оновлення профілю
  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['user'], updatedUser);
      setIsEditingName(false);
      // Можна додати toast повідомлення
    },
    onError: (error) => {
      console.error('Profile update error:', error);
      // Можна додати toast повідомлення про помилку
    },
  });

  // Мутація для видалення акаунта
  const deleteAccountMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: async () => {
      await signOut();
      router.push('/');
      // Можна додати toast повідомлення про успішне видалення
    },
    onError: (error) => {
      console.error('Account deletion error:', error);
      // Можна додати toast повідомлення про помилку
    },
  });

  // useEffect для синхронизации имени пользователя
  useEffect(() => {
    if (user?.username) {
      setNewName(user.username);
    }
  }, [user?.username]);

  // Check if the current user is viewing their own profile
  const isOwnProfile = user?.uid === userId;

  // Форматування дати реєстрації
  const formatDate = (timestamp: number) => {
    // Создаем mapping локалей для правильного форматирования
    const localeMap: Record<string, string> = {
      en: 'en-US',
      uk: 'uk-UA',
    };

    const dateLocale = localeMap[locale] || 'en-US';

    return new Date(timestamp).toLocaleDateString(dateLocale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Обробники подій
  const handleSaveName = () => {
    if (newName.trim() && newName !== user?.username) {
      updateProfileMutation.mutate({ username: newName.trim() });
    } else {
      setIsEditingName(false);
    }
  };

  const handleCancelEdit = () => {
    setNewName(user?.username || '');
    setIsEditingName(false);
  };

  const handleDeleteAccount = () => {
    deleteAccountMutation.mutate();
  };

  if (loading || !user) {
    return (
      <main className="mx-auto max-w-338 px-5 pb-5">
        <div className="bg-gray-light mx-auto rounded-3xl px-5 py-16">
          <Loader />
        </div>
      </main>
    );
  }

  // If user is trying to view someone else's profile, show access denied
  if (!isOwnProfile) {
    return (
      <main className="mx-auto max-w-338 px-5 pb-5">
        <div className="bg-gray-light mx-auto rounded-3xl px-5 py-16 text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-800">
            {t('accessDenied')}
          </h1>
          <p className="text-gray-600">{t('canOnlyViewOwnProfile')}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-338 px-5 pb-5">
      <div className="bg-gray-light mx-auto rounded-3xl px-5 pt-8 pb-5">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-800">
            {t('title')}
          </h1>
        </div>

        <div className="space-y-8">
          {/* Особиста інформація */}
          <section className="rounded-2xl bg-white p-6">
            <h2 className="mb-6 text-xl font-semibold text-gray-800">
              {t('personalInfo')}
            </h2>

            {/* Ім'я */}
            <div className="mb-6">
              <label className="mb-2 block font-medium text-gray-700">
                {t('name')}
              </label>
              {isEditingName ? (
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="focus:border-yellow flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none"
                    placeholder="Введіть ім'я"
                  />
                  <Button
                    onClick={handleSaveName}
                    disabled={updateProfileMutation.isPending}
                    className="bg-yellow hover:bg-yellow/80 px-9 py-[14px] text-black"
                  >
                    {updateProfileMutation.isPending
                      ? t('buttons.saving')
                      : t('buttons.save')}
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    className="bg-gray-200 px-9 py-[14px] text-black hover:bg-gray-300"
                  >
                    {t('buttons.cancel')}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-gray-900">{user.username}</span>
                  <Button
                    onClick={() => setIsEditingName(true)}
                    className="bg-yellow hover:bg-yellow-light px-9 py-[14px] text-black"
                  >
                    {t('buttons.edit')}
                  </Button>
                </div>
              )}
            </div>

            {/* Зміна email */}
            <div className="mb-6">
              <label className="mb-2 block font-medium text-gray-700">
                {t('currentEmail')}
              </label>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{user.email}</span>
                <Button
                  onClick={() => setIsChangeEmailModalOpen(true)}
                  className="bg-yellow hover:bg-yellow-light px-9 py-[14px] text-black"
                >
                  {t('changeEmail')}
                </Button>
              </div>
            </div>
          </section>

          {/* Статистика */}
          <section className="rounded-2xl bg-white p-6">
            <h2 className="mb-6 text-xl font-semibold text-gray-800">
              {t('statistics')}
            </h2>

            {statsLoading ? (
              <div className="flex justify-center py-4">
                <Loader />
              </div>
            ) : statsError ? (
              <p className="text-center text-red-500">
                Помилка завантаження статистики
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">
                      {t('favoriteTeachers')}:
                    </span>
                    <Link
                      href={`/users/${userId}/favorites`}
                      className="text-yellow hover:text-yellow/80 text-2xl font-bold transition-colors"
                    >
                      {userStats?.favoritesCount || 0}
                    </Link>
                  </div>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{t('bookedLessons')}:</span>
                    <Link
                      href={`/users/${userId}/bookings`}
                      className="text-yellow hover:text-yellow/80 text-2xl font-bold transition-colors"
                    >
                      {userStats?.bookingsCount || 0}
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Дата реєстрації */}
          <section className="rounded-2xl bg-white p-6">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">{t('registrationDate')}:</span>
              <span className="font-medium text-gray-900">
                {formatDate(user.createdAt)}
              </span>
            </div>
          </section>

          {/* Налаштування акаунта */}
          <section className="rounded-2xl bg-white p-6">
            <h2 className="mb-6 text-xl font-semibold text-gray-800">
              {t('accountSettings')}
            </h2>

            <div className="flex justify-center">
              <Button
                onClick={() => setIsDeleteAccountModalOpen(true)}
                className="bg-red-500 px-9 py-[14px] text-white hover:bg-red-600"
              >
                {t('deleteAccount')}
              </Button>
            </div>
          </section>
        </div>

        {/* Модалка зміни email */}
        <EmailChangeModal
          isOpen={isChangeEmailModalOpen}
          onCloseAction={() => setIsChangeEmailModalOpen(false)}
        />

        {/* Модалка видалення акаунта */}
        <ProfileDeleteModal
          isOpen={isDeleteAccountModalOpen}
          onCloseAction={() => setIsDeleteAccountModalOpen(false)}
          onConfirmAction={handleDeleteAccount}
          isLoading={deleteAccountMutation.isPending}
          userEmail={user.email}
        />
      </div>
    </main>
  );
}
