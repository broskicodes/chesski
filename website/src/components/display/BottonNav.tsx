import { PropsWithChildren, ReactNode } from "react";
import { useRouter } from "next/router";
import { useSession } from "../../providers/OddSessionProvider";
import { PlayChessIcon } from "../icons/PlayChessIcon";
import { DeviceLinkIcon } from "../icons/DeivceLinkIcons";
import { DisconnectIcon } from "../icons/DisconnectIcon";

export const BottomNav = ({ children }: PropsWithChildren) => {
  const { isConnected, disconnect } = useSession();
  const router = useRouter();

  return (
    <aside
      className="w-screen absolute left-0 bottom-0 z-40"
      hidden={!isConnected()}
    >
      <nav className="w-full flex flex-row  bg-white border-t py-1">
        <ul className="flex-1 px-3 flex flex-row justify-start">
          <NavItem
            icon={PlayChessIcon({ height: 1.5 })}
            text="Play Chesski"
            active={router.route === "/"}
            handleClick={() => {
              router.route === "/" ? {} : router.push("/");
            }}
          />
          {isConnected() && (
            <span className="absolute right-2 flex flex-row space-x-2">
              <NavItem
                icon={DeviceLinkIcon({ height: 1.5 })}
                text={"Link Device"}
                handleClick={() => {
                  router.push("/link-device/authed");
                }}
              />
              <NavItem
                icon={DisconnectIcon({ height: 1.5 })}
                text={"Disconnect"}
                handleClick={disconnect}
              />
            </span>
          )}
        </ul>
      </nav>
    </aside>
  );
};

interface ItemProps {
  icon: ReactNode;
  text: string;
  active?: boolean;
  alert?: boolean;
  handleClick: () => void;
}

export const NavItem = ({
  icon,
  text,
  handleClick,
  active,
  alert,
}: ItemProps) => {
  return (
    <li
      className={`relative flex flex-col items-center py-2 px-2 cursor-pointer rounded-md font-medium group
      ${active ? "bg-red-200" : "hover:bg-red-100"}
    `}
      onClick={handleClick}
    >
      {icon}
      <span className="text-xs text-center mt-1">{text}</span>
      {alert && (
        <div
          className={`absolute right-2 top-2 w-2 h-2 rounded bg-indigo-400
            `}
        />
      )}
    </li>
  );
};
