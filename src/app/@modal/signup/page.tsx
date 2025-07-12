'use client';

import SignUpFormModal from '@/app/components/modal/sign-up-form-modal';
import { useRouter } from 'next/navigation';

export default function SignUpFormModalRoute() {
  const router = useRouter();
  return <SignUpFormModal isOpen={true} onCloseAction={() => router.back()} />;
}
