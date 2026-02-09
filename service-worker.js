const CACHE_NAME = 'david-aira-wedding-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/story.html',
  '/party.html',
  '/wishes.html',
  '/registry.html',
  '/rsvp.html',
  '/game.html',
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

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // If both cache and network fail, show offline page
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      })
  );
});

// Background sync for offline form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'sync-rsvp') {
    event.waitUntil(syncRSVPData());
  }
});

async function syncRSVPData() {
  try {
    const db = await openRSVPIndexedDB();
    const offlineData = await getAllOfflineRSVP(db);
    
    for (const data of offlineData) {
      const response = await fetch('https://script.google.com/macros/s/YOUR_APPS_SCRIPT_URL/exec', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        await deleteOfflineRSVP(db, data.id);
      }
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// Helper functions for IndexedDB
function openRSVPIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('WeddingRSVP', 1);
    
    request.onupgradeneeded = function(event) {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('rsvpSubmissions')) {
        db.createObjectStore('rsvpSubmissions', { keyPath: 'id', autoIncrement: true });
      }
    };
    
    request.onsuccess = function(event) {
      resolve(event.target.result);
    };
    
    request.onerror = function(event) {
      reject(event.target.error);
    };
  });
}

function getAllOfflineRSVP(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['rsvpSubmissions'], 'readonly');
    const store = transaction.objectStore('rsvpSubmissions');
    const request = store.getAll();
    
    request.onsuccess = function() {
      resolve(request.result);
    };
    
    request.onerror = function() {
      reject(request.error);
    };
  });
}

function deleteOfflineRSVP(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['rsvpSubmissions'], 'readwrite');
    const store = transaction.objectStore('rsvpSubmissions');
    const request = store.delete(id);
    
    request.onsuccess = function() {
      resolve();
    };
    
    request.onerror = function() {
      reject(request.error);
    };
  });
}