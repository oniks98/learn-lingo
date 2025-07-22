// src/lib/validation/favorites.ts
import { z } from 'zod';

export const favoriteActionSchema = z.object({
  teacherId: z.string().min(1, 'Teacher ID is required'),
});

export type FavoriteActionValues = z.infer<typeof favoriteActionSchema>;
