import { PropsWithChildren } from "react";
import { NotificationProvider } from "../../providers/NotificationProvider";
import { SessionProvider } from "../../providers/OddSessionProvider";
import { Notifications } from "../notifications/Notifications";
import { Analytics } from "@vercel/analytics/react";
import { Sidebar } from "./Sidebar";

export const Page = ({ children }: PropsWithChildren) => {
  return (
    <div className={"container mx-auto"}>
      <title>Chesski</title>
      <Analytics />
      <NotificationProvider>
        <SessionProvider>
          <Notifications />
          {children}
        </SessionProvider>
      </NotificationProvider>
    </div>
  );
};
