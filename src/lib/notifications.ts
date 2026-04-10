import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { firebaseApp } from "./firebase";
import { supabase } from "./supabase";

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export async function setupPushNotifications(userId: string): Promise<void> {
  try {
    if (Capacitor.isNativePlatform()) {
      await setupNative(userId);
    } else {
      await setupWeb(userId);
    }
  } catch (e) {
    console.warn("Push notifications no disponibles:", e);
  }
}

async function setupNative(userId: string): Promise<void> {
  let status = await PushNotifications.checkPermissions();

  if (status.receive === "prompt") {
    status = await PushNotifications.requestPermissions();
  }

  if (status.receive !== "granted") return;

  await PushNotifications.register();

  // Token FCM nativo
  PushNotifications.addListener("registration", async ({ value: token }) => {
    await saveToken(userId, token, "android");
  });

  // Notificación recibida en primer plano
  PushNotifications.addListener("pushNotificationReceived", (notification) => {
    console.log("Notificación recibida:", notification);
  });

  // Tap en notificación (app en background)
  PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
    console.log("Notificación abierta:", action);
  });
}

async function setupWeb(userId: string): Promise<void> {
  if (!("Notification" in window) || !("serviceWorker" in navigator)) return;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return;

  const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  const messaging = getMessaging(firebaseApp);

  const token = await getToken(messaging, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: registration,
  });

  if (token) await saveToken(userId, token, "web");

  // Notificación en primer plano (app abierta en el browser)
  onMessage(messaging, (payload) => {
    if (!payload.notification) return;
    new Notification(payload.notification.title ?? "Firulais", {
      body: payload.notification.body,
      icon: "/pwa-192x192.png",
    });
  });
}

async function saveToken(userId: string, token: string, platform: string): Promise<void> {
  await supabase.from("user_tokens").upsert(
    { user_id: userId, token, platform, updated_at: new Date().toISOString() },
    { onConflict: "user_id,token" },
  );
}
