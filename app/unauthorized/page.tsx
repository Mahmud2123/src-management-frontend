// app/unauthorized/page.tsx
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { UnauthorizedAccess } from '@/components/UnauthorizedAccess';

type UnauthorizedType =
  | 'unauthorized'
  | 'forbidden'
  | 'session-expired';

function UnauthorizedContent() {
  const searchParams = useSearchParams();

  const rawType = searchParams.get('type');

  const type: UnauthorizedType =
    rawType === 'forbidden' ||
    rawType === 'session-expired' ||
    rawType === 'unauthorized'
      ? rawType
      : 'unauthorized';

  const message = searchParams.get('message') || undefined;

  return (
    <UnauthorizedAccess
      type={type}
      message={message}
    />
  );
}

export default function UnauthorizedPage() {
  return (
    <Suspense fallback={null}>
      <UnauthorizedContent />
    </Suspense>
  );
}