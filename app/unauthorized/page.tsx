// app/unauthorized/page.tsx
'use client';

import { UnauthorizedAccess } from '@/components/UnauthorizedAccess';
import { useSearchParams } from 'next/navigation';

export default function UnauthorizedPage() {
  const searchParams = useSearchParams();
  const type = (searchParams.get('type') as 'unauthorized' | 'forbidden' | 'session-expired') || 'unauthorized';
  const message = searchParams.get('message') || undefined;

  return <UnauthorizedAccess type={type} message={message} />;
}
