import { useRouter } from "next/router";
import { ChessboardProvider } from "../../providers/ChessboardProvider";
import { GalleryProvider } from "../../providers/FileGalleryProvider";
import { useSession } from "../../providers/OddSessionProvider";
import { PgnProvider } from "../../providers/PgnProvider";
import { GameReviewBoard } from "../chess/GameReviewBoard";
import { Header } from "../Header";

export const AnalysisRenderer = () => {
  const { isConnected } = useSession();
  const router = useRouter();
  const { gameIdx, orientation } = router.query;

  return (
    <div className="flex flex-col items-center h-full">
      {isConnected() ? (
        <>
          <Header />
          <GalleryProvider>
            <PgnProvider>
              <ChessboardProvider>
                <GameReviewBoard
                  gameIdx={gameIdx as string}
                  // @ts-ignore
                  orientation={orientation}
                />
              </ChessboardProvider>
            </PgnProvider>
          </GalleryProvider>
        </>
      ) : null}
    </div>
  );
};
