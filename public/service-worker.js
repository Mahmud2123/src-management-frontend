try {
  self.addEventListener('push', function (event) {
    let payload = {};
    try {
      payload = event.data ? event.data.json() : {};
    } catch (e) {
      // event.data.text() might not be available in all contexts
      try {
        payload = { title: 'Notification', message: event.data && event.data.text ? event.data.text() : '' };
      } catch (ee) {
        payload = { title: 'Notification', message: '' };
      }
    }

    const title = payload.title || 'SRC Portal';
    const options = {
      body: payload.message || payload.body || '',
      data: payload,
      // Use existing app icons from public/ to avoid missing-icon issues
      icon: '/src-logo.png',
      badge: '/favicon-32x32.png',
      timestamp: Date.now(),
    };

    try {
      // DEBUG: console.debug('[SW] push event received, showing notification', { title, options });
    } catch (e) {}

    event.waitUntil(self.registration.showNotification(title, options));
  });

  self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    const data = event.notification.data || {};
    const url = data.url || data.referenceUrl || '/';

    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
        for (const client of clientList) {
          try {
            if (client.url === url && 'focus' in client) {
              return client.focus();
            }
          } catch (e) {
            // ignore
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      }),
    );
  });
} catch (swInitError) {
  // Catch any unexpected errors during service worker evaluation so registration doesn't fail silently
  // Note: service worker exceptions will show in browser console; we log a minimal message here.
  console.error('Service worker initialization failed:', swInitError);
  // Provide no-op handlers to keep the worker alive without crashing
  self.addEventListener && self.addEventListener('install', function () {});
}