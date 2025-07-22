'use client';

import SignUpFormModal from '@/components/modal/sign-up-form-modal';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export default function SignUpFormModalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const hasShownRef = useRef(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || hasShownRef.current) return;

    if (error === 'user_exists') {
      hasShownRef.current = true;
      setTimeout(() => {
        toast.error('Ця пошта вже зареєстрована. Спробуйте іншу.');
        router.replace('/signup'); // очищаем URL
      }, 100); // небольшая задержка на монтирование
    }
  }, [mounted, error, router]);

  return <SignUpFormModal isOpen={true} onCloseAction={() => router.back()} />;
}
