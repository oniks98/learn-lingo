'use client';

import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import { Menu as MenuIcon } from 'lucide-react';
import clsx from 'clsx';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/header/language-switcher';
import React from 'react';

export interface BurgerMenuProps {
  className?: string;
}

type NavigationItem = {
  type: 'link';
  href: string;
  label: string;
};

type ActionItem = {
  type: 'action';
  action: () => Promise<void>;
  label: string;
};

type MenuItemType = NavigationItem | ActionItem;

export default function BurgerMenuMob({ className }: BurgerMenuProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const t = useTranslations('auth');
  const tNav = useTranslations('navigation');
  const tCommon = useTranslations('common');
  const tMenu = useTranslations('menu');

  const handleLogout = async () => {
    await signOut();
    router.push('/', { scroll: false });
  };

  const isAuthenticated = user && user.emailVerified;

  const items: MenuItemType[] = [
    // Основная навигация - всегда видна
    { type: 'link', href: '/', label: tNav('home') },
    { type: 'link', href: '/teachers', label: tNav('teachers') },
  ];

  if (isAuthenticated) {
    // Приватные разделы для аутентифицированных пользователей
    items.push(
      {
        type: 'link',
        href: `/users/${user.uid}/favorites`,
        label: tNav('favorites'),
      },
      {
        type: 'link',
        href: `/users/${user.uid}/bookings`,
        label: tNav('bookings'),
      },
      {
        type: 'link',
        href: `/users/${user.uid}/profile`,
        label: tCommon('profile'),
      },
      // Действие logout
      { type: 'action', action: handleLogout, label: t('logout') },
    );
  } else {
    // Ссылки для неаутентифицированных пользователей
    items.push(
      { type: 'link', href: '/login', label: t('login') },
      { type: 'link', href: '/signup', label: t('registration') },
    );
  }

  return (
    <Menu as="nav" className={clsx('relative', className)}>
      {({ open }) => (
        <>
          <MenuButton
            className={clsx(
              'p-2',
              'hover:bg-yellow-light transition-colors',
              'border-yellow rounded-lg border',
              'focus:outline-none',
              'active:scale-80',
            )}
            aria-label={open ? tMenu('closeMenu') : tMenu('openMenu')}
          >
            <MenuIcon
              className={clsx(
                'h-5 w-5 transition-transform',
                open && 'rotate-90',
              )}
            />
          </MenuButton>

          <MenuItems
            className={clsx(
              'absolute right-0 mt-3 w-40',
              'rounded-xl bg-white ring-1 ring-gray-200',
              'z-50 focus:outline-none',
            )}
          >
            <div className="flex justify-center p-2">
              <LanguageSwitcher className="md:hidden" />
            </div>

            <div className="p-2">
              {items.map((item, index) => (
                <MenuItem key={index}>
                  {({ focus }) => {
                    const baseClasses = clsx(
                      'block w-full px-4 py-3 text-left',
                      'text-base leading-5 font-bold',
                      'transition-colors',
                      focus ? 'text-yellow' : 'hover:text-yellow',
                    );

                    return item.type === 'action' ? (
                      <button onClick={item.action} className={baseClasses}>
                        {item.label}
                      </button>
                    ) : (
                      <Link href={item.href} className={baseClasses}>
                        {item.label}
                      </Link>
                    );
                  }}
                </MenuItem>
              ))}
            </div>
          </MenuItems>
        </>
      )}
    </Menu>
  );
}
