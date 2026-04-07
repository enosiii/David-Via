const CACHE_NAME = 'david-via-wedding-v6'; // bump this on every deploy

const urlsToCache = [
  '/',
  '/index.html',
  '/story.html',
  '/party.html',
  '/nuptials.html',
  '/wishes.html',
  '/registry.html',
  '/rsvp.html',
  '/mgame.html',
  '/install.html',
  '/css/style.css',
  '/js/main.js',
  '/js/footer.js',
  '/js/countdown.js',
  '/js/gallery.js',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Great+Vibes&family=Montserrat:wght@300;400;500;600&family=Playfair+Display:wght@400;500;600&display=swap'
];

// ============================================
// INSTALL — pre-cache all assets
// ============================================
self.addEventListener('install', event => {
  // skipWaiting forces the new SW to activate immediately
  // instead of waiting for all tabs to close
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Cache opened:', CACHE_NAME);
      return cache.addAll(urlsToCache);
    })
  );
});

// ============================================
// ACTIVATE — delete old caches, claim all tabs
// ============================================
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames =>
        Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => {
              console.log('Deleting old cache:', name);
              return caches.delete(name);
            })
        )
      )
      // clients.claim() makes this SW take control of all open tabs immediately
      // without requiring a page reload
      .then(() => self.clients.claim())
  );
});

// ============================================
// FETCH — network-first strategy
// Always tries the network first so users get
// fresh content. Falls back to cache only when
// offline or the network request fails.
// ============================================
self.addEventListener('fetch', event => {
  // Skip non-GET requests (POST to Apps Script etc.)
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests (fonts, CDN)
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Got a valid response from network — update the cache and return it
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Network failed (offline) — serve from cache
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) return cachedResponse;

          // If navigating to a page not in cache, fall back to index
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// ============================================
// BACKGROUND SYNC — offline RSVP submissions
// ============================================
self.addEventListener('sync', event => {
  if (event.tag === 'sync-rsvp') {
    event.waitUntil(syncRSVPData());
  }
});

self.addEventListener('push', event => {
  if (!event.data) return;

  const payload = event.data.json();
  const title = payload.title || 'David & Via Wedding';

  event.waitUntil(
    self.registration.showNotification(title, {
      body: payload.body || '',
      icon: payload.icon || '/assets/icon192.png',
      badge: payload.badge || '/assets/icon192.png',
      tag: payload.tag || 'wedding-reminder',
      data: {
        url: payload.url || '/',
      },
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  const targetUrl = event.notification.data && event.notification.data.url
    ? event.notification.data.url
    : '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      for (const client of clients) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

async function syncRSVPData() {
  try {
    const db = await openRSVPIndexedDB();
    const offlineData = await getAllOfflineRSVP(db);

    for (const data of offlineData) {
      const response = await fetch('https://script.google.com/macros/s/YOUR_APPS_SCRIPT_URL/exec', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        await deleteOfflineRSVP(db, data.id);
      }
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// ============================================
// INDEXEDDB HELPERS
// ============================================
function openRSVPIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('WeddingRSVP', 1);

    request.onupgradeneeded = event => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('rsvpSubmissions')) {
        db.createObjectStore('rsvpSubmissions', { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = event => resolve(event.target.result);
    request.onerror  = event => reject(event.target.error);
  });
}

function getAllOfflineRSVP(db) {
  return new Promise((resolve, reject) => {
    const tx      = db.transaction(['rsvpSubmissions'], 'readonly');
    const request = tx.objectStore('rsvpSubmissions').getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror   = () => reject(request.error);
  });
}

function deleteOfflineRSVP(db, id) {
  return new Promise((resolve, reject) => {
    const tx      = db.transaction(['rsvpSubmissions'], 'readwrite');
    const request = tx.objectStore('rsvpSubmissions').delete(id);
    request.onsuccess = () => resolve();
    request.onerror   = () => reject(request.error);
  });
}
