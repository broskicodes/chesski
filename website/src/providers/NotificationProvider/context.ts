import { createContext, useContext } from "react";

export type NotificationType = "success" | "error" | "info" | "warning";

export interface Notification {
  id?: string;
  msg?: string;
  type?: NotificationType;
  timeout?: number;
}

export type AlertType = "confirm" | "default";

export interface Alert {
  title?: string;
  msg: string;
  type: AlertType;
  onConfirm: () => void;
  onCancel: () => void;
}

export interface NotificationProviderContext {
  notifications: Notification[];
  alert: Alert | null;
  addNotification: (notif: Notification) => void;
  removeNotification: (id: string) => void;
  newAlert: (msg: string, type: AlertType, title?: string) => Promise<boolean>;
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
  newAlert: (_msg, _type, _title) => {
    throw new Error("NotificationProvider not initialized");
  },
});

export const useNotifications = () => useContext(NotificationContext);
