import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { t } from "./i18n";
import type { Product } from "./store";

let configured = false;

export async function setupNotifications() {
  if (configured) return;
  configured = true;

  if (Platform.OS === "web") return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("low-stock", {
      name: "Mababang Stok",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#EE6C4D",
    });
  }
}

export async function ensurePermissions(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

export async function notifyLowStock(product: Product) {
  if (Platform.OS === "web") return;
  await setupNotifications();
  const ok = await ensurePermissions();
  if (!ok) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: t.lowStockNotifTitle,
      body: t.lowStockNotifBody(product.name, product.stock),
      data: { productId: product.id },
      sound: true,
    },
    trigger: null, // immediate
  });
}

export async function notifyMultipleLowStock(products: Product[]) {
  if (Platform.OS === "web") return;
  if (products.length === 0) return;
  await setupNotifications();
  const ok = await ensurePermissions();
  if (!ok) return;

  const body = products
    .slice(0, 5)
    .map((p) => `• ${p.name} (${p.stock})`)
    .join("\n");

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${products.length} paninda ang mababa na`,
      body,
      sound: true,
    },
    trigger: null,
  });
}
