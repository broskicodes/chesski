import { DisconnectButton } from "../connection/DisconnectButton";
import { DiscoveryBoard } from "../chess/DiscoveryBoard";
import Dropzone from "../upload/Dropzone";
import { FileUploadButton } from "../upload/FileUploadButton";
import { GalleryProvider } from "../../providers/FileGalleryProvider";
import { PgnProvider } from "../../providers/PgnProvider";
import { useSession } from "../../providers/OddSessionProvider";
import { Connect } from "../connection/Connect";
import { ChessboardProvider } from "../../providers/ChessboardProvider";
import { Header } from "../Header";

export const IndexRenderer = () => {
  const { isConnected } = useSession();

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
