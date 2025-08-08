'use client';

import { useAuth } from '@/contexts/auth-context';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  getPendingAction,
  removePendingAction,
} from '@/lib/utils/pending-actions';
import { addToFavorites } from '@/lib/api/favorites';

export default function PendingActionsHandler() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const t = useTranslations('pendingActionsHandler');

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

          // Обновляем кеши с await
          await queryClient.invalidateQueries({ queryKey: ['favorites'] });
          await queryClient.invalidateQueries({
            queryKey: ['favoriteStatus', pendingAction.teacherId],
          });

          toast.success(t('favoriteSuccess'));
        } else if (pendingAction.type === 'booking') {
          console.log(
            'Processing pending booking for teacher:',
            pendingAction.teacherId,
          );

          setTimeout(() => {
            router.push(`/teachers/${pendingAction.teacherId}`, {
              scroll: false,
            });
          }, 1000);
        }

        removePendingAction();
      } catch (error) {
        console.error('Error processing pending action:', error);

        const shouldRetry =
          error instanceof Error && error.message.includes('network');

        if (!shouldRetry) {
          removePendingAction();
          toast.error(t('actionError'));
        } else {
          toast.error(t('networkError'));
        }
      }
    };

    void processPendingAction();
  }, [user?.emailVerified, queryClient, router, t]);

  return null;
}
