import { PropsWithChildren } from "react";
import { NotificationProvider } from "../../providers/NotificationProvider";
import { SessionProvider } from "../../providers/OddSessionProvider";
import { Notifications } from "../notifications/Notifications";
import { Analytics } from "@vercel/analytics/react";
import { Sidebar } from "./Sidebar";
import { useEffect, useState } from "react";
import { BottomNav } from "./BottonNav";
import { SidebarProvider } from "../../providers/SidebarProvider";

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
    <div className={""}>
      <title>Chesski</title>
      <Analytics />
      <NotificationProvider>
        <SessionProvider>
          <Notifications />
          <SidebarProvider>
            {screenWidth >= 640 ? <Sidebar /> : <BottomNav />}
            {children}
          </SidebarProvider>
        </SessionProvider>
      </NotificationProvider>
    </div>
  );
};
