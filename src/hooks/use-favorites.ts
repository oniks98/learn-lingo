import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  checkIsFavorite,
} from '@/lib/api/favorites';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';

// Адаптер queryFn для useQuery
const fetchFavorites = ({ queryKey }: { queryKey: [string, string] }) => {
  const [, locale] = queryKey;
  return getFavorites(locale);
};

/**
 * Хук для отримання списку улюблених викладачів
 */
export const useFavorites = () => {
  const { user } = useAuth();
  const locale = useLocale();

  return useQuery({
    queryKey: ['favorites', locale],
    queryFn: fetchFavorites,
    enabled: !!user,
    staleTime: 30 * 1000,
  });
};

/**
 * Хук для додавання/видалення викладачів з улюблених
 */
export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const locale = useLocale();
  const t = useTranslations('notifications.favorites_management');

  const addMutation = useMutation({
    mutationFn: addToFavorites,
    onSuccess: (_, teacherId) => {
      // Оновлюємо статус у кеші
      queryClient.setQueryData(['favoriteStatus', teacherId], true);
      return queryClient.invalidateQueries({ queryKey: ['favorites', locale] });
    },
    onError: () => {
      toast.error(t('add_error'));
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeFromFavorites,
    onSuccess: (_, teacherId) => {
      // Оновлюємо статус у кеші
      queryClient.setQueryData(['favoriteStatus', teacherId], false);
      return queryClient.invalidateQueries({ queryKey: ['favorites', locale] });
    },
    onError: () => {
      toast.error(t('remove_error'));
    },
  });

  const toggleFavorite = (teacherId: string, isFavorite: boolean) => {
    if (!user) {
      toast.error(t('login_required'));
      return;
    }

    // Додаємо або видаляємо з улюблених
    if (isFavorite) {
      removeMutation.mutate(teacherId);
    } else {
      addMutation.mutate(teacherId);
    }
  };

  return {
    toggleFavorite,
    isLoading: addMutation.isPending || removeMutation.isPending,
  };
};

/**
 * Хук для перевірки чи викладач у улюблених
 */
export const useFavoriteStatus = (teacherId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['favoriteStatus', teacherId],
    queryFn: () => checkIsFavorite(teacherId),
    enabled: !!user && !!teacherId,
    staleTime: 30 * 1000,
  });
};
