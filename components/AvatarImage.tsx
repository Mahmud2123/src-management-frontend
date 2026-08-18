'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function AvatarImage({ userId, name, size = 40, className = '', onClick, avatarUrl }: { userId?: string; name?: string; size?: number | string; className?: string; onClick?: () => void; avatarUrl?: string | null }) {
  const normalizeAvatarUrl = (value?: string | null) => {
    if (!value) return null;
    const trimmed = String(value).trim();
    if (!trimmed || trimmed === '?' || trimmed === 'null' || trimmed === 'undefined') return null;

    // Only accept absolute HTTP/S, data:, or blob: URLs directly in the img src.
    try {
      const u = new URL(trimmed);
      const allowed = ['http:', 'https:', 'data:', 'blob:'];
      if (allowed.includes(u.protocol)) return trimmed;
      // any unknown protocol (eg r2://) should not be used directly by the browser
      return null;
    } catch (e) {
      // If it's a relative path (starts with /) allow it as-is
      if (trimmed.startsWith('/')) return trimmed;
      return null;
    }
  };

  const [failed, setFailed] = useState(false);
  const [src, setSrc] = useState<string | null>(() => normalizeAvatarUrl(avatarUrl) || (userId ? `/api/files/users/${userId}/avatar/redirect` : null));

  useEffect(() => {
    setFailed(false);
    const resolved = normalizeAvatarUrl(avatarUrl) || (userId ? `/api/files/users/${userId}/avatar/redirect` : null);
    setSrc(resolved);
  }, [userId, avatarUrl]);

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
