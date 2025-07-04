import React from 'react';
import Link from 'next/link';

export interface NavigationProps {
  className?: string;
}

interface NavigationItemType {
  href: string;
  label: string;
}

export default function Navigation({ className }: NavigationProps) {
  const items: NavigationItemType[] = [
    { href: '/', label: 'Home' },
    { href: '/teachers', label: 'Teachers' },
    { href: '/favorites', label: 'Favorites' },
  ];

  return (
    <nav className={className}>
      <ul className="grid grid-flow-col items-center gap-6">
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href}>
              <span className="text-dark hover:text-yellow text-base/5 font-normal transition-colors">
                {item.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
