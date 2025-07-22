'use client';

import Button from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="mx-auto max-w-46 text-center">
          <h2 className="font-bold text-red-600">Something went wrong!</h2>
          <pre>{error.message}</pre>
          {error.digest && <p>Error code: {error.digest}</p>}
          <Button onClick={() => reset()}>Try again</Button>
        </div>
      </body>
    </html>
  );
}
