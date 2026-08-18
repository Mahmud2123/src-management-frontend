// lib/api/push.ts
// Dedicated push subscribe helper that posts a normalized subscription to the backend


const toBase64Url = (ab: ArrayBuffer | null) => {
  if (!ab) return null;
  const uint8 = new Uint8Array(ab as ArrayBuffer);
  let str = '';
  for (let i = 0; i < uint8.length; i++) str += String.fromCharCode(uint8[i]);
  try {
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (e) {
    try { return Buffer.from(uint8).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); } catch { return null; }
  }
};

export async function subscribeToPush(subscription: any) {
  let keys = (subscription && subscription.keys) || {};
  if ((!keys || !keys.p256dh) && subscription && typeof subscription.getKey === 'function') {
    try {
      keys = {
        p256dh: toBase64Url(subscription.getKey('p256dh') as ArrayBuffer),
        auth: toBase64Url(subscription.getKey('auth') as ArrayBuffer),
      };
    } catch (e) {
      console.warn('[push] failed to extract keys via getKey', e);
    }
  }

  const payload: any = {
    endpoint: subscription?.endpoint,
    keys,
  };

  // Use fetch to ensure Authorization header can be specified reliably (bypass any broken interceptor)
  const token = typeof window !== 'undefined' ? localStorage.getItem('src_token') : null;
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    credentials: 'include',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Push subscribe failed ${res.status}: ${text.slice(0, 400)}`);
  }

  return res.json();
}

export async function getVapidPublicKey() {
  const res = await fetch('/api/push/public-key');
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`VAPID key fetch failed ${res.status}: ${text.slice(0, 400)}`);
  }
  const data = await res.json();
  // accept either { publicKey } or plain string
  if (data && data.publicKey) return data.publicKey;
  if (typeof data === 'string') return data;
  throw new Error('Unexpected VAPID key shape');
}

export async function unsubscribeFromPush(endpoint: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('src_token') : null;
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch('/api/push/unsubscribe', {
    method: 'DELETE',
    headers,
    credentials: 'include',
    body: JSON.stringify({ endpoint }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Unsubscribe failed ${res.status}: ${text.slice(0,400)}`);
  }
  return res.json();
}
