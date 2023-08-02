import { Chess } from "chess.js";
import { parse, ParsedPGN } from "pgn-parser";
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { parsedPgnToChessJs } from "../../utils/helpers";
import { useGallery } from "../FileGalleryProvider";
import { PgnContext, PgnProviderContext } from "./context";

export const PgnProvider = ({ children }: PropsWithChildren) => {
  const { publicFiles, readFile } = useGallery();
  const [games, setGames] = useState<{ [key: string]: Chess }>({});
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

    const games = data
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
        return parsedPgnToChessJs(pgn);
      });

    const gamesObj: { [key: string]: Chess } = {};

    games.forEach((game) => {
      const headers = game.header();
      const idx = (headers["Date"] as string)
        .concat(headers["EndTime"] as string)
        .concat(headers["White"] as string)
        .concat(headers["Black"] as string);

      gamesObj[idx] = game;
    });

    setIsLoading(false);

    return gamesObj;
  }, [publicFiles, readFile]);

  const searchPositions = useCallback(
    (fen: string): [Chess, number][] => {
      const matchingGames: [Chess, number][] = [];

      for (const game of Object.values(games)) {
        let index = 0;
        for (const move of game.history({ verbose: true })) {
          if (fen.split("-")[0] === move.after.split("-")[0]) {
            matchingGames.push([game, index]);
            continue;
          }

          index += 1;
        }
      }

      return matchingGames;
    },
    [games],
  );

  const getGame = useCallback(
    (idx: string) => {
      return games[idx] ?? null;
    },
    [games],
  );

  const value: PgnProviderContext = useMemo(
    () => ({
      isLoading,
      games: Object.values(games),
      searchPositions,
      getGame,
    }),
    [isLoading, games, searchPositions, getGame],
  );

  useEffect(() => {
    parseAllFiles().then((games) => {
      setGames(games);
    });
  }, [parseAllFiles]);

  // useEffect(() => {
  //   console.log(parsedPgns);
  // }, [parsedPgns]);

  return <PgnContext.Provider value={value}>{children}</PgnContext.Provider>;
};
