// src/components/pending-actions-handler.tsx
'use client';

import { useAuth } from '@/contexts/auth-context';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  getPendingAction,
  removePendingAction,
} from '@/lib/utils/pending-actions';
import { addToFavorites } from '@/lib/api/favorites';

export default function PendingActionsHandler() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    if (!user?.emailVerified) return;

    const processPendingAction = async () => {
      const pendingAction = getPendingAction();
      if (!pendingAction) return;

      try {
        if (pendingAction.type === 'favorite') {
          console.log(
            'Processing pending favorite for teacher:',
            pendingAction.teacherId,
          );

          await addToFavorites(pendingAction.teacherId);

          // Обновляем кеши
          queryClient.invalidateQueries({ queryKey: ['favorites'] });
          queryClient.invalidateQueries({
            queryKey: ['favoriteStatus', pendingAction.teacherId],
          });

          toast.success('Вчителя додано до обраних!');
        } else if (pendingAction.type === 'booking') {
          console.log(
            'Processing pending booking for teacher:',
            pendingAction.teacherId,
          );

          // Переходим на страницу учителя для бронирования
          setTimeout(() => {
            router.push(`/teachers/${pendingAction.teacherId}`, {
              scroll: false,
            });
            // toast.success('Тепер ви можете забронювати урок!');
          }, 1000); // Небольшая задержка для лучшего UX
        }

        // Очищаем действие только после успешного выполнения
        removePendingAction();
      } catch (error) {
        console.error('Error processing pending action:', error);

        // В случае ошибки API можно решить оставить действие для повторной попытки
        const shouldRetry =
          error instanceof Error && error.message.includes('network');

        if (!shouldRetry) {
          removePendingAction();
          toast.error('Помилка при виконанні дії');
        } else {
          toast.error('Помилка мережі. Спробуємо пізніше.');
        }
      }
    };

    processPendingAction();
  }, [user?.emailVerified, queryClient, router]);

  return null;
}
