import { useCallback, useEffect, useState } from "react";
import { usePgns } from "../../providers/PgnProvider";
import { Moves } from "./Moves";
import { Chess } from "chess.js";
import { useChessboard } from "../../providers/ChessboardProvider";
import { Button } from "../display/Button";
import { Chessboard } from "react-chessboard";

export const DiscoveryBoard = () => {
  const { searchPositions, isLoading } = usePgns();

  const { game, orientation, onDrop, swapOrientation, undo, reset } =
    useChessboard();
  const [transpositions, setTranspositions] = useState<[Chess, number][]>([]);
  const [tempPos, setTempPos] = useState<string | null>(null);

  const setNewTempPos = useCallback(
    (move: string | null) => {
      const tempGame = new Chess();
      tempGame.loadPgn(game.pgn());

      if (move) {
        tempGame.move(move);
        setTempPos(tempGame.fen());
      } else {
        setTempPos(null);
      }
    },
    [game],
  );

  useEffect(() => {
    const fen = game.fen();
    const games = searchPositions(fen);
    setTranspositions(games);

    // console.log(fen);
  }, [game, searchPositions]);

  return (
    <div className="flex flex-col justify-center w-max mt-4">
      <div>
        {isLoading ? <h2>Loading</h2> : null}
        <Chessboard
          position={tempPos ?? game.fen()}
          boardOrientation={orientation}
          boardWidth={512}
          onPieceDrop={onDrop}
        />
      </div>
      <div className="flex flex-row w-full space-x-4 mt-6">
        <Button className="grow" onClick={swapOrientation}>
          Flip Board
        </Button>
        <Button className="grow" onClick={undo}>
          Undo
        </Button>
        <Button className="grow" onClick={reset}>
          Reset
        </Button>
      </div>
      <Moves transpositions={transpositions} setNewTempPos={setNewTempPos} />
    </div>
  );
};
