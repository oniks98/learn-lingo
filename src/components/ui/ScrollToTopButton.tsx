'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/button';

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 300); // Показувати кнопку після 300px скролу вниз
    }

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <div className="fixed right-8 bottom-8 z-50">
      <Button
        onClick={scrollToTop}
        className="rounded-full px-4 py-2 text-sm font-bold shadow-lg"
        aria-label="Scroll to top"
      >
        UP
      </Button>
    </div>
  );
}
