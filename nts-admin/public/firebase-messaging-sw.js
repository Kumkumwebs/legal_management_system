importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBK2i2bGadzQ-0n01jodkJXyZPi5Ug4MpA",
  authDomain: "nts-legal-pro.firebaseapp.com",
  projectId: "nts-legal-pro",
  messagingSenderId: "395033126864",
  appId: "1:395033126864:web:06fec00aca462b66b53bd5"
});

const messaging = firebase.messaging();

// 🔔 Background notification handler
messaging.onBackgroundMessage(function (payload) {
  console.log("🔔 Background message:", payload);

  const title = payload.notification?.title || "New Notification";
  const options = {
    body: payload.notification?.body || "",
    icon: "/logo192.png", // 👉 add your logo here
    data: payload.data || {}
  };

  self.registration.showNotification(title, options);
});


// 👉 Click event (VERY IMPORTANT)
self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const url = event.notification.data?.url || "/";

  event.waitUntil(
    clients.openWindow(url)
  );
});