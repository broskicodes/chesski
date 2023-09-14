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
  return (
    <div className={"font-mono"}>
      <title>Chesski</title>
      <Analytics />
      <NotificationProvider>
        <SessionProvider>
          <Notifications />
          <SidebarProvider>
            <Sidebar />
            {children}
          </SidebarProvider>
        </SessionProvider>
      </NotificationProvider>
    </div>
  );
};
