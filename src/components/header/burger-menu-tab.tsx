'use client';

import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import { Menu as MenuIcon } from 'lucide-react';
import clsx from 'clsx';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useTranslations } from 'next-intl';
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

export default function BurgerMenuTab({ className }: BurgerMenuProps) {
  const { user } = useAuth();
  const tNav = useTranslations('navigation');
  const tMenu = useTranslations('menu');

  const isAuthenticated = user && user.emailVerified;

  const items: MenuItemType[] = [
    // Основна навігація - завжди видима
    { type: 'link', href: '/', label: tNav('home') },
    { type: 'link', href: '/teachers', label: tNav('teachers') },
  ];

  if (isAuthenticated) {
    // Приватні розділи для автентифікованих користувачів
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
