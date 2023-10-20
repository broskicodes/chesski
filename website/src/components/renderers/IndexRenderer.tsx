import { GalleryProvider } from "../../providers/FileGalleryProvider";
import { PgnProvider } from "../../providers/PgnProvider";
import { useSession } from "../../providers/OddSessionProvider";
import { ChessboardProvider } from "../../providers/ChessboardProvider";
import { useEffect } from "react";
import { useNotifications } from "../../providers/NotificationProvider";
import { useRouter } from "next/router";
import { LandingPage } from "../display/LandingPage";
import { useSidebar } from "../../providers/SidebarProvider";

export const IndexRenderer = () => {
  const { isConnected } = useSession();
  const { addNotification } = useNotifications();
  const { query } = useRouter();
  const { expanded } = useSidebar();

  useEffect(() => {
    const { authed } = query;

    if (authed) {
      if (authed === "1") {
        addNotification({ msg: "Device linked successfully", type: "success" });
      } else {
        addNotification({
          msg: `Successfully authenticated as ${authed}`,
          type: "success",
        });
      }
    }
  }, [query]);

  return (
    <div className="flex flex-col items-center h-full">
      {isConnected() ? (
        <div className={`${expanded ? "md:ml-72" : "md:ml-20"}`}>
          <GalleryProvider>
            <PgnProvider>
              <ChessboardProvider>
                <LandingPage
                  link="/review"
                  header="Your own personal chess tutor"
                  subText="Training with Chesski will help you identify and improve your weaknesses while you learn new chess concepts"
                />
              </ChessboardProvider>
            </PgnProvider>
          </GalleryProvider>
        </div>
      ) : (
        <div className="flex items-center h-full">
          <LandingPage
            link="/review"
            header="Your own personal chess tutor"
            subText="Training with Chesski will help you identify and improve your weaknesses while you learn new chess concepts"
          />
        </div>
      )}
    </div>
  );
};
