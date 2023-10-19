import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { ChessboardProvider, Player } from "../../providers/ChessboardProvider";
import { GalleryProvider } from "../../providers/FileGalleryProvider";
import { GptProvider } from "../../providers/GptProvider";
import { useSession } from "../../providers/OddSessionProvider";
import { PgnProvider } from "../../providers/PgnProvider";
import { useSidebar } from "../../providers/SidebarProvider";
import { ReviewChat } from "../ai/ReviewChat";
import { ReviewBoard } from "../chess/ReviewBoard";

interface Props {
  gameId: string;
}

export const GameReviewRenderer = ({ gameId }: Props) => {
  const { isConnected } = useSession();
  const { expanded } = useSidebar();
  const [pgn, setPgn] = useState("");
  // const [orientation, setOrientation] = useState<Player>(Player.Black)

  const fetchGame = useCallback(async () => {
    const res = await fetch(
      `https://lichess.org/game/export/${gameId}?literate=true&clocks=false&tags=false`,
      {
        method: "GET",
      },
    );

    const pgn = await res.text();

    return pgn;
  }, [gameId]);

  useEffect(() => {
    fetchGame().then((pgn) => {
      const cmdPattern = /{ \[%.*?\] }/g;
      const evalPattern = /\(((-?\d+\.\d+)|Mate)[^)]+\)/g;
      const wsPattern = /\s+/g;
      const tagPattern = /\[[^\]]+\]/g;
      const continuationPatterm = /\(\d+.[^)]+\)/g;
      const dotsPattern = /[^}]\s+\d+\.\.\./g;
      const lwsPattern = /^\s+/g;

      const cleanPgn = pgn
        .replaceAll(cmdPattern, "")
        .replaceAll(tagPattern, "")
        .replaceAll(evalPattern, "")
        .replaceAll(continuationPatterm, "")
        .replaceAll(wsPattern, " ")
        .replaceAll(lwsPattern, "")
        .replaceAll(dotsPattern, (str) => {
          return str.at(0) as string;
        });
      // console.log(cleanPgn);
      setPgn(cleanPgn);
    });
  }, [fetchGame]);

  return (
    <div className="flex flex-col items-center h-full">
      {isConnected() ? (
        <>
          <GalleryProvider>
            <PgnProvider>
              <ChessboardProvider>
                <GptProvider apiEndpoint="/api/gpt/review">
                  <div
                    className={`flex flex-col pt-14 sm:pt-8  w-full space-y-8 justify-center items-center ${
                      expanded ? "md:ml-72" : "md:ml-20"
                    }`}
                  >
                    <ReviewBoard
                      pgn={pgn}
                      // orientation={orientation}
                    />
                    <ReviewChat pgn={pgn} />
                  </div>
                </GptProvider>
              </ChessboardProvider>
            </PgnProvider>
          </GalleryProvider>
        </>
      ) : null}
    </div>
  );
};
