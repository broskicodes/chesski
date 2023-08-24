import { Chess } from "chess.js";
import Link from "next/link";
import { ParsedPGN } from "pgn-parser";
import { useEffect, useState } from "react";
import { useChessboard } from "../../providers/ChessboardProvider";
import { useSession } from "../../providers/OddSessionProvider";

interface Props {
  transpositions: [Chess, number][];
  setNewTempPos: (move: string | null) => void;
}

interface MoveReference {
  wins: number;
  numGames: number;
  games: Chess[];
}

export const Moves = ({ transpositions, setNewTempPos }: Props) => {
  const { makeMove, orientation } = useChessboard();
  const [nextMoves, setNextMoves] = useState<{
    [key: string]: MoveReference;
  }>({});
  // const { chessComUsername } = useSession();
  const chessComUsername = "0xIffy";

  useEffect(() => {
    const moveCtr: { [key: string]: MoveReference } = {};
    transpositions.forEach((tpos) => {
      const [game, moveIdx] = tpos;
      const nextMove = game.history()[moveIdx + 1];

      if (!nextMove) {
        return;
      }

      const headers = game.header();
      const whitePieces = headers["White"] as string;
      const blackPieces = headers["Black"] as string;

      if (
        whitePieces === (chessComUsername as string) &&
        orientation === "black"
      ) {
        return;
      } else if (
        blackPieces === (chessComUsername as string) &&
        orientation === "white"
      ) {
        return;
      }

      const didWin =
        (headers["Termination"] as string).includes(
          chessComUsername as string,
        ) ?? false;

      if (Object.keys(moveCtr).includes(nextMove)) {
        moveCtr[nextMove].games.push(game);
        moveCtr[nextMove].numGames += 1;
        if (didWin) {
          moveCtr[nextMove].wins += 1;
        }
      } else {
        moveCtr[nextMove] = {
          games: [game],
          numGames: 1,
          wins: didWin ? 1 : 0,
        };
      }
    });

    setNextMoves(moveCtr);
  }, [transpositions, orientation, chessComUsername]);

  return (
    <div className="grid grid-cols-4 justify-items-center gap-y-2 mt-6">
      {Object.keys(nextMoves).map((key) => {
        const headers = nextMoves[key].games[0].header();
        const idx = (headers["Date"] as string)
          .concat(headers["EndTime"] as string)
          .concat(headers["White"] as string)
          .concat(headers["Black"] as string);

        return (
          <div
            className="flex flex-col justify-start rounded-lg hover:bg-slate-300/50 py-1 px-2"
            key={key}
            onMouseEnter={() => {
              setNewTempPos(key);
            }}
            onMouseLeave={() => {
              setNewTempPos(null);
            }}
          >
            <button
              onClick={() => {
                makeMove(key);
              }}
            >
              <p>
                {key}: {nextMoves[key].numGames} games
              </p>
              <p>
                Win rate:{" "}
                {Math.round(
                  (nextMoves[key].wins / nextMoves[key].numGames) * 100,
                )}
                %
              </p>
            </button>
            {nextMoves[key].numGames === 1 ? (
              <Link
                href={`/analysis?gameIdx=${encodeURIComponent(
                  idx,
                )}&orientation=${encodeURIComponent(orientation)}`}
              >
                View Game
              </Link>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
