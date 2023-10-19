import { useRouter } from "next/router";
import { useState } from "react";
import { useSession } from "../../providers/OddSessionProvider";
import {
  ScreenSize,
  ScreenSizeBoardMap,
  useSidebar,
} from "../../providers/SidebarProvider";
import { Button } from "./Button";
import { ConnectModal } from "./Modal";

interface Props {
  header: string;
  subText: string;
  link: string;
}

export const LandingPage = ({ header, subText, link }: Props) => {
  const { isConnected } = useSession();
  const { screenSize } = useSidebar();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center space-y-8">
      {showModal && <ConnectModal handleSuccess={() => setShowModal(false)} />}
      <div
        style={{
          width: `${ScreenSizeBoardMap[screenSize ?? ScreenSize.Mobile]}px`,
        }}
        className="font-bold text-5xl text-center"
      >
        {header}
      </div>
      <div
        style={{
          width: `${
            ScreenSizeBoardMap[screenSize ?? ScreenSize.Mobile] - 48
          }px`,
        }}
        className={`font-medium ${
          screenSize === ScreenSize.Mobile ? "text-xl" : "text-2xl"
        } text-center text-gray-600`}
      >
        {subText}
      </div>
      {isConnected() ? (
        <div className="flex flex-row space-x-4">
          {/* <Button
            onClick={() => {
              router.push("/preorder");
            }}
          >
            Pre-Order
          </Button> */}
          <Button
            // inverted={true}
            onClick={() => {
              router.push(link);
            }}
          >
            Get Started
          </Button>
        </div>
      ) : (
        <Button
          onClick={() => {
            setShowModal(true);
          }}
        >
          Sign Up
        </Button>
      )}
    </div>
  );
};
