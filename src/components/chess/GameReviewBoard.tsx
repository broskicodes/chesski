import { Chess, Move } from "chess.js";
import { useCallback, useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import { Square } from "react-chessboard/dist/chessboard/types";
import { useChessboard } from "../../providers/ChessboardProvider";
import { useSession } from "../../providers/OddSessionProvider";
import { usePgns } from "../../providers/PgnProvider";
import { Button } from "../Button";

interface Props {
  gameIdx: string;
  orientation: "white" | "black";
}

export const GameReviewBoard = ({ gameIdx, orientation }: Props) => {
  const { undo, game, reset, makeMove } = useChessboard();
  const { chessComUsername } = useSession();
  const { isLoading } = usePgns();
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [nextMove, setNextMove] = useState<Move | null>(null);

  useEffect(() => {
    // const game = getGame(gameIdx);
    setMoveHistory(game?.history({ verbose: true }) ?? []);
  }, [game, gameIdx]);

  useEffect(() => {
    for (const move of moveHistory) {
      if (move.before === game.fen()) {
        setNextMove(move);
        return;
      }
    }

    setNextMove(moveHistory[0]);
  }, [game, moveHistory]);

  return (
    <div className="flex flex-col justify-center w-max">
      <p className="text-xl font-bold bg-yellow-400">
        This feature is a work in progress
      </p>
      <div>
        {isLoading ? <h2>Loading</h2> : null}
        <Chessboard
          position={game.fen()}
          boardOrientation={orientation}
          boardWidth={512}
          onPieceDrop={useCallback((_src: Square, _tgt: Square) => {
            return false;
          }, [])}
        />
      </div>
      <div className="flex flex-row w-full space-x-4 mt-6">
        <Button className="grow" onClick={reset}>
          Reset
        </Button>
        <Button className="grow" onClick={undo}>
          Back
        </Button>
        <Button className="grow" onClick={() => makeMove(nextMove?.san ?? "")}>
          Next
        </Button>
      </div>
      <div>
        {moveHistory.map((move, idx) => (
          <div
            key={idx}
            className={nextMove?.before === move.after ? "bg-slate-200" : ""}
            onClick={() => {}}
          >
            {move.san}
          </div>
        ))}
      </div>
    </div>
  );
};
