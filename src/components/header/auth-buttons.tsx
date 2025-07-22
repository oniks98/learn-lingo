// src/components/header/auth-buttons.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/button';
import clsx from 'clsx';
import LogInIcon from '@/lib/icons/log-in.svg';
import LogOutIcon from '@/lib/icons/log-out.svg';
import { useAuth } from '@/contexts/auth-context';

export interface AuthButtonsProps {
  className?: string;
}

export default function AuthButtons({ className }: AuthButtonsProps) {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.push('/', { scroll: false });
  };

  // Пользователь считается аутентифицированным только если email подтвержден
  const isAuthenticated = user && user.emailVerified;

  return (
    <div
      className={clsx(
        'grid grid-cols-[repeat(2,auto)] items-center gap-[1.18cqw]',
        className,
      )}
    >
      {!isAuthenticated ? (
        <>
          <Button
            className="grid h-13 grid-cols-[20px_1fr] items-center gap-2 bg-white px-4 py-[14px]"
            onClick={() => router.push('/login', { scroll: false })}
          >
            <LogInIcon className="h-5 w-5" role="img" aria-label="Log In" />
            <span className="text-base leading-5">Log in</span>
          </Button>

          <Button
            className="bg-dark hover:text-dark px-[2.8cqw] py-[14px] text-white"
            onClick={() => router.push('/signup', { scroll: false })}
          >
            <span className="text-base leading-5">Registration</span>
          </Button>
        </>
      ) : (
        <>
          <Button
            className="grid h-13 grid-cols-[20px_1fr] items-center gap-2 bg-white px-[1.18cqw] py-[14px]"
            onClick={handleLogout}
          >
            <LogOutIcon className="h-5 w-5" role="img" aria-label="Log Out" />
            <span className="text-base leading-5">Log out</span>
          </Button>

          <Button
            className="bg-dark hover:text-dark px-[2.8cqw] py-[14px] text-white"
            onClick={() =>
              router.push(`/users/${user.uid}/profile`, { scroll: false })
            }
          >
            <span className="text-base leading-5">Profile</span>
          </Button>
        </>
      )}
    </div>
  );
}
