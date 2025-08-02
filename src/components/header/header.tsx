'use client';

import React from 'react';
import Logo from '@/components/header/logo';
import Navigation from '@/components/header/navigation';
import AuthButtons from '@/components/header/auth-buttons';
import LanguageSwitcher from '@/components/header/language-switcher';
import BurgerMenuMob from '@/components/header/burger-menu-mob';
import BurgerMenuTab from '@/components/header/burger-menu-tab';
import clsx from 'clsx';

export interface HeaderProps {}

export default function Header({}: HeaderProps) {
  return (
    <header className="@container">
      <div
        className={clsx(
          'mx-auto my-5 max-w-338 px-15 py-3 md:px-17',
          'grid grid-cols-[133px_1fr] items-center justify-between',
          'md:grid-cols-[153px_4fr_1fr_auto_auto] md:py-[5px]',
          'xl:grid-cols-[153px_1fr_4fr_auto_auto]',
        )}
      >
        <Logo />
        <BurgerMenuTab className="hidden justify-self-center md:flex xl:hidden" />
        <Navigation className="col-[3] hidden justify-self-center xl:block" />
        <LanguageSwitcher className="hidden justify-self-end md:flex" />
        <AuthButtons className="hidden justify-self-end md:grid" />
        <BurgerMenuMob className="flex justify-self-end md:hidden" />
      </div>
    </header>
  );
}
