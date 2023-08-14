import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useNotifications } from "../../providers/NotificationProvider";
import { useSession } from "../../providers/OddSessionProvider";
import { Button } from "../Button";
import copy from "clipboard-copy";
import { QRCodeSVG } from "qrcode.react";

interface Challenge {
  pin: number[];
  confirmPin: () => void;
  rejectPin: () => void;
}

export const AuthedDeviceRenderer = () => {
  const { getAccountProducer, username } = useSession();
  const { addNotification } = useNotifications();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(false);
  const [prodCreated, setProdCreated] = useState(false);
  const router = useRouter();
  const [link, setLink] = useState("");

  const displayPin = useCallback(() => {
    return <div>{challenge?.pin.join("")}</div>;
  }, [challenge]);

  const renderConnected = useCallback(async () => {
    if (prodCreated) {
      return;
    }

    setLoading(true);

    try {
      const producer = await getAccountProducer();
      setProdCreated(true);

      producer.on("challenge", (details) => {
        setChallenge(details);
      });

      producer.on("link", ({ approved }) => {
        if (approved) {
          router.push("/?authed=1", "/");
        } else {
          addNotification({ msg: "Device link rejected", type: "warning" });
          setChallenge(null);
          setProdCreated(false);
        }
      });
    } catch (e) {
      const err = e as Error;
      switch (err.message) {
        case "Server error. Program not initialized properly":
          break;
        case "No user connected":
          break;
        default:
          console.error(e);
      }
    }

    setLoading(false);
  }, [getAccountProducer, prodCreated, addNotification, router]);

  useEffect(() => {
    if (!loading) renderConnected();
  }, [renderConnected, loading]);

  useEffect(() => {
    const { protocol, host } = window.location;
    if (username)
      setLink(`${protocol}//${host}/connect-device/new?username=${username}`);
  }, [username]);

  return (
    <div className="flex flex-col items-center h-full">
      {!!challenge ? (
        <div className="flex flex-col items-center justify-center h-full">
          Confirm that this pin matches what is displayed on your other device
          <span className="font-bold text-4xl mt-6">{displayPin()}</span>
          <div className="flex w-full justify-around mt-8">
            <Button onClick={() => challenge?.confirmPin()}>Confirm</Button>
            <Button onClick={() => challenge?.rejectPin()}>Cancel</Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="flex flex-col mb-8 items-center">
            {link ? (
              <QRCodeSVG size={256} value={link} />
            ) : (
              <div className="loader ease-linear rounded-full border-4 border-t-4 border-t-slate-300 border-neutral-900 h-8 w-8 animate-spin" />
            )}
            <p className="mt-4">
              Scan this code with the device you would like to link; or
            </p>
          </div>
          <Button
            onClick={async () => {
              await copy(link);
              addNotification({
                msg: "Link copied to clipboard",
                type: "success",
              });
            }}
          >
            Copy connection link
          </Button>
        </div>
      )}
    </div>
  );
};
