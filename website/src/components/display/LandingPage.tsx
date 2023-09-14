import { useRouter } from "next/router";
import { useState } from "react";
import { useSession } from "../../providers/OddSessionProvider";
import { Button } from "./Button";
import { ConnectModal } from "./Modal";

interface Props {
  header: string;
  subText: string;
  link: string;
}

export const LandingPage = ({ header, subText, link }: Props) => {
  const { isConnected } = useSession();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center space-y-8">
      {showModal && <ConnectModal handleSuccess={() => setShowModal(false)} />}
      <div
        style={{
          width: "512px",
        }}
        className="font-bold text-5xl text-center"
      >
        {header}
      </div>
      <div
        style={{
          width: "464px",
        }}
        className="font-medium text-2xl text-center text-gray-600"
      >
        {subText}
      </div>
      {isConnected() ? (
        <Button
          onClick={() => {
            router.push(link);
          }}
        >
          Start Training
        </Button>
      ) : (
        <Button
          onClick={() => {
            setShowModal(true);
          }}
        >
          Connect
        </Button>
      )}
    </div>
  );
};
