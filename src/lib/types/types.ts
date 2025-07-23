// src/lib/types/types.ts

// Общий тип для отзывов
export interface Review {
  reviewer_name: string;
  reviewer_rating: number;
  comment: string;
}

// Минимальная информация об учителе
export interface TeacherPreview {
  id: string;
  name: string;
  surname: string;
  languages: string[];
  levels: string[];
  rating: number;
  price_per_hour: number;
  lessons_done: number;
  avatar_url: string;
  lesson_info: string;
  conditions: string[];
}

// Расширенная информация об учителе
export interface TeacherExtraInfo {
  experience: string;
  reviews: Review[];
}

// Краткая информация об учителе (для модалки)
export interface TeacherInfoModal {
  id: string;
  name: string;
  surname: string;
  avatar_url: string;
}

// Данные пользователя в базе
export interface UserData {
  uid: string;
  email: string;
  username: string;
  emailVerified: boolean;
  provider: string; // 'google' | 'email'
  createdAt: number;
  updatedAt?: number;
  photoURL?: string;
}

// Контекст аутентификации на клиенте
export interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<UserData>;
  signIn: (email: string, password: string) => Promise<UserData>;
  signInWithGoogle: (redirectPath?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>; // Новый метод
}

// Учитель при создании/редактировании
export interface Teacher {
  name: string;
  languages: string[];
  levels: string[];
  price_per_hour: number;
  description?: string;
  avatar?: string;
}

// Тип избранных учителей
export type Favorites = Record<string, boolean>;

// Данные для создания бронирования (без ID)
export interface CreateBookingData {
  userId: string;
  teacherId: string;
  name: string;
  email: string;
  phone: string;
  reason: string;
  bookingDate: string; // Нове поле
  comment?: string; // Нове поле (опціональне)
  createdAt: number;
}

// Данные бронирования с сервера (с ID)
export interface BookingData extends CreateBookingData {
  id: string;
}
