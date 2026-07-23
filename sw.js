// Service Worker - وضع الطيران + الإشعارات
const CACHE_NAME = 'mohasba-v3';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/logo.png',
    '/images/makkah.jpg',
    '/images/madinah.jpg',
    '/images/aqsa.jpg',
    '/manifest.json'
];

// تثبيت Service Worker وتخزين الملفات مؤقتاً
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE).catch(() => {
                console.log('Some assets failed to cache, continuing...');
            });
        })
    );
    self.skipWaiting();
});

// تفعيل Service Worker وحذف الكاش القديم
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// استراتيجية: Network First, Fallback to Cache
self.addEventListener('fetch', (event) => {
    // تخطي طلبات Firebase والـ APIs
    if (event.request.url.includes('firebase') || 
        event.request.url.includes('googleapis') ||
        event.request.url.includes('aladhan.com') ||
        event.request.url.includes('gstatic.com') ||
        event.request.url.includes('unpkg.com') ||
        event.request.url.includes('cdn.jsdelivr.net') ||
        event.request.url.includes('cdnjs.cloudflare.com')) {
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match(event.request);
            })
        );
        return;
    }

    // للملفات المحلية: Cache First, Fallback to Network
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                // تحديث الكاش في الخلفية
                fetch(event.request).then((networkResponse) => {
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse);
                    });
                }).catch(() => {});
                return cachedResponse;
            }
            return fetch(event.request).then((networkResponse) => {
                const responseClone = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });
                return networkResponse;
            }).catch(() => {
                // صفحة offline افتراضية
                return new Response('<h1 style="text-align:center;font-family:Tajawal;margin-top:50px;">وضع الطيران - لا يوجد اتصال بالإنترنت</h1><p style="text-align:center;">بياناتك محفوظة وستتم المزامنة عند عودة الاتصال</p>', {
                    headers: { 'Content-Type': 'text/html; charset=utf-8' }
                });
            });
        })
    );
});

// الاستماع لحدث الضغط على الإشعار
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            for (var i = 0; i < windowClients.length; i++) {
                var client = windowClients[i];
                if (client.url.indexOf('/') !== -1 && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});

// إشعارات الدفع
self.addEventListener('push', (event) => {
    if (!event.data) return;
    const data = event.data.json();
    event.waitUntil(
        self.registration.showNotification(data.title || 'محاسبة النفس', {
            body: data.body || 'تذكير بالعبادة',
            icon: '/logo.png',
            badge: '/logo.png',
            vibrate: [200, 100, 200],
            tag: data.tag || 'mohasba-notification'
        })
    );
});
