'use client';

import React from 'react';
import Image from 'next/image';
import { MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

import Telegram from '@/lib/icons/telegram.svg';
import Viber from '@/lib/icons/viber.svg';
import WhatsApp from '@/lib/icons/whatsapp.svg';
import Linkedin from '@/lib/icons/linkedin.svg';

export default function Footer() {
  const t = useTranslations('footer');

  const socialLinks = [
    {
      name: 'Telegram',
      url: 'https://t.me/deist403',
      IconComponent: Telegram,
      color: 'hover:text-blue-500',
    },
    {
      name: 'Viber',
      url: 'viber://chat?number=+380633388260',
      IconComponent: Viber,
      color: 'hover:text-purple-500',
    },
    {
      name: 'WhatsApp',
      url: 'https://wa.me/+380633388260',
      IconComponent: WhatsApp,
      color: 'hover:text-green-500',
    },
    {
      name: 'Linkedin',
      url: 'https://www.linkedin.com/in/yurii-shpuryk-04ab86338/',
      IconComponent: Linkedin,
      color: 'hover:text-blue-500',
    },
  ];

  const handleScotlandClick = () => {
    const lat = 57.0;
    const lng = -5.0;
    const url = `https://www.google.com/maps?q=${lat},${lng}&z=6`;
    window.open(url, '_blank');
  };

  return (
    <footer className="bg-gray-light border-t border-gray-200">
      <div className="mx-auto max-w-338 px-5 py-4">
        {/* Верхний блок */}
        <div className="mb-4 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          {/* Герб и замок */}
          <div className="flex items-center justify-center gap-4 md:justify-start">
            <div className="group relative">
              <Image
                src="/images/crest.png"
                alt="Crest"
                width={80}
                height={80}
                className="h-20 w-20 object-contain transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <div className="group relative overflow-hidden rounded-lg">
              <Image
                src="/images/school.png"
                alt="Castle"
                width={120}
                height={80}
                className="relative z-10 h-20 w-30 object-cover transition-all duration-500 group-hover:scale-105"
              />
              <Image
                src="/images/azcaban.png"
                alt="Azkaban"
                width={120}
                height={80}
                className="pointer-events-none absolute top-0 left-0 z-20 h-20 w-30 object-cover opacity-0 blur-sm brightness-50 transition-all duration-700 ease-out group-hover:scale-130 group-hover:opacity-100 group-hover:blur-none group-hover:brightness-100"
              />
            </div>
          </div>

          {/* Копирайт */}
          <div className="text-center">
            <p className="text-dark-70 text-sm">{t('copyright')}</p>
          </div>

          {/* Локация */}
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

        {/* Нижний блок */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
            {/* Соц. иконки */}
            <div className="flex justify-center gap-6">
              {socialLinks.map((social, i) => {
                const { IconComponent } = social;
                return (
                  <motion.a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group relative ${social.color}`}
                    whileInView={{ rotate: 360 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{
                      duration: 0.8,
                      delay: i * 0.1,
                      ease: 'easeOut',
                    }}
                    title={social.name}
                  >
                    <IconComponent
                      width={24}
                      height={24}
                      className="text-dark transition-transform duration-300 group-hover:scale-110"
                    />
                    <span className="bg-dark pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 transform rounded px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      {social.name}
                    </span>
                  </motion.a>
                );
              })}
            </div>

            {/* Разработка */}
            <div className="text-center md:text-right">
              <p className="text-dark-70 text-[10px]">{t('development')}</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
