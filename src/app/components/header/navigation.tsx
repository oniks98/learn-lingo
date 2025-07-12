'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export interface NavigationProps {
  className?: string;
}

interface NavigationItemType {
  href: string;
  label: string;
}

export default function Navigation({ className }: NavigationProps) {
  const pathname = usePathname();

  const items: NavigationItemType[] = [
    { href: '/', label: 'Home' },
    { href: '/teachers', label: 'Teachers' },
    { href: '/favorites', label: 'Favorites' },
  ];

  return (
    <nav className={className}>
      <ul className="grid grid-flow-col items-center gap-6">
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
