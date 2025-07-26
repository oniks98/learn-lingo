// src/app/teachers/layout.tsx
import React from 'react';
import PendingActionsHandler from '@/components/pending-actions-handler';

export default function Teachers({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
      <PendingActionsHandler />
    </>
  );
}
