"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AIPage() {
  const router = useRouter();
  useEffect(() => {
    // Redirect to home — the AI assistant is available as a floating widget across the app.
    router.replace('/');
  }, [router]);
  return null;
}
