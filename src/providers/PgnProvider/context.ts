import { Chess } from "chess.js";
import { createContext, useContext } from "react";

export interface PgnProviderContext {
  isLoading: boolean;
  games: { [key: string]: Chess[] };
  searchPositions: (fen: string) => [Chess, number][];
  // getGame: (idx: string) => Chess | null;
}

export const PgnContext = createContext<PgnProviderContext>({
  isLoading: false,
  games: {},
  searchPositions: (_fen) => {
    throw new Error("PgnProvider not initialized");
  },
  // getGame: (_idx) => {
  //   throw new Error("PgnProvider not initialized");
  // },
});

export const usePgns = () => useContext(PgnContext);
