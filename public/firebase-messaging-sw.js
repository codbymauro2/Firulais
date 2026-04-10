// Service worker para Firebase Cloud Messaging (notificaciones en background - web)
// IMPORTANTE: pegá acá los valores del firebaseConfig de tu proyecto Firebase.
// Estos datos son públicos (igual que en el frontend), no son secretos.
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey:            "PEGAR_API_KEY",
  authDomain:        "PEGAR_AUTH_DOMAIN",
  projectId:         "PEGAR_PROJECT_ID",
  storageBucket:     "PEGAR_STORAGE_BUCKET",
  messagingSenderId: "PEGAR_MESSAGING_SENDER_ID",
  appId:             "PEGAR_APP_ID",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title = "Firulais", body = "" } = payload.notification ?? {};
  self.registration.showNotification(title, {
    body,
    icon: "/pwa-192x192.png",
    badge: "/pwa-192x192.png",
  });
});
