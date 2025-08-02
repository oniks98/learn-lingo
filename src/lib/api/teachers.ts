// src/lib/api/teachers.ts
import {
  TeacherPreview,
  TeacherExtraInfo,
  TeacherInfoModal,
} from '@/lib/types/types';

// Helper function to get base URL
function getBaseUrl() {
  // For server-side rendering
  if (typeof window === 'undefined') {
    return process.env.NEXTAUTH_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';
  }
  // For client-side
  return window.location.origin;
}

// Helper function to get current locale
function getCurrentLocale(): string {
  if (typeof window === 'undefined') {
    return 'en'; // Default for SSR
  }

  // Extract locale from pathname
  const pathname = window.location.pathname;
  const localeMatch = pathname.match(/^\/([a-z]{2})\//);
  return localeMatch ? localeMatch[1] : 'en';
}

// Get all teachers (preview data only)
export async function getAllTeachers(
  locale?: string,
): Promise<TeacherPreview[]> {
  const baseUrl = getBaseUrl();
  const currentLocale = locale || getCurrentLocale();

  const response = await fetch(
    `${baseUrl}/api/teachers?locale=${currentLocale}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch teachers: ${response.statusText}`);
  }

  const data = await response.json();
  return data.teachers || [];
}

// Get extended teacher information by ID
export async function getTeacherExtraInfo(
  teacherId: string,
  locale?: string,
): Promise<TeacherExtraInfo | null> {
  const baseUrl = getBaseUrl();
  const currentLocale = locale || getCurrentLocale();

  const response = await fetch(
    `${baseUrl}/api/teachers/${teacherId}/extra?locale=${currentLocale}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(
      `Failed to fetch teacher extra info: ${response.statusText}`,
    );
  }

  return response.json();
}

// Get teacher basic info by ID (for modals, booking cards, etc.)
// This doesn't need localization as it only returns basic info
export async function getTeacherById(
  teacherId: string,
): Promise<TeacherInfoModal | null> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/teachers/${teacherId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`Failed to fetch teacher: ${response.statusText}`);
  }

  return response.json();
}
