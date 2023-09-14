import { ChessboardProvider } from "../../providers/ChessboardProvider";
import { GalleryProvider } from "../../providers/FileGalleryProvider";
import { useSession } from "../../providers/OddSessionProvider";
import { PgnProvider } from "../../providers/PgnProvider";
import { StockfishProvider } from "../../providers/StockfishProvider";
import { VersusBoard } from "../chess/VersusBoard";
import { LandingPage } from "../display/LandingPage";

export const PlayRenderer = () => {
  const { isConnected } = useSession();

  return (
    <div className="flex flex-col h-screen">
      {isConnected() ? (
        <>
          <GalleryProvider>
            <PgnProvider>
              <ChessboardProvider>
                <StockfishProvider>
                  <VersusBoard />
                </StockfishProvider>
              </ChessboardProvider>
            </PgnProvider>
          </GalleryProvider>
        </>
      ) : (
        <div className="flex items-center h-screen justify-center">
          <LandingPage
            header="Elevate your game"
            subText="Put your overall chess skill to the test. Train against Chesski in full games"
            link="/play"
          />
        </div>
      )}
    </div>
  );
};
