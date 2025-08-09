// src/lib/types/types.ts

// Загальний тип для відгуків
export interface Review {
  reviewer_name: string;
  reviewer_rating: number;
  comment: string;
}

// Мінімальна інформація про вчителя
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

// Розширена інформація про вчителя
export interface TeacherExtraInfo {
  experience: string;
  reviews: Review[];
}

// Коротка інформація про вчителя (для модалки)
export interface TeacherInfoModal {
  id: string;
  name: string;
  surname: string;
  avatar_url: string;
}

// Дані користувача в базі
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

// Дані для створення бронювання (без ID)
export interface CreateBookingData {
  userId: string;
  teacherId: string;
  name: string;
  email: string;
  phone: string;
  reason: string;
  bookingDate: Date;
  comment?: string;
  createdAt: number;
}

// Дані бронювання з сервера (з ID)
export interface BookingData extends CreateBookingData {
  id: string;
}

// Тип для локализованных данных учителя
export interface LocalizedTeacherData {
  lesson_info?: string;
  conditions?: string[];
}

// Тип для данных учителя из Firebase
export interface FirebaseTeacherData {
  name: string;
  surname: string;
  languages: string[];
  levels: string[];
  rating: number;
  price_per_hour: number;
  lessons_done: number;
  avatar_url: string;
  localized?: {
    [locale: string]: LocalizedTeacherData;
  };
}

export interface ChangeEmailRequest {
  oobCode: string;
}

export interface ChangeEmailResponse {
  success: boolean;
  newEmail: string;
  user?: {
    uid: string;
    email: string;
    emailVerified: boolean;
    displayName?: string;
    photoURL?: string;
  };
}

export interface ChangeEmailError extends Error {
  message: string;
}
