'use client';

import LoginFormModal from '@/app/components/modal/login-form-modal';
import { useRouter } from 'next/navigation';

export default function LoginFormModalPage() {
  const router = useRouter();
  return <LoginFormModal isOpen={true} onCloseAction={() => router.back()} />;
}
