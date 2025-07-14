// src/contexts/location-context.tsx
'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface LocationContextType {
  prevPath: string;
}

const LocationContext = createContext<LocationContextType>({ prevPath: '/' });

export const useLocationTracker = () => useContext(LocationContext);

export const LocationProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const pathname = usePathname();
  const prevPathRef = useRef<string>('/');

  useEffect(() => {
    // Якщо ми на будь‑якому шляху, крім сторінки реєстрації,
    // оновлюємо prevPath
    if (pathname !== '/signup') {
      prevPathRef.current = pathname;
    }
  }, [pathname]);

  return (
    <LocationContext.Provider value={{ prevPath: prevPathRef.current }}>
      {children}
    </LocationContext.Provider>
  );
};
