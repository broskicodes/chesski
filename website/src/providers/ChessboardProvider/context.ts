import { Chess, Move, Square } from "chess.js";
import { createContext, useContext } from "react";
import { Player } from "./provider";

export interface ChessboardProviderContext {
  game: Chess;
  turn: Player;
  orientation: Player;
  highlightedSquares: Square[];
  highlightedMoves: Move[];
  arrows: Square[][];
  onDrop: (sourceSquare: Square, targetSquare: Square) => boolean;
  onDropVersus: (sourceSquare: Square, targetSquare: Square) => boolean;
  makeMove: (
    move:
      | string
      | {
          from: string;
          to: string;
          promotion?: string | undefined;
        },
  ) => Move | null;
  playContinuation: (moves: string[], reset?: boolean) => boolean;
  setPosition: (fen: string) => boolean;
  undo: () => Move | null;
  reset: () => void;
  swapOrientation: () => void;
  addArrows: (arrows: Square[][], reset: boolean) => void;
  addHighlightedSquares: (sqrs: Square[], reset: boolean) => void;
  resetHighlightedMoves: (moves: Move[]) => void;
}

export const ChessboardContext = createContext<ChessboardProviderContext>({
  game: new Chess(),
  turn: Player.White,
  orientation: Player.White,
  highlightedSquares: [],
  highlightedMoves: [],
  arrows: [],
  onDrop: (_src, _tgt) => {
    throw new Error("ChessboardProvider not initialized");
  },
  onDropVersus: (_src, _tgt) => {
    throw new Error("ChessboardProvider not initialized");
  },
  makeMove: (_move) => {
    throw new Error("ChessboardProvider not initialized");
  },
  playContinuation: (_moves) => {
    throw new Error("ChessboardProvider not initialized");
  },
  setPosition: (_fen) => {
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
  addArrows: (_arrows, _r) => {
    throw new Error("ChessboardProvider not initialized");
  },
  addHighlightedSquares: (_sqrs, _r) => {
    throw new Error("ChessboardProvider not initialized");
  },
  resetHighlightedMoves: (_moves) => {
    throw new Error("ChessboardProvider not initialized");
  },
});

export const useChessboard = () => useContext(ChessboardContext);
