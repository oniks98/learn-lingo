// src/app/components/header/navigation.tsx
'use client';

import { Link, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import clsx from 'clsx';
import { useAuth } from '@/contexts/auth-context';

export interface NavigationProps {
  className?: string;
}

interface NavigationItemType {
  href: string;
  label: string;
}

export default function Navigation({ className }: NavigationProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const t = useTranslations('navigation');

  // Пользователь считается аутентифицированным только если email подтвержден
  const isAuthenticated = user && user.emailVerified;

  const items: NavigationItemType[] = [
    { href: '/', label: t('home') },
    { href: '/teachers', label: t('teachers') },
  ];

  // Приватные разделы доступны только подтвержденным пользователям
  if (isAuthenticated) {
    items.push(
      { href: `/users/${user.uid}/favorites`, label: t('favorites') },
      { href: `/users/${user.uid}/bookings`, label: t('bookings') },
    );
  }

  return (
    <nav className={className}>
      <ul className="grid grid-flow-col items-center gap-[1.8cqw]">
        {items.map((item) => {
          const isActive = pathname === item.href;

          return (
            <li key={item.href}>
              <Link href={item.href}>
                <span
                  className={clsx(
                    'leading-tight transition-colors',
                    isActive ? 'text-yellow' : 'text-dark hover:text-yellow',
                  )}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
