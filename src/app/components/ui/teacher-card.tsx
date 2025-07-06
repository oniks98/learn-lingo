'use client';

import React, { useState } from 'react';
import { TeacherPreview } from '@/lib/utils/types';

type Props = {
  teacher: TeacherPreview;
};

export default function TeacherCard({ teacher }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl bg-white p-6 shadow transition-all duration-300">
      <div className="flex items-center">
        <img
          src={teacher.avatar_url}
          alt={`${teacher.name} ${teacher.surname}`}
          className="h-16 w-16 rounded-full border-2 border-yellow-400"
        />
        <div className="ml-4 flex-1">
          <h2 className="text-xl font-semibold">
            {teacher.name} {teacher.surname}
          </h2>
          <p className="text-sm text-gray-500">
            Languages: {teacher.languages.join(', ')}
          </p>
        </div>
        <div className="text-right text-sm">
          ⭐ {teacher.rating.toFixed(1)} <br />
          {teacher.lessons_done} lessons
        </div>
      </div>

      <p className="mt-4 line-clamp-3 text-gray-700">{teacher.lesson_info}</p>

      <button
        onClick={() => setExpanded((v) => !v)}
        className="mt-2 text-sm text-blue-600 hover:underline"
      >
        {expanded ? 'Show less' : 'Read more'}
      </button>

      {expanded && (
        <div className="mt-4 space-y-1 text-sm text-gray-700">
          <p>
            <strong>Levels:</strong> {teacher.levels.join(', ')}
          </p>
          <p>
            <strong>Price:</strong> {teacher.price_per_hour}$
          </p>
          {teacher.conditions?.length > 0 && (
            <p>
              <strong>Conditions:</strong> {teacher.conditions.join(', ')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
