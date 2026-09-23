// Custom Service Worker khusus untuk Push Notifications
console.log('Notifications SW loaded');

// Install event
self.addEventListener('install', event => {
  console.log('Notifications SW installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', event => {
  console.log('Notifications SW activating...');
  event.waitUntil(clients.claim());
});

// Push notification event
self.addEventListener('push', event => {
  console.log('Push event received:', event);
  
  if (!event.data) {
    console.log('No data in push event');
    return;
  }

  try {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'Anda memiliki pesan baru',
      icon: '/favicon.ico',
      badge: '/images/icon.png',
      tag: data.tag || 'rekber-notification',
      requireInteraction: false,
      silent: false,
      vibrate: [200, 100, 200],
      data: data.data || {},
      actions: [
        {
          action: 'view',
          title: 'Lihat',
          icon: '/favicon.ico'
        },
        {
          action: 'dismiss',
          title: 'Tutup',
          icon: '/favicon.ico'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Rekber.com', options)
    );
  } catch (error) {
    console.error('Error parsing push data:', error);
    
    event.waitUntil(
      self.registration.showNotification('Rekber.com', {
        body: 'Anda memiliki notifikasi baru',
        icon: '/favicon.ico',
        badge: '/images/icon.png'
      })
    );
  }
});

// Handle notification click
self.addEventListener('notificationclick', event => {
  console.log('Notification click received:', event);
  
  event.notification.close();

  if (event.action === 'view' || !event.action) {
    const url = event.notification.data?.url || '/dashboard';
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
        for (const client of clientList) {
          if (client.url.includes('dashboard') && 'focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  }
});

// Handle notification close
self.addEventListener('notificationclose', event => {
  console.log('Notification closed:', event.notification.tag);
});