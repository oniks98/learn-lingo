// app/global-error.tsx
'use client';

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
        <div
          style={{
            maxWidth: '400px',
            margin: '50px auto',
            textAlign: 'center',
            padding: '20px',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <h2 style={{ color: '#dc2626', marginBottom: '16px' }}>
            Something went wrong!
          </h2>
          <p style={{ marginBottom: '16px', color: '#666' }}>
            A critical error occurred. Please try again.
          </p>
          {error.message && (
            <pre
              style={{
                fontSize: '12px',
                color: '#666',
                marginBottom: '16px',
                textAlign: 'left',
                overflow: 'auto',
              }}
            >
              {error.message}
            </pre>
          )}
          {error.digest && (
            <p style={{ fontSize: '12px', marginBottom: '16px' }}>
              Error Code: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
