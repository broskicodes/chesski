import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useNotifications } from "../../providers/NotificationProvider";
import { useSession } from "../../providers/OddSessionProvider";

export const NewDeviceRenderer = () => {
  const { getAccountConsumer } = useSession();
  const { query } = useRouter();
  // const { addNotification } = useNotifications();
  const [pin, setPin] = useState<number[]>([]);

  const displayPin = useCallback(() => {
    return <div>{pin.join("")}</div>;
  }, [pin]);

  const renderDisconnected = useCallback(async () => {
    const { username } = query;

    if (!username) {
      return;
    }

    try {
      const consumer = await getAccountConsumer(username as string);

      consumer.on("challenge", ({ pin }) => {
        setPin(pin);
      });
    } catch (e) {
      console.error(e);
    }
  }, [query, getAccountConsumer]);

  useEffect(() => {
    renderDisconnected();
  }, [renderDisconnected]);

  return (
    <div className="flex flex-col items-center h-full">
      <div>{displayPin()}</div>
    </div>
  );
};
