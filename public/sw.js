const CACHE_NAME = 'v1.0.0.4';

const STATIC_CACHE_URLS = [
    '/',

    '/images/favicon.png',
    '/images/logo.jpg',

    '/js/anuncios.js',
    '/js/despesas.js',
    '/js/html2pdf.bundle.min.js',
    '/js/login.js',
    '/js/main.js',
    '/js/moment.min.js',
    '/js/reservas.js',
    '/js/utils.js',

    '/css/cadastro.css',
    '/css/despesas.css',
    '/css/login.css',
    '/css/main.css',
    '/css/material.icon.css',
    '/css/modal.css',
    '/css/page.css',

    '/fonts/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2',
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_CACHE_URLS))
    )
});

self.addEventListener('fetch', event => {

    if (event.request.url.includes('/api/')) {
        // response to API requests, Cache Update Refresh strategy
        //event.respondWith(caches.match(event.request))
        //event.waitUntil(update(event.request).then(refresh)) //TODO: refresh
    } else {

        event.respondWith(
            caches.match(event.request) // check if the request has already been cached
                .then(cached => cached || fetch(event.request)) // otherwise request network
        );
    }

})

function update(request) {
    return fetch(request.url)
        .then(response => {
            if (!response.ok) { throw new Error('Network error'); }

            // we can put response in cache
            return caches.open(CACHE_NAME)
                .then(cache => cache.put(request, response.clone()))
                .then(() => response) // resolve promise with the Response object
        })
}

function refresh(response) {
    return response.json() // read and parse JSON response
        .then(jsonResponse => {
            self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                    // report and send new data to client
                    client.postMessage(JSON.stringify({
                        type: response.url,
                        data: jsonResponse.data
                    }))
                })
            })
            return jsonResponse.data; // resolve promise with new data
        })
}

self.addEventListener('activate', event => {
    // delete any unexpected caches
    event.waitUntil(
        caches.keys()
            .then(keys => keys.filter(key => key !== CACHE_NAME))
            .then(keys => Promise.all(keys.map(key => {
                console.log(`Deleting cache ${key}`);
                return caches.delete(key)
            })))
    );
});