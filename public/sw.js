// Service worker : permet à l'appli de s'ouvrir même sans réseau (une fois visitée une première fois).
// - Pages (navigation)       : réseau d'abord, sinon la dernière version en cache
// - Fichiers de l'appli/images : cache d'abord, puis mise à jour en arrière-plan
// Pour forcer une mise à jour du cache après un changement important, incrémente CACHE_VERSION.
const CACHE_VERSION = "v1";
const CACHE = `mealprep-${CACHE_VERSION}`;
const PRECACHE = ["/", "/manifest.webmanifest", "/meal_prep_logo_v2.svg", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
    event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((k) => k.startsWith("mealprep-") && k !== CACHE).map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (event) => {
    const request = event.request;
    if (request.method !== "GET") return;                       // ex. l'envoi vers Discord (POST) n'est jamais touché
    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;            // polices Google, Discord… : on laisse le navigateur faire

    // Navigation : on sert toujours la page d'accueil de l'appli (c'est une appli à une seule page)
    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const copy = response.clone();
                    caches.open(CACHE).then((cache) => cache.put("/", copy));
                    return response;
                })
                .catch(() => caches.match("/"))
        );
        return;
    }

    event.respondWith(
        caches.match(request).then((cached) => {
            const network = fetch(request)
                .then((response) => {
                    if (response.ok) {
                        const copy = response.clone();
                        caches.open(CACHE).then((cache) => cache.put(request, copy));
                    }
                    return response;
                })
                .catch(() => cached);
            return cached || network;
        })
    );
});
