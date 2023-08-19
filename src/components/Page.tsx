import { PropsWithChildren } from "react";
import { NotificationProvider } from "../providers/NotificationProvider";
import { SessionProvider } from "../providers/OddSessionProvider";
import { Notifications } from "./notifications/Notifications";
import { Analytics } from "@vercel/analytics/react";

export const Page = ({ children }: PropsWithChildren) => {
  return (
    <div className={"container mx-auto h-screen"}>
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
