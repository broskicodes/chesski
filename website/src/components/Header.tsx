import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "./Button";
import { Connect } from "./connection/Connect";
import { DisconnectButton } from "./connection/DisconnectButton";

export const Header = () => {
  const router = useRouter();
  return (
    <div className="mt-4 flex flex-col items-center space-y-2 mb-4">
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
  );
};
