import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "./Button";
import { Connect } from "./connection/Connect";
import { DisconnectButton } from "./connection/DisconnectButton";

export const Header = () => {
  const router = useRouter();
  return (
    <div className="mb-40">
      <div className="py-4 flex flex-col items-center space-y-2 mb-4 fixed top-0 left-0 w-screen bg-white z-50">
        <Link href={"/"} className="font-bold text-2xl">
          Chesski
        </Link>
        <Connect />
        <div className="flex flex-row space-x-2">
          <Button onClick={() => router.push("/link-device/authed")}>
            Link a device
          </Button>
          <DisconnectButton />
        </div>
      </div>
    </div>
  );
};
