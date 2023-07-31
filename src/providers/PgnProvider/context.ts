import { ParsedPGN } from "pgn-parser";
import { createContext, useContext } from "react";
import { PgnFile } from "../FileGalleryProvider";

export interface PgnProviderContext {
  isLoading: boolean;
  pgns: ParsedPGN[];
  searchPositions: (fen: string) => [ParsedPGN, number][];
}

export const PgnContext = createContext<PgnProviderContext>({
  isLoading: false,
  pgns: [],
  searchPositions: (_fen) => {
    throw new Error("PgnProvider not initialized");
  },
});

export const usePgns = () => useContext(PgnContext);
