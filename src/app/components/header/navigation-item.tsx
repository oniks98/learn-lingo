import React from 'react';
import Link from 'next/link';

export interface NavigationItemProps {
  pathname: string;
  children: React.ReactNode;
}

export default function NavigationItem({
  pathname,
  children,
}: NavigationItemProps) {
  return (
    <li>
      <Link href={pathname}>
        <span className="text-dark hover:text-yellow text-base/5 font-normal transition-colors">
          {children}
        </span>
      </Link>
    </li>
  );
}
