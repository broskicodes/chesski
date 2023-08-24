import { Chess, Square } from "chess.js";
import { PropsWithChildren, useCallback, useMemo, useState } from "react";
import { usePgns } from "../PgnProvider";
import { ChessboardContext, ChessboardProviderContext } from "./context";

export enum Player {
  White = "white",
  Black = "black",
}

export const ChessboardProvider = ({ children }: PropsWithChildren) => {
  const { isLoading } = usePgns();
  const [game, setGame] = useState<Chess>(new Chess());
  const [orientation, setOrientation] = useState<Player>(Player.White);
  const [turn, setTurn] = useState<Player>(Player.White);

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
          setTurn(turn === Player.White ? Player.Black : Player.White);
        }
        return res;
      } catch (e) {
        return null;
      }
    },
    [game, turn],
  );

  const setPosition = useCallback((fen: string) => {
    try {
      const tempGame = new Chess(fen);
      setGame(tempGame);
      setTurn(tempGame.turn() === "w" ? Player.White : Player.Black);

      return true;
    } catch (e) {
      return false;
    }
  }, []);

  const playContinuation = useCallback(
    (moves: string[]) => {
      const tempGame = new Chess();
      tempGame.loadPgn(game.pgn());

      for (const move of moves) {
        try {
          tempGame.move(move);
        } catch (e) {
          return false;
        }
      }

      setGame(tempGame);
      setTurn(tempGame.turn() === "w" ? Player.White : Player.Black);

      return true;
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
        setTurn(turn === Player.White ? Player.Black : Player.White);
      }
      return res;
    } catch (e) {
      return null;
    }
  }, [game, turn]);

  const reset = useCallback(() => {
    const tempGame = new Chess();
    setGame(tempGame);
    setTurn(Player.White);
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

  const onDropVersus = useCallback(
    (sourceSquare: Square, targetSquare: Square) => {
      if (orientation === turn) {
        return onDrop(sourceSquare, targetSquare);
      }

      return false;
    },
    [onDrop, turn, orientation],
  );

  const swapOrientation = useCallback(() => {
    setOrientation(orientation === Player.White ? Player.Black : Player.White);
  }, [orientation]);

  const value: ChessboardProviderContext = useMemo(
    () => ({
      game,
      turn,
      orientation,
      makeMove,
      playContinuation,
      setPosition,
      onDrop,
      onDropVersus,
      undo,
      reset,
      swapOrientation,
    }),
    [
      game,
      turn,
      orientation,
      makeMove,
      playContinuation,
      setPosition,
      onDrop,
      onDropVersus,
      undo,
      reset,
      swapOrientation,
    ],
  );

  return (
    <ChessboardContext.Provider value={value}>
      {children}
    </ChessboardContext.Provider>
  );
};
