'use client';

import React from 'react';
import Logo from './logo';
import Navigation from './navigation';
import AuthButtons from './auth-buttons';
import LanguageSwitcher from './language-switcher';
import BurgerMenu from './burger-menu';
import clsx from 'clsx';

export interface HeaderProps {}

export default function Header({}: HeaderProps) {
  return (
    <header
      className={clsx(
        '@container mx-auto my-5 max-w-338 px-15 py-3 md:px-17',
        'grid grid-cols-[133px_1fr_1fr] items-center justify-between',
        'md:grid-cols-[153px_1fr_4fr_auto_auto] md:py-[5px]',
      )}
    >
      <Logo />
      <Navigation className="col-[3] hidden justify-self-center md:block" />
      <LanguageSwitcher className="flex justify-self-end" />
      <AuthButtons className="hidden justify-self-end md:grid" />
      <BurgerMenu className="block justify-self-end md:hidden" />
    </header>
  );
}
