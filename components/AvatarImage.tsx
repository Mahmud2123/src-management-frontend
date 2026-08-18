'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function AvatarImage({ userId, name, size = 40, className = '', onClick }: { userId?: string; name?: string; size?: number | string; className?: string; onClick?: () => void }) {
  const [failed, setFailed] = useState(false);
  const [src, setSrc] = useState<string | null>(userId ? `/api/files/users/${userId}/avatar/redirect` : null);

  useEffect(() => {
    setFailed(false);
    setSrc(userId ? `/api/files/users/${userId}/avatar/redirect` : null);
  }, [userId]);

  const sizeNum = typeof size === 'number' ? size : parseInt(String(size).replace(/[^0-9]/g, ''), 10) || 40;
  const sizePx = `${sizeNum}px`;

  if (!userId || !src || failed) {
    const initial = name?.charAt(0)?.toUpperCase() || 'U';
    return (
      <div
        onClick={onClick}
        className={`flex items-center justify-center rounded-full bg-gradient-to-br from-green-700 to-green-800 text-white font-bold ${className}`}
        style={{ width: sizePx, height: sizePx }}
      >
        {initial}
      </div>
    );
  }

  return (
    <div style={{ width: sizePx, height: sizePx }} className={`${className} rounded-full overflow-hidden`} onClick={onClick}>
      <Image
        src={src}
        alt={name || 'User avatar'}
        width={sizeNum}
        height={sizeNum}
        onError={() => setFailed(true)}
        className="object-cover"
        priority={false}
      />
    </div>
  );
}
