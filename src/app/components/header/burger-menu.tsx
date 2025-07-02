'use client';

import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import { Menu as MenuIcon } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';

export interface BurgerMenuProps {
  className?: string;
}

interface MenuItemType {
  href: string;
  label: string;
}

export default function BurgerMenu({ className }: BurgerMenuProps) {
  const items: MenuItemType[] = [
    { href: '/login', label: 'Log in' },
    { href: '/signup', label: 'Registration' },
    { href: '/', label: 'Home' },
    { href: '/teachers', label: 'Teachers' },
    { href: '/favorites', label: 'Favorites' },
  ];

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
            aria-label={open ? 'Open menu' : 'Close menu'}
          >
            <MenuIcon className={clsx('h-5 w-5', open && 'rotate-90')} />
          </MenuButton>

          <MenuItems
            className={clsx(
              'absolute right-0 mt-3 w-40',
              'rounded-xl bg-white ring-1 ring-gray-200',
              'z-50 focus:outline-none',
            )}
          >
            <div className="p-2">
              {items.map((item) => (
                <MenuItem key={item.href}>
                  {({ focus }) => (
                    <Link
                      href={item.href}
                      className={clsx(
                        'grid grid-cols-1 px-4 py-3',
                        'text-base leading-5 font-bold',
                        focus ? 'text-yellow' : 'hover:text-yellow',
                      )}
                    >
                      <span>{item.label}</span>
                    </Link>
                  )}
                </MenuItem>
              ))}
            </div>
          </MenuItems>
        </>
      )}
    </Menu>
  );
}
