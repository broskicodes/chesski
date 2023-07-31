import { PropsWithChildren, useCallback, useMemo, useState } from "react";
import {
  NotificationContext,
  Notification,
  NotificationProviderContext,
  Alert,
} from "./context";

export const NotificationProvider = ({ children }: PropsWithChildren) => {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [alert, setAlert] = useState<Alert | null>(null);

  const removeNotification = useCallback((id: string) => {
    setNotifs(notifs.filter((notif) => notif.id !== id));
  }, [notifs]);

  const newAlert = useCallback((msg: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const handleConfirm = () => {
        setAlert(null);
        resolve(true);
      };

      const handleCancel = () => {
        setAlert(null);
        resolve(false);
      };

      setAlert({ msg, onCancel: handleCancel, onConfirm: handleConfirm });
    });
  }, []);

  const addNotification = useCallback((notif: Notification) => {
    if (!notif.msg) {
      return;
    }

    const id = Math.random().toString();
    const newNotif = {
      ...notif,
      id,
      type: notif.type ?? "info",
      timeout: notif.timeout ?? 3000,
    };

    setNotifs([...notifs, newNotif]);

    const timer = setTimeout(() => {
      removeNotification(id);
      clearTimeout(timer);
    }, newNotif.timeout);
  }, [notifs, removeNotification]);

  const value: NotificationProviderContext = useMemo(
    () => ({
      notifications: notifs,
      alert,
      addNotification,
      removeNotification,
      newAlert,
    }),
    [notifs, alert, addNotification, removeNotification, newAlert],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
