import { db } from '@/lib/utils/firebase';
import { ref, get, update, remove } from 'firebase/database';
import {
  TeacherPreview,
  TeacherExtraInfo,
  TeacherInfoModal,
} from '@/lib/types/types';

// NOTE: Отримати всіх вчителів (тільки потрібні поля)
export async function getAllTeachers(): Promise<TeacherPreview[]> {
  const snapshot = await get(ref(db, 'teachers'));
  if (!snapshot.exists()) return [];

  const data = snapshot.val();

  return Object.entries(data).map(([id, teacher]: any) => ({
    id,
    name: teacher.name,
    surname: teacher.surname,
    languages: teacher.languages,
    levels: teacher.levels,
    rating: teacher.rating,
    price_per_hour: teacher.price_per_hour,
    lessons_done: teacher.lessons_done,
    avatar_url: teacher.avatar_url,
    lesson_info: teacher.lesson_info,
    conditions: teacher.conditions,
  }));
}

// NOTE: Отримати повну інформацію про вчителя
export async function getTeacherExtraInfo(
  id: string,
): Promise<TeacherExtraInfo | null> {
  const snapshot = await get(ref(db, `teachers/${id}`));
  if (!snapshot.exists()) return null;

  const teacher = snapshot.val();

  return {
    experience: teacher.experience,
    reviews: teacher.reviews ?? [],
  };
}

// NOTE: Отримати аватар, повне ім'я для модалки по id вчителя
export async function getTeacherById(
  id: string,
): Promise<TeacherInfoModal | null> {
  const snapshot = await get(ref(db, `teachers/${id}`));
  if (!snapshot.exists()) return null;
  const teacher = snapshot.val();

  return {
    id,
    name: teacher.name,
    surname: teacher.surname,
    avatar_url: teacher.avatar_url,
  };
}

// NOTE: Отримати обраних вчителів користувача
export async function getFavorites(
  userId: string,
): Promise<Record<string, boolean>> {
  const snapshot = await get(ref(db, `users/${userId}/favorites`));
  return snapshot.exists() ? snapshot.val() : {};
}

// NOTE: Додати до обраного
export async function addToFavorites(
  userId: string,
  teacherId: string,
): Promise<void> {
  await update(ref(db, `users/${userId}/favorites`), {
    [teacherId]: true,
  });
}

// NOTE: Видалити з обраного
export async function removeFromFavorites(
  userId: string,
  teacherId: string,
): Promise<void> {
  await remove(ref(db, `users/${userId}/favorites/${teacherId}`));
}
