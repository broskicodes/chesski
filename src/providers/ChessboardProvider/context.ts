import { Chess, Move, Square } from "chess.js";
import { createContext, useContext } from "react";

export interface ChessboardProviderContext {
  game: Chess;
  orientation: "white" | "black";
  onDrop: (sourceSquare: Square, targetSquare: Square) => boolean;
  makeMove: (
    move:
      | string
      | {
          from: string;
          to: string;
          promotion?: string | undefined;
        },
  ) => Move | null;
  undo: () => Move | null;
  reset: () => void;
  swapOrientation: () => void;
}

export const ChessboardContext = createContext<ChessboardProviderContext>({
  game: new Chess(),
  orientation: "white",
  onDrop: (_src, _tgt) => {
    throw new Error("ChessboardProvider not initialized");
  },
  makeMove: (_move) => {
    throw new Error("ChessboardProvider not initialized");
  },
  undo: () => {
    throw new Error("ChessboardProvider not initialized");
  },
  reset: () => {
    throw new Error("ChessboardProvider not initialized");
  },
  swapOrientation: () => {
    throw new Error("ChessboardProvider not initialized");
  },
});

export const useChessboard = () => useContext(ChessboardContext);
