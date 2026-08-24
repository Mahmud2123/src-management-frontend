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
      if (allowed.includes(u.protocol)) {
        // For known CDN hosts prefer proxying through the backend so the browser
        // doesn't request the external host directly (avoids next/image upstream errors)
        const cdnHosts = ['assets.srcsazu.com', 'cdn.srcsazu.com'];
        if (cdnHosts.includes(u.hostname)) {
          return `/api/files/proxy?fileUrl=${encodeURIComponent(trimmed)}`;
        }
        return trimmed;
      }
      // any unknown protocol (eg r2://) should not be used directly by the browser
      return null;
    } catch (e) {
      // If it's a relative path (starts with /) allow it as-is
      if (trimmed.startsWith('/')) return trimmed;
      return null;
    }
  };

  const [failed, setFailed] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 2;
  const [src, setSrc] = useState<string | null>(() => normalizeAvatarUrl(avatarUrl) || (userId ? `/api/files/users/${userId}/avatar/redirect` : null));

  useEffect(() => {
    setFailed(false);
    setAttempts(0);
    const resolved = normalizeAvatarUrl(avatarUrl) || (userId ? `/api/files/users/${userId}/avatar/redirect` : null);
    setSrc(resolved);
  }, [userId, avatarUrl]);

  const resolveViaBackend = async (fileUrl: string | null) => {
    if (!fileUrl) return null;
    try {
      const q = encodeURIComponent(fileUrl);
      const resp = await fetch(`/api/files/resolve?fileUrl=${q}`);
      if (!resp.ok) return null;
      const body = await resp.json();
      return body?.url || null;
    } catch (e) {
      return null;
    }
  };

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

  const handleError = async () => {
    // Try resolving via backend once before showing initials
    if (attempts >= maxAttempts) {
      setFailed(true);
      return;
    }
    setAttempts((a) => a + 1);
    const fileUrlToResolve = avatarUrl || src || null;
    const resolved = await resolveViaBackend(fileUrlToResolve);
    if (resolved && resolved !== src) {
      setSrc(resolved);
      return;
    }
    // nothing useful returned
    setFailed(true);
  };

  // onLoad uses the browser event; extract naturalWidth/naturalHeight from event.currentTarget
  const handleLoad = async (ev: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // The backend proxy returns a tiny 1x1 PNG placeholder when upstream is missing.
    // If the loaded image is 1x1, attempt a backend resolve to get a signed URL before falling back.
    const target = ev.currentTarget as HTMLImageElement;
    const w = target?.naturalWidth || 0;
    const h = target?.naturalHeight || 0;
    if (w === 1 && h === 1 && attempts < maxAttempts) {
      setAttempts((a) => a + 1);
      const fileUrlToResolve = avatarUrl || src || null;
      const resolved = await resolveViaBackend(fileUrlToResolve);
      if (resolved && resolved !== src) {
        setSrc(resolved);
        return;
      }
      setFailed(true);
    }
  };

  return (
    <div style={{ width: sizePx, height: sizePx }} className={`${className} rounded-full overflow-hidden`} onClick={onClick}>
      <Image
        src={src!}
        alt={name || 'User avatar'}
        width={sizeNum}
        height={sizeNum}
        onError={handleError}
        onLoad={handleLoad}
        className="object-cover"
        priority={false}
        unoptimized={Boolean(src && (src.startsWith('/api/files') || src.includes('r2.cloudflarestorage.com') || src.includes('src-sazu-uploads')))}
      />
    </div>
  );
}
