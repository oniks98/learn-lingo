'use client';

import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Telegram from '@/lib/icons/telegram.svg';
import Viber from '@/lib/icons/viber.svg';
import WhatsApp from '@/lib/icons/whatsapp.svg';
import Linkedin from '@/lib/icons/linkedin.svg';

export default function Footer() {
  const [isVisible, setIsVisible] = useState(false);
  const t = useTranslations('footer');

  useEffect(() => {
    // Запускаем анимацию после монтирования компонента
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const socialLinks = [
    {
      name: 'Telegram',
      url: 'https://t.me/deist403',
      IconComponent: Telegram,
      color: 'hover:text-blue-500',
      delay: '0s',
    },
    {
      name: 'Viber',
      url: 'viber://chat?number=+380633388260',
      IconComponent: Viber,
      color: 'hover:text-purple-500',
      delay: '0.2s',
    },
    {
      name: 'WhatsApp',
      url: 'https://wa.me/+380633388260',
      IconComponent: WhatsApp,
      color: 'hover:text-green-500',
      delay: '0.4s',
    },
    {
      name: 'Linkedin',
      url: 'https://www.linkedin.com/in/yurii-shpuryk-04ab86338/',
      IconComponent: Linkedin,
      color: 'hover:text-blue-500',
      delay: '0.4s',
    },
  ];

  const handleScotlandClick = () => {
    // Координаты Шотландии: 57° с. ш. 5° з. д.
    const lat = 57.0;
    const lng = -5.0;
    const url = `https://www.google.com/maps?q=${lat},${lng}&z=6`;
    window.open(url, '_blank');
  };

  return (
    <footer className="bg-gray-light border-t border-gray-200">
      <div className="mx-auto max-w-338 px-5 py-4">
        {/* Основной контент футера */}
        <div className="mb-4 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          {/* Герб и замок */}
          <div className="flex items-center justify-center gap-4 md:justify-start">
            <div className="group relative">
              <img
                src="/images/crest.png"
                alt="Crest"
                className="h-20 w-20 object-contain transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <div className="group relative overflow-hidden rounded-lg">
              <img
                src="/images/school.png"
                alt="Castle"
                className="h-20 w-30 object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Копирайт */}
          <div className="text-center">
            <p className="text-dark-70 text-sm">{t('copyright')}</p>
          </div>

          {/* Локация и переключатель языков */}
          <div className="flex justify-center gap-3 md:justify-end">
            <button
              onClick={handleScotlandClick}
              className="group flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <MapPin
                size={20}
                className="text-dark group-hover:text-yellow transition-colors duration-300"
              />
              <div className="text-left">
                <div className="text-dark text-sm font-medium">
                  {t('location.country')}
                </div>
                <div className="text-dark-70 text-xs">
                  {t('location.coordinates')}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Нижняя секция - Социальные иконки и разработка */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
            {/* Социальные иконки */}
            <div className="flex justify-center gap-6">
              {socialLinks.map((social) => {
                const { IconComponent } = social;
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group relative transition-all duration-500 ease-out ${isVisible ? 'animate-spin-settle' : 'opacity-0'} ${social.color} `}
                    style={{
                      animationDelay: isVisible ? social.delay : '0s',
                    }}
                    title={social.name}
                  >
                    {/*<div className="rounded-full bg-white p-1 shadow-md transition-all duration-300 group-hover:scale-110 hover:shadow-lg">*/}
                    <IconComponent
                      width={24}
                      height={24}
                      className="text-dark transition-colors duration-300 group-hover:scale-110"
                    />
                    {/*</div>*/}

                    {/* Тултип */}
                    <span className="bg-dark pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 transform rounded px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      {social.name}
                    </span>
                  </a>
                );
              })}
            </div>

            {/* Разработка сайтов */}
            <div className="text-center md:text-right">
              <p className="text-dark-70 text-[10px]">{t('development')}</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
