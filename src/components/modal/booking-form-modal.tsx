// src/components/modal/booking-form-modal.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { useTranslations, useLocale } from 'next-intl';
import Modal from '@/components/modal/modal';
import Button from '@/components/ui/button';
import { DateTimePicker } from '@/components/calendar/date-time-picker';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import {
  bookingSchema,
  type BookingFormValues,
} from '@/lib/validation/booking';
import { learningReasons } from '@/lib/constants/reasons';
import type { TeacherInfoModal, TeacherPreview } from '@/lib/types/types';
import { useAuth } from '@/contexts/auth-context';
import { createBooking } from '@/lib/api/bookings';
import { getAllTeachers } from '@/lib/api/teachers';
import { sendBookingEmail } from '@/lib/api/send-booking-email';
import RadioButtonIcon from '@/lib/icons/radio';

interface Props {
  isOpen: boolean;
  teacher: TeacherInfoModal;
}

export default function BookingFormModal({ isOpen, teacher }: Props) {
  const router = useRouter();
  const locale = useLocale();
  const { user } = useAuth();
  const t = useTranslations('bookingForm');
  const tReasons = useTranslations('learningReasons');

  // Получаем всех учителей из кеша React Query с учетом локали
  const { data: teachers } = useQuery<TeacherPreview[]>({
    queryKey: ['teachers', locale],
    queryFn: () => getAllTeachers(locale),
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      name: user?.username || '',
      email: user?.email || '',
      comment: '',
    },
  });

  const selectedReason = useWatch({ control, name: 'reason' });
  const [sending, setSending] = useState(false);

  // Наблюдаем за изменениями в полях формы
  const watchedName = watch('name');
  const watchedEmail = watch('email');
  const watchedPhone = watch('phone');
  const watchedComment = watch('comment');

  // Функция для очистки сохраненных данных
  const clearSavedData = () => {
    try {
      localStorage.removeItem(`bookingForm_name_${teacher.id}`);
      localStorage.removeItem(`bookingForm_email_${teacher.id}`);
      localStorage.removeItem(`bookingForm_phone_${teacher.id}`);
      localStorage.removeItem(`bookingForm_comment_${teacher.id}`);
    } catch (error) {
      console.warn('Could not clear saved form data:', error);
    }
  };

  // Загружаем сохраненные данные при открытии модалки
  useEffect(() => {
    if (isOpen) {
      try {
        const savedName = localStorage.getItem(
          `bookingForm_name_${teacher.id}`,
        );
        const savedEmail = localStorage.getItem(
          `bookingForm_email_${teacher.id}`,
        );
        const savedPhone = localStorage.getItem(
          `bookingForm_phone_${teacher.id}`,
        );
        const savedComment = localStorage.getItem(
          `bookingForm_comment_${teacher.id}`,
        );

        // Загружаем имя только если нет данных пользователя
        if (savedName && !user?.username) {
          setValue('name', savedName);
        }

        // Загружаем email только если нет данных пользователя
        if (savedEmail && !user?.email) {
          setValue('email', savedEmail);
        }

        if (savedPhone) {
          setValue('phone', savedPhone);
        }

        if (savedComment) {
          setValue('comment', savedComment);
        }
      } catch (error) {
        console.warn('Could not load saved form data:', error);
      }
    }
  }, [isOpen, setValue, teacher.id, user?.username, user?.email]);

  // Сохраняем имя при его изменении (только если это не данные пользователя)
  useEffect(() => {
    if (watchedName && !user?.username) {
      try {
        localStorage.setItem(`bookingForm_name_${teacher.id}`, watchedName);
      } catch (error) {
        console.warn('Could not save name:', error);
      }
    }
  }, [watchedName, teacher.id, user?.username]);

  // Сохраняем email при его изменении (только если это не данные пользователя)
  useEffect(() => {
    if (watchedEmail && !user?.email) {
      try {
        localStorage.setItem(`bookingForm_email_${teacher.id}`, watchedEmail);
      } catch (error) {
        console.warn('Could not save email:', error);
      }
    }
  }, [watchedEmail, teacher.id, user?.email]);

  // Сохраняем телефон при его изменении
  useEffect(() => {
    if (watchedPhone) {
      try {
        localStorage.setItem(`bookingForm_phone_${teacher.id}`, watchedPhone);
      } catch (error) {
        console.warn('Could not save phone:', error);
      }
    }
  }, [watchedPhone, teacher.id]);

  // Сохраняем комментарий при его изменении
  useEffect(() => {
    if (watchedComment) {
      try {
        localStorage.setItem(
          `bookingForm_comment_${teacher.id}`,
          watchedComment,
        );
      } catch (error) {
        console.warn('Could not save comment:', error);
      }
    }
  }, [watchedComment, teacher.id]);

  const onSubmit = async (formData: BookingFormValues) => {
    if (!user) {
      toast.error(t('errors.loginRequired'));
      return;
    }

    // Находим полные данные учителя в кеше
    const fullTeacherData = teachers?.find(
      (t: TeacherPreview) => t.id === teacher.id,
    );

    if (!fullTeacherData) {
      toast.error(t('errors.teacherNotFound'));
      return;
    }

    // Подготавливаем данные бронирования
    const bookingData = {
      userId: user.uid,
      teacherId: teacher.id,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      reason: formData.reason,
      bookingDate: formData.bookingDate, // Передаем Date как есть
      comment: formData.comment,
      createdAt: Date.now(),
    };

    try {
      setSending(true);

      // 1. Создаем бронирование
      const createdBooking = await createBooking(bookingData);

      // 2. Отправляем email с данными учителя из кеша
      const emailPayload = {
        ...createdBooking,
        teacherName: fullTeacherData.name,
        teacherSurname: fullTeacherData.surname,
      };

      try {
        await sendBookingEmail(emailPayload);
        toast.success(t('success.bookingWithEmail'));
      } catch (emailError) {
        console.warn('Email sending failed:', emailError);
        toast.success(t('success.bookingWithoutEmail'));
      }

      // 3. Очищаем сохраненные данные, форму и закрываем модалку
      clearSavedData();
      reset();
      router.back();
    } catch (err: any) {
      console.error('Booking error:', err);
      toast.error(err.message || t('errors.general'));
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onCloseAction={() => router.back()}
      title={t('title')}
    >
      <p className="text-gray-muted mb-5 leading-snug">{t('description')}</p>

      <div className="mb-8 flex items-center gap-4">
        <Image
          src={teacher.avatar_url}
          alt={`${teacher.name} ${teacher.surname}`}
          width={44}
          height={44}
          className="rounded-full"
        />
        <div>
          <p className="text-gray-muted text-sm">{t('yourTeacher')}</p>
          <p className="font-medium">
            {teacher.name} {teacher.surname}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <fieldset className="space-y-3">
          <legend className="text-lg font-medium">
            {t('reasonForLearning')}
          </legend>
          {learningReasons.map((reason) => {
            const selected = selectedReason === reason;
            return (
              <label key={reason} className="flex items-center gap-2">
                <input
                  type="radio"
                  value={reason}
                  {...register('reason')}
                  className="sr-only"
                />
                {selected ? (
                  <RadioButtonIcon />
                ) : (
                  <div className="h-5 w-5 rounded-full border" />
                )}
                <span>{tReasons(reason)}</span>
              </label>
            );
          })}
          {errors.reason && (
            <p className="text-sm text-red-600">{errors.reason.message}</p>
          )}
        </fieldset>

        {/* Responsive grid layout */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Left column - Personal info */}
          <div className="space-y-4">
            <div>
              <input
                {...register('name')}
                placeholder={t('placeholders.fullName')}
                className="w-full rounded-xl border p-3 transition-colors hover:border-yellow-400 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <input
                {...register('email')}
                type="email"
                placeholder={t('placeholders.email')}
                className="w-full rounded-xl border p-3 transition-colors hover:border-yellow-400 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <input
                {...register('phone')}
                type="tel"
                placeholder={t('placeholders.phone')}
                className="w-full rounded-xl border p-3 transition-colors hover:border-yellow-400 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          {/* Right column - Booking data */}
          <div className="space-y-4">
            {/* Custom Date Time Picker */}
            <Controller
              control={control}
              name="bookingDate"
              render={({ field }) => (
                <DateTimePicker
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.bookingDate?.message}
                  disablePastDates={true}
                  defaultTime="10:00"
                />
              )}
            />

            <div>
              <textarea
                {...register('comment')}
                placeholder={t('placeholders.comment')}
                rows={4}
                className="w-full resize-none rounded-xl border px-3 py-2 transition-colors hover:border-yellow-400 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
              />
              {errors.comment && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.comment.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <Button type="submit" disabled={sending} className="w-full">
          {sending ? t('buttons.sending') : t('buttons.book')}
        </Button>
      </form>
    </Modal>
  );
}
