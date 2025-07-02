'use client';

import React from 'react';
import Logo from './logo';
import Navigation from './navigation';
import AuthButtons from './auth-buttons';
import BurgerMenu from './burger-menu';

export interface HeaderProps {}

export default function Header({}: HeaderProps) {
  return (
    <header className="mx-auto my-5 grid max-w-[1184px] grid-cols-2 items-center justify-between py-3 md:grid-cols-[auto_1fr_auto] md:py-[5px]">
      <Logo />
      <Navigation className="hidden justify-self-center md:block" />
      <AuthButtons className="hidden justify-self-end md:grid" />
      <BurgerMenu className="block justify-self-center md:hidden" />
    </header>
  );
}
