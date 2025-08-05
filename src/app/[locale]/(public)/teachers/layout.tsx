// src/app/teachers/layout.tsx
import React from 'react';
import PendingActionsHandler from '@/components/handlers/pending-actions-handler';

interface TeachersLayoutProps {
  children: React.ReactNode;
  modal: React.ReactNode;
}

export default function TeachersLayout({
  children,
  modal,
}: TeachersLayoutProps) {
  return (
    <>
      {children}
      {modal}
      <PendingActionsHandler />
    </>
  );
}
