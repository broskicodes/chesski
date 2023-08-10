import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useNotifications } from "../../providers/NotificationProvider";
import { useSession } from "../../providers/OddSessionProvider";

interface Challenge {
  pin: number[];
  confirmPin: () => void;
  rejectPin: () => void;
}

export const AuthedDeviceRenderer = () => {
  const { getAccountProducer, username } = useSession();
  // const { addNotification } = useNotifications();
  const [challenge, setChallenge] = useState<Challenge | null>(null);

  const displayPin = useCallback(() => {
    return <div>{challenge?.pin.join("")}</div>;
  }, [challenge]);

  const renderConnected = useCallback(async () => {
    try {
      const producer = await getAccountProducer();

      producer.on("challenge", (details) => {
        setChallenge(details);
      });

      producer.on("link", ({ approved }) => {
        if (approved) console.log("Linked device successfully");
      });
    } catch (e) {
      console.error(e);
    }
  }, [getAccountProducer]);

  useEffect(() => {
    renderConnected();
  }, [renderConnected]);

  return (
    <div className="flex flex-col items-center h-full">
      <div>
        <div>
          {!!challenge ? (
            <div>
              confirm that this pin matches what is displayed on the other
              device
              {displayPin()}
              <div>
                <button onClick={() => challenge?.confirmPin()}>Confirm</button>
                <button onClick={() => challenge?.rejectPin()}>Cancel</button>
              </div>
            </div>
          ) : (
            <div>
              <p>show qr</p>
              <p>{`http://localhost:3000/connect-device/new?username=${username}`}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
