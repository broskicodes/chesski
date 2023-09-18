import { PropsWithChildren, ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "../../providers/OddSessionProvider";
import { DisconnectIcon } from "../icons/DisconnectIcon";
import { DeviceLinkIcon } from "../icons/DeivceLinkIcons";
import { PlayChessIcon } from "../icons/PlayChessIcon";
import { OpenningsIcon } from "../icons/OpenningsIcon";
import { MenuIcon } from "../icons/MenuIcon";
import { useSidebar } from "../../providers/SidebarProvider";
import Link from "next/link";
import { TwitterIcon } from "../icons/TwitterIcon";

export const Sidebar = ({ children }: PropsWithChildren) => {
  const { isConnected, username, disconnect } = useSession();
  const { expanded, toggleExpanded } = useSidebar();
  const router = useRouter();

  const [screenWidth, setScreenWidth] = useState(0);

  useEffect(() => {
    setScreenWidth(window.innerWidth);

    const sizeChangeHandler = (_event: Event) => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener("resize", sizeChangeHandler);

    return () => {
      window.removeEventListener("resize", sizeChangeHandler);
    };
  }, []);

  return (
    <aside
      className={`h-screen fixed left-0 top-0 z-40`}
      hidden={!isConnected()}
    >
      {screenWidth < 640 && !expanded && (
        <button
          onClick={toggleExpanded}
          className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 mt-4 ml-4"
        >
          <MenuIcon height={1.5} />
        </button>
      )}
      {(screenWidth >= 640 || expanded) && (
        <nav className="h-full flex flex-col bg-white shadow-md border-r">
          <div className="p-4 pb-2 flex justify-between items-center">
            <div
              className={`overflow-hidden transition-all font-bold text-xl ${
                expanded ? "w-32" : "w-0"
              }`}
            >
              <Link href={"/"}>Chesski</Link>
            </div>
            <button
              onClick={toggleExpanded}
              className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100"
            >
              <MenuIcon height={1.5} />
            </button>
          </div>
          <ul className={`flex-1 px-3 `}>
            <SidebarItem
              icon={PlayChessIcon({ height: 1.5 })}
              text={"Play Chesski"}
              active={router.route === "/play"}
              handleClick={() => {
                router.route === "/play" ? {} : router.push("/play");
              }}
            />
            <SidebarItem
              icon={OpenningsIcon({ height: 1.5 })}
              text={"Study Openings"}
              active={router.route === "/openings"}
              handleClick={() => {
                router.route === "/openings" ? {} : router.push("/openings");
              }}
            />
            {children}
            {isConnected() && (
              <div className={`absolute bottom-20`}>
                <SidebarItem
                  icon={DeviceLinkIcon({ height: 1.5 })}
                  text={"Link Device"}
                  handleClick={() => {
                    router.push("/link-device/authed");
                  }}
                />
                <SidebarItem
                  icon={DisconnectIcon({ height: 1.5 })}
                  text={"Disconnect"}
                  handleClick={disconnect}
                />
              </div>
            )}
          </ul>
          {isConnected() && (
            <div className="border-t flex p-3">
              <div className="py-1 px-3 my-1">
                <Link
                  href={"https://twitter.com/_broskitweets"}
                  target="_blank"
                >
                  <TwitterIcon height={1.8} />
                </Link>
              </div>
              <div
                className={`
                flex justify-between items-center
                overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}
            `}
              >
                <div className="leading-4">
                  <p>See Progress Updates</p>
                </div>
              </div>
            </div>
          )}
        </nav>
      )}
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

export const SidebarItem = ({
  icon,
  text,
  handleClick,
  active,
  alert,
}: ItemProps) => {
  const { expanded } = useSidebar();
  return (
    <li
      onClick={handleClick}
      className={`cursor-pointer relative flex items-center py-2 px-3 my-1 rounded-md group ${
        active ? "bg-red-200" : "hover:bg-red-100"
      }`}
    >
      {icon}
      <span
        className={`overflow-hidden transition-all ${
          expanded ? "w-52 ml-3" : "w-0"
        }`}
      >
        {text}
      </span>
      {alert && (
        <div
          className={`absolute right-2 w-2 h-2 rounded bg-red-400 ${
            expanded ? "" : "top-4"
          }`}
        />
      )}
      {!expanded && (
        <div
          className={`absolute left-full rounded-md px-2 py-1 ml-6 bg-red-100 text-sm invisible opacity-20 translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0`}
        >
          {text}
        </div>
      )}
    </li>
  );
};
