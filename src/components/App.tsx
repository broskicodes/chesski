import { DisconnectButton } from "./connection/DisconnectButton";
import { Board } from "../components/chess/Board";
import Dropzone from "../components/upload/Dropzone";
import { FileUploadButton } from "../components/upload/FileUploadButton";
import { GalleryProvider } from "../providers/FileGalleryProvider";
import { PgnProvider } from "../providers/PgnProvider";
import { useSession } from "../providers/OddSessionProvider";
import { Connect } from "./connection/Connect";
import { Notifications } from "./notifications/Notifications";

export const App = () => {
  const { isConnected } = useSession();

  return (
    <div className="flex flex-col items-center h-full">
      <Notifications />
      {isConnected() ? (
        <>
          <div className="mt-4 flex flex-col items-center space-y-2">
            <Connect />
            <DisconnectButton />
          </div>
          <GalleryProvider>
            <Dropzone>
              <FileUploadButton />
              <PgnProvider>
                <Board />
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
