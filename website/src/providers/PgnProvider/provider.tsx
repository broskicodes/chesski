import { path } from "@oddjs/odd";
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
  const [games, setGames] = useState<{ [key: string]: Chess[] }>({});
  const [isLoading, setIsLoading] = useState(false);

  const parseAllFiles = useCallback(async () => {
    setIsLoading(true);
    const decoder = new TextDecoder("utf-8");
    const gamesObj: { [key: string]: Chess[] } = {};

    await Promise.all(
      publicFiles.map(async (file) => {
        const pathDirs = path.parent(file.path).directory;
        const gameType = pathDirs[pathDirs.length - 1];
        const data = await readFile(file.path);
        const game = new Chess();
        game.loadPgn(decoder.decode(data));

        if (Object.keys(gamesObj).includes(gameType)) {
          gamesObj[gameType].push(game);
        } else {
          gamesObj[gameType] = [game];
        }
      }),
    );

    setIsLoading(false);

    return gamesObj;
  }, [publicFiles, readFile]);

  const searchPositions = useCallback(
    (fen: string): [Chess, number][] => {
      const matchingGames: [Chess, number][] = [];

      for (const game of Object.values(games).flat()) {
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
      games: games,
      searchPositions,
      // getGame,
    }),
    [isLoading, games, searchPositions],
  );

  useEffect(() => {
    parseAllFiles().then((games) => {
      setGames(games);
    });
  }, [parseAllFiles]);

  return <PgnContext.Provider value={value}>{children}</PgnContext.Provider>;
};
