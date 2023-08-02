import { Chess } from "chess.js";
import { ParsedPGN } from "pgn-parser";

export const fileToUint8Array = async (file: File): Promise<Uint8Array> => {
  return new Uint8Array(await new Blob([file]).arrayBuffer());
};

export const parsedPgnToChessJs = (pgn: ParsedPGN) => {
  const game = new Chess();

  pgn.headers?.forEach((header) => {
    game.header(header.name, header.value);
  });

  pgn.moves.forEach(({ move }) => {
    game.move(move);
  });

  return game;
};
