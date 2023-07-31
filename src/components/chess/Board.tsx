import { useCallback, useEffect, useState } from "react";
import { Chess as ChessJS } from "chess.js";
import { usePgns } from "../../providers/PgnProvider";
import { Chessboard } from "react-chessboard";
import { Square } from "react-chessboard/dist/chessboard/types";
import { ParsedPGN } from "pgn-parser";
import { Moves } from "./Moves";
import { Button } from "../Button";
import { useNotifications } from "../../providers/NotificationProvider";

export const Board = () => {
  const { searchPositions, isLoading } = usePgns();
  const [game, setGame] = useState<ChessJS>(new ChessJS());
  const [transpositions, setTranspositions] = useState<[ParsedPGN, number][]>(
    [],
  );
  const [tempPos, setTempPos] = useState<string | null>(null);
  const [orientation, setOrientation] = useState<"white" | "black">("white");
  const { addNotification } = useNotifications();

  const makeAMove = useCallback(
    (
      move:
        | string
        | {
            from: string;
            to: string;
            promotion?: string | undefined;
          },
    ) => {
      const tempGame = new ChessJS();
      tempGame.loadPgn(game.pgn());
      try {
        const res = tempGame.move(move);
        if (res) {
          setGame(tempGame);
        }
        return res;
      } catch (e) {
        return null;
      }
    },
    [game],
  );

  const undo = useCallback(() => {
    const tempGame = new ChessJS();
    tempGame.loadPgn(game.pgn());
    try {
      const res = tempGame.undo();
      if (res) {
        setGame(tempGame);
      }
      return res;
    } catch (e) {
      return null;
    }
  }, [game]);

  const reset = useCallback(() => {
    const tempGame = new ChessJS();
    try {
      setGame(tempGame);
    } catch (e) {
      return null;
    }
  }, []);

  const setNewTempPos = useCallback(
    (move: string | null) => {
      const tempGame = new ChessJS();
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

  const onDrop = useCallback(
    (sourceSquare: Square, targetSquare: Square) => {
      if (isLoading) {
        return false;
      }

      const move = makeAMove({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q", // always promote to a queen for example simplicity
      });

      // illegal move
      if (!move) return false;

      return true;
    },
    [makeAMove],
  );

  const swapOrientation = useCallback(() => {
    setOrientation(orientation === "white" ? "black" : "white");
  }, [orientation]);

  useEffect(() => {
    const fen = game.fen();
    const games = searchPositions(fen);
    setTranspositions(games);
  }, [game, searchPositions]);

  return (
    <div className="flex flex-col justify-center w-max mt-">
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
      <Moves
        orientation={orientation}
        transpositions={transpositions}
        setNewTempPos={setNewTempPos}
        makeMove={makeAMove}
      />
    </div>
  );
};
