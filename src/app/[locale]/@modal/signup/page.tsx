// src/app/@modal/signup/page.tsx
'use client';

import SignUpFormModal from '@/components/modal/sign-up-form-modal';
import { useRouter } from 'next/navigation';

export default function SignUpFormModalPage() {
  const router = useRouter();

  return <SignUpFormModal isOpen={true} onCloseAction={() => router.back()} />;
}
