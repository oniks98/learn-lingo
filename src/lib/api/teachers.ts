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

// Get all teachers (preview data only)
export async function getAllTeachers(): Promise<TeacherPreview[]> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/teachers`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch teachers: ${response.statusText}`);
  }

  const data = await response.json();
  return data.teachers || [];
}

// Get extended teacher information by ID
export async function getTeacherExtraInfo(
  teacherId: string,
): Promise<TeacherExtraInfo | null> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/teachers/${teacherId}/extra`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

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
