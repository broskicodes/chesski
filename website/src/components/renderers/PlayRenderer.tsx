import { ChessboardProvider } from "../../providers/ChessboardProvider";
import { GalleryProvider } from "../../providers/FileGalleryProvider";
import { useSession } from "../../providers/OddSessionProvider";
import { PgnProvider } from "../../providers/PgnProvider";
import { VersusBoard } from "../chess/VersusBoard";
import { Connect } from "../connection/Connect";
import { Header } from "../Header";

export const PlayRenderer = () => {
  const { isConnected } = useSession();

  return (
    <div className="flex flex-col items-center justify-center h-full">
      {isConnected() ? (
        <>
          <Header />
          <GalleryProvider>
            <PgnProvider>
              <ChessboardProvider>
                <VersusBoard />
              </ChessboardProvider>
            </PgnProvider>
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
