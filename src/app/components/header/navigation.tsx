import React from 'react';
import NavigationItem from './navigation-item';

export interface NavigationProps {
  className?: string;
}

export default function Navigation({ className }: NavigationProps) {
  return (
    <nav className={className}>
      <ul className="grid w-max grid-flow-col items-center gap-[28px]">
        <NavigationItem pathname="/">Home</NavigationItem>
        <NavigationItem pathname="/teachers">Teachers</NavigationItem>
        <NavigationItem pathname="/favorites">Favorites</NavigationItem>
      </ul>
    </nav>
  );
}
