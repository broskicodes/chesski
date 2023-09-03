import { DiscoveryBoard } from "../chess/DiscoveryBoard";
import Dropzone from "../upload/Dropzone";
import { FileUploadButton } from "../upload/FileUploadButton";
import { GalleryProvider } from "../../providers/FileGalleryProvider";
import { PgnProvider } from "../../providers/PgnProvider";
import { useSession } from "../../providers/OddSessionProvider";
import { Connect } from "../connection/Connect";
import { ChessboardProvider } from "../../providers/ChessboardProvider";
import { Header } from "../display/Header";
import { useEffect } from "react";
import { useNotifications } from "../../providers/NotificationProvider";
import { useRouter } from "next/router";

export const IndexRenderer = () => {
  const { isConnected } = useSession();
  const { addNotification } = useNotifications();
  const { query } = useRouter();

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
        <>
          <Header />
          <GalleryProvider>
            <Dropzone>
              <FileUploadButton />
              <PgnProvider>
                <ChessboardProvider>
                  <DiscoveryBoard />
                </ChessboardProvider>
              </PgnProvider>
            </Dropzone>
          </GalleryProvider>
        </>
      ) : (
        <div className="flex items-center h-full">
          <Connect />
        </div>
      )}
    </div>
  );
};
