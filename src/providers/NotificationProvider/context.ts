import type { FileSystem } from "@oddjs/odd";
import { createContext, useContext } from "react";

export type NotificationType = "success" | "error" | "info" | "warning";

export interface Notification {
  id?: string;
  msg?: string;
  type?: NotificationType;
  timeout?: number;
}

export interface Alert {
  msg: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export interface NotificationProviderContext {
  notifications: Notification[];
  alert: Alert | null;
  addNotification: (notif: Notification) => void;
  removeNotification: (id: string) => void;
  newAlert: (msg: string) => Promise<boolean>;
}

export const NotificationContext = createContext<NotificationProviderContext>({
  notifications: [],
  alert: null,
  addNotification: (_notif) => {
    throw new Error("NotificationProvider not initialized");
  },
  removeNotification: (_id) => {
    throw new Error("NotificationProvider not initialized");
  },
  newAlert: (_msg) => {
    throw new Error("NotificationProvider not initialized");
  },
});

export const useNotifications = () => useContext(NotificationContext);
