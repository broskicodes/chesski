import Link from "next/link";
import { Connect } from "./connection/Connect";
import { DisconnectButton } from "./connection/DisconnectButton";

export const Header = () => {
  return (
    <div className="mt-4 flex flex-col items-center space-y-2 mb-4">
      <Link href={"/"} className="font-bold text-2xl">
        Chesski
      </Link>
      <Connect />
      <DisconnectButton />
    </div>
  );
};
