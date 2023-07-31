import { Chess } from "chess.js";
import { parse, ParsedPGN } from "pgn-parser";
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useGallery } from "../FileGalleryProvider";
import { PgnContext, PgnProviderContext } from "./context";

export const PgnProvider = ({ children }: PropsWithChildren) => {
  const { publicFiles, readFile } = useGallery();
  const [parsedPgns, setParsedPgns] = useState<ParsedPGN[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const parseAllFiles = useCallback(async () => {
    setIsLoading(true);

    const data = await Promise.all(
      publicFiles.map(async (file) => {
        return await readFile(file.name);
      }),
    );

    const decoder = new TextDecoder("utf-8");

    const endtimes: string[] = [];

    const pgns = data
      .flatMap((barr) => {
        return parse(decoder.decode(barr));
      })
      .filter((pgn) => {
        const time = (pgn.headers?.at(10)?.value as string)
          .concat(pgn.headers?.at(2)?.value as string)
          .concat(pgn.headers?.at(4)?.value as string)
          .concat(pgn.headers?.at(5)?.value as string);

        if (!endtimes.includes(time)) {
          endtimes.push(time);
          return true;
        }

        return false;
      })
      .map((pgn) => {
        const chess = new Chess();

        const movesWithFen = pgn.moves.map((move) => {
          chess.move(move.move);
          const fen = chess.fen();

          return {
            ...move,
            comments: [fen],
          };
        });

        return {
          ...pgn,
          moves: movesWithFen,
        };
      });

    setIsLoading(false);

    return pgns;
  }, [publicFiles, readFile]);

  const searchPositions = useCallback(
    (fen: string): [ParsedPGN, number][] => {
      const games: [ParsedPGN, number][] = [];

      for (const pgn of parsedPgns) {
        let index = 0;
        for (const move of pgn.moves) {
          if (fen.split("-")[0] === move.comments[0].split("-")[0]) {
            games.push([pgn, index]);
            continue;
          }

          index += 1;
        }
      }

      return games;
    },
    [parsedPgns],
  );

  const value: PgnProviderContext = useMemo(
    () => ({
      isLoading,
      pgns: parsedPgns,
      searchPositions,
    }),
    [isLoading, parsedPgns, searchPositions],
  );

  useEffect(() => {
    parseAllFiles().then((pgns) => {
      setParsedPgns(pgns);
    });
  }, [parseAllFiles]);

  // useEffect(() => {
  //   console.log(parsedPgns);
  // }, [parsedPgns]);

  return <PgnContext.Provider value={value}>{children}</PgnContext.Provider>;
};
