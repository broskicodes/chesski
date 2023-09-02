import { PropsWithChildren } from "react";
import { NotificationProvider } from "../../providers/NotificationProvider";
import { SessionProvider } from "../../providers/OddSessionProvider";
import { Notifications } from "../notifications/Notifications";
import { Analytics } from "@vercel/analytics/react";
import { Sidebar } from "./Sidebar";
import { useEffect, useState } from "react";
import { BottomNav } from "./BottonNav";

export const Page = ({ children }: PropsWithChildren) => {
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
    <div className={"container mx-auto"}>
      <title>Chesski</title>
      <Analytics />
      <NotificationProvider>
        <SessionProvider>
          <Notifications />
          {screenWidth > 600 ? <Sidebar /> : <BottomNav />}
          {children}
        </SessionProvider>
      </NotificationProvider>
    </div>
  );
};
