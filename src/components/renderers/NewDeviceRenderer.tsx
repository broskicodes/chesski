import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useNotifications } from "../../providers/NotificationProvider";
import { useSession } from "../../providers/OddSessionProvider";

export const NewDeviceRenderer = () => {
  const { getAccountConsumer, username } = useSession();
  const { query } = useRouter();
  const { newAlert } = useNotifications();
  const [pin, setPin] = useState<number[]>([]);
  const [loading, setLoading]= useState(false);
  const [consumerCreated, setConsumerCreated]= useState(false);

  const displayPin = useCallback(() => {
    return <div>{pin.join("")}</div>;
  }, [pin]);

  const renderDisconnected = useCallback(async () => {
    if (consumerCreated) 
      return;

    const { username } = query;

    if (!username) {
      return;
    }

    setLoading(true);

    try {
      const consumer = await getAccountConsumer(username as string);
      setConsumerCreated(true);

      consumer.on("challenge", ({ pin }) => {
        setPin(pin);
      });
    } catch (e) {
      const err = e as Error;
      switch (err.message) {
        case "Server error. Program not initialized properly":
          break;
        case "A user is already connected":
          break;
        default:
          console.error(e);
      }    
    }

    setLoading(false);
  }, [query, getAccountConsumer, consumerCreated]);

  useEffect(() => {
    if (!loading)
      renderDisconnected();
  }, [renderDisconnected, loading]);

  useEffect(() => {
    if (username) {
      newAlert(`You are currently connected as user "${username}". Proceeding will result in loss of access to data for that user.`, "default")
    }
  }, [username, newAlert])

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="flex flex-col items-center">
        <p>Your connection pin is</p>
        <span className="font-bold text-4xl">{displayPin()}</span>
        <p>Please use other device to confirm.</p>
        </div>
    </div>
  );
};
