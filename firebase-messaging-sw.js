importScripts("https://www.gstatic.com/firebasejs/12.8.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.8.0/firebase-messaging-compat.js");

firebase.initializeApp({
     apiKey: "AIzaSyBNyjHFpg8SNz2_ttuCj1sJ3C7tGrU1IEQ",
    authDomain: "iim-shillong-rideshare.firebaseapp.com",
    projectId: "iim-shillong-rideshare",
    storageBucket: "iim-shillong-rideshare.firebasestorage.app",
    messagingSenderId: "322292821053",
    appId: "1:322292821053:web:c4a4a0e469d50ae971ce54"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {

    console.log("Background notification received:", payload);

    const notificationTitle =
        payload.notification?.title || "🚕 Ridezy";

    const notificationOptions = {
        body:
            payload.notification?.body ||
            "You have a new ride update.",

        icon: "/favicon.ico",
        badge: "/favicon.ico",

        tag: "ridezy-new-ride",

        renotify: true,

        data: {
            url: "https://ridezy-app.web.app/"
        }
    };

    self.registration.showNotification(
        notificationTitle,
        notificationOptions
    );
});

self.addEventListener("notificationclick", (event) => {

    event.notification.close();

    const urlToOpen =
        event.notification?.data?.url ||
        "https://ridezy-app.web.app/";

    event.waitUntil(
        clients.matchAll({
            type: "window",
            includeUncontrolled: true
        }).then((clientList) => {

            for (const client of clientList) {
                if ("focus" in client) {
                    return client.focus();
                }
            }

            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }

        })
    );
});


