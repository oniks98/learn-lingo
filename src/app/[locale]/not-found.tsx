'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-86 text-center">
      <h1 className="font-bold text-red-600">Page Not Found</h1>
      <p>Sorry, we couldn’t find what you’re looking for.</p>
      <Link href="/public">🏠 Go home</Link>
    </div>
  );
}
