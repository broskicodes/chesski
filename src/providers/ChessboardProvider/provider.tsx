import { Chess, Square } from "chess.js";
import { PropsWithChildren, useCallback, useMemo, useState } from "react";
import { usePgns } from "../PgnProvider";
import { ChessboardContext, ChessboardProviderContext } from "./context";

export const ChessboardProvider = ({ children }: PropsWithChildren) => {
  const { isLoading } = usePgns();
  const [game, setGame] = useState<Chess>(new Chess());
  const [orientation, setOrientation] = useState<"white" | "black">("white");

  const makeMove = useCallback(
    (
      move:
        | string
        | {
            from: string;
            to: string;
            promotion?: string | undefined;
          },
    ) => {
      const tempGame = new Chess();
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
    const tempGame = new Chess();
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
    const tempGame = new Chess();
    setGame(tempGame);
  }, []);

  const onDrop = useCallback(
    (sourceSquare: Square, targetSquare: Square) => {
      if (isLoading) {
        return false;
      }

      const move = makeMove({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q", // always promote to a queen for example simplicity
      });

      if (!move) return false;

      return true;
    },
    [makeMove, isLoading],
  );

  const swapOrientation = useCallback(() => {
    setOrientation(orientation === "white" ? "black" : "white");
  }, [orientation]);

  const value: ChessboardProviderContext = useMemo(
    () => ({
      game,
      orientation,
      makeMove,
      onDrop,
      undo,
      reset,
      swapOrientation,
    }),
    [game, orientation, makeMove, onDrop, undo, reset, swapOrientation],
  );

  return (
    <ChessboardContext.Provider value={value}>
      {children}
    </ChessboardContext.Provider>
  );
};
