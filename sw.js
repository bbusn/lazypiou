/*____________ NOM DU CACHE ET URLS À METTRE EN CACHE ____________*/
const CACHE_NAME = 'lazypiou-cache-v2';
const urlsToCache = [
    '/',
    '/index.html',
    '/public/styles.css',
    '/app.js',
    '/public/images/logo.png',
    '/public/images/late.png',
];

/*____________ INSTALLATION DU SERVICE WORKER ET OUVERTURE DU CACHE ____________*/
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Lazypiou cache opened');
                return cache.addAll(urlsToCache);
            })
    );
});

/*____________ RÉPONSE AUX REQUÊTES PAR LE CACHE ____________*/
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

/*____________ RÉCEPTION D'UN RAPPEL VIA UN MESSAGE ENVOYÉ PAR APP.JS  ____________*/
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'scheduleNotification') {
        scheduleNotification(event.data.date, event.data.title);
    }
});

/*____________ PLANIFICATION DE LA NOTIFICATION POUR LE RAPPEL REÇU____________*/
function scheduleNotification(date, title) {
    const now = new Date().getTime();
    const timeUntilNotification = date.getTime() - now;
    if (timeUntilNotification > 0) {
        setTimeout(() => {
            self.registration.showNotification('Rappel | LazyPiou', {
                body: 'C\'est l\'heure de s\'occuper de : ' + title,
                icon: '/favicon.ico',
                badge: '/favicon-32x32.png',
                vibrate: [200, 100, 200, 100, 200, 100, 200],
            });
        }, timeUntilNotification);
    }
}
