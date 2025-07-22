// src/components/email-verification.tsx
'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { auth } from '@/lib/db/firebase-client';
import { applyActionCode, reload } from 'firebase/auth';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';

export default function EmailVerification() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const mode = searchParams.get('mode');
    const oobCode = searchParams.get('oobCode');

    if (mode !== 'verifyEmail' || !oobCode) return;

    const verifyEmail = async () => {
      try {
        await applyActionCode(auth, oobCode);

        if (auth.currentUser) {
          await reload(auth.currentUser);
          await refreshUser();
        }

        toast.success('Email verified successfully!');

        router.replace(window.location.pathname);
      } catch (error: any) {
        toast.error(
          error.code === 'auth/invalid-action-code'
            ? 'Invalid or expired verification code.'
            : 'Email verification failed.',
        );
        router.replace(window.location.pathname);
      }
    };

    verifyEmail();
  }, []);

  return null;
}
