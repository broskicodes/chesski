import { ChessboardProvider } from "../../providers/ChessboardProvider";
import { GalleryProvider } from "../../providers/FileGalleryProvider";
import { useSession } from "../../providers/OddSessionProvider";
import { PgnProvider } from "../../providers/PgnProvider";
import { StockfishProvider } from "../../providers/StockfishProvider";
import { VersusBoard } from "../chess/VersusBoard";
import { Connect } from "../connection/Connect";
import { Header } from "../display/Header";

export const PlayRenderer = () => {
  const { isConnected } = useSession();

  return (
    <div className="flex flex-col items-center h-full pb-16">
      {isConnected() ? (
        <>
          <GalleryProvider>
            <PgnProvider>
              <ChessboardProvider>
                <Header />
                <StockfishProvider>
                  <VersusBoard />
                </StockfishProvider>
              </ChessboardProvider>
            </PgnProvider>
          </GalleryProvider>
        </>
      ) : (
        <div className="flex items-center h-screen">
          <Connect />
        </div>
      )}
    </div>
  );
};
