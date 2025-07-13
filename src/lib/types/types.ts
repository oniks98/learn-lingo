export interface Review {
  reviewer_name: string;
  reviewer_rating: number;
  comment: string;
}

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

export interface TeacherExtraInfo {
  experience: string;
  reviews: Review[];
}

export interface TeacherInfoModal {
  id: string;
  name: string;
  surname: string;
  avatar_url: string;
}
