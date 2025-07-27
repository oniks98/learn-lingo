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

// Контекст аутентифікації на клієнті
export interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refetchUser: () => Promise<any>;
}

// Типи для auth actions
export interface AuthActionsType {
  signUp: (email: string, password: string, name: string) => Promise<UserData>;
  signIn: (email: string, password: string) => Promise<UserData>;
  signInWithGoogle: (redirectPath?: string) => Promise<void>;
}

// Тип для результата входа/регистрации
export interface SignInResult extends UserData {
  needsEmailVerification?: boolean;
}

// Тип избранных учителей
export type Favorites = Record<string, boolean>;

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

// Тип для добавления/удаления избранного
export interface FavoriteAction {
  teacherId: string;
}

// Тип для ответа API избранных
export interface FavoritesResponse {
  favorites: TeacherPreview[];
}

// Тип для проверки статуса избранного
export interface FavoriteStatusResponse {
  isFavorite: boolean;
}
