// src/hooks/use-favorites.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  checkIsFavorite,
} from '@/lib/api/favorites';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';

// Хук для отримання списку улюблених вчителів
export const useFavorites = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['favorites'],
    queryFn: getFavorites,
    enabled: !!user,
    staleTime: 30 * 1000, // 30 секунд
  });
};

// Хук для перевірки, чи вчитель в улюбленому
export const useFavoriteStatus = (teacherId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['favoriteStatus', teacherId],
    queryFn: () => checkIsFavorite(teacherId),
    enabled: !!user && !!teacherId,
    staleTime: 30 * 1000,
  });
};

// Хук для додавання/видалення з фаворитів
export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const addMutation = useMutation({
    mutationFn: addToFavorites,
    onSuccess: (_, teacherId) => {
      // Оновлюємо статус фаворита
      queryClient.setQueryData(['favoriteStatus', teacherId], true);

      // Інвалідуємо список фаворитів
      queryClient.invalidateQueries({ queryKey: ['favorites'] });

      // toast.success('Вчитель доданий в улюблене!');
    },
    onError: (error) => {
      console.error('Error adding to favorites:', error);
      toast.error('Помилка додавання в улюблене');
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeFromFavorites,
    onSuccess: (_, teacherId) => {
      // Оновлюємо статус фаворита
      queryClient.setQueryData(['favoriteStatus', teacherId], false);

      // Інвалідуємо список фаворитів
      queryClient.invalidateQueries({ queryKey: ['favorites'] });

      // toast.success('Вчитель видалений з улюбленого');
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
