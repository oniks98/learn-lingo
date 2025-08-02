// src/hooks/use-favorites.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocale } from 'next-intl'; // ✅ Добавить импорт
import {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  checkIsFavorite,
} from '@/lib/api/favorites';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';

// ✅ Адаптер queryFn для useQuery
const fetchFavorites = ({ queryKey }: { queryKey: [string, string] }) => {
  const [, locale] = queryKey;
  return getFavorites(locale);
};

// Хук для отримання списку улюблених вчителів
export const useFavorites = () => {
  const { user } = useAuth();
  const locale = useLocale(); // ✅ Используем локаль из Next.js контекста

  return useQuery({
    queryKey: ['favorites', locale], // ✅ Передаем правильную локаль
    queryFn: fetchFavorites, // ✅ queryFn теперь получает queryKey
    enabled: !!user,
    staleTime: 30 * 1000,
  });
};

// Обновите toggleFavorite для инвалидации с локалью
export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const locale = useLocale(); // ✅ Добавить локаль

  const addMutation = useMutation({
    mutationFn: addToFavorites,
    onSuccess: (_, teacherId) => {
      queryClient.setQueryData(['favoriteStatus', teacherId], true);
      // ✅ Инвалидируем с правильной локалью
      queryClient.invalidateQueries({ queryKey: ['favorites', locale] });
    },
    onError: (error) => {
      console.error('Error adding to favorites:', error);
      toast.error('Помилка додавання в улюблене');
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeFromFavorites,
    onSuccess: (_, teacherId) => {
      queryClient.setQueryData(['favoriteStatus', teacherId], false);
      // ✅ Инвалидируем с правильной локалью
      queryClient.invalidateQueries({ queryKey: ['favorites', locale] });
    },
    onError: (error) => {
      console.error('Error removing from favorites:', error);
      toast.error('Помилка видалення з улюбленого');
    },
  });

  const toggleFavorite = (teacherId: string, isFavorite: boolean) => {
    if (!user) {
      toast.error('Потрібно увійти в систему');
      return;
    }

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

// Остальные хуки без изменений
export const useFavoriteStatus = (teacherId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['favoriteStatus', teacherId],
    queryFn: () => checkIsFavorite(teacherId),
    enabled: !!user && !!teacherId,
    staleTime: 30 * 1000,
  });
};
