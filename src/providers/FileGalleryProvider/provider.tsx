import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSession } from "../OddSessionProvider";
import {
  GalleryContext,
  GalleryProviderContext,
  GameType,
  PgnFile,
  TimeControlMap,
  TimeControls,
} from "./context";
import { path } from "@oddjs/odd";
import type {
  FilePath,
  SegmentsNonEmpty,
  PartitionedNonEmpty,
  Partition,
} from "@oddjs/odd/path/index";
import type { PublicFile } from "@oddjs/odd/fs/v1/PublicFile";
import { isTree, isFile } from "@oddjs/odd/fs/types/check";
import { useNotifications } from "../NotificationProvider";
import { parse } from "pgn-parser";
import { parsedPgnToString } from "../../utils/helpers";

interface FileLink {
  size: number;
}

const DIR_PATH = path.directory("public", "chess", "pgns");

export const GalleryProvider = ({ children }: PropsWithChildren) => {
  const { isConnected, fs } = useSession();
  const { addNotification } = useNotifications();
  const [files, setFiles] = useState<PgnFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getFilesFromWnfs = useCallback(async () => {
    if (!isConnected() || !fs) {
      return;
    }

    setIsLoading(true);

    if (!(await fs.exists(DIR_PATH))) {
      await fs.mkdir(DIR_PATH);
    }

    await Promise.all(
      Object.values(GameType).map(async (type) => {
        const dir = path.combine(DIR_PATH, path.directory(type));
        if (!(await fs.exists(dir))) {
          await fs.mkdir(dir);
        }
      }),
    );

    const links = await fs.ls(DIR_PATH);

    const files = (
      await Promise.all(
        Object.entries(links)
          .map(async ([dirname]) => {
            const linkPath = path.combine(DIR_PATH, path.directory(dirname));

            const dir = await fs.get(linkPath);

            if (!isTree(dir)) return null;

            const links = await fs.ls(linkPath);

            return await Promise.all(
              Object.entries(links).map(async ([filename]) => {
                const filePath = path.combine(linkPath, path.file(filename));
                const file = await fs.get(filePath);
                const cid = (file as PublicFile).cid?.toString();
                const ctime = (file as PublicFile).header.metadata.unixMeta
                  .ctime;

                if (!isFile(file)) return null;

                return {
                  cid: cid as string,
                  ctime,
                  path: filePath,
                  private: false,
                  size: (links[filename] as FileLink).size,
                };
              }),
            );
          })
          .filter((obj) => !!obj),
      )
    )
      .filter((obj) => !!obj)
      .flat();

    // @ts-ignore
    files.sort((a, b) => b.ctime - a.ctime);

    setFiles(files as PgnFile[]);
    setIsLoading(false);
  }, [isConnected, fs]);

  const writeFile = useCallback(
    async (filePath: FilePath<SegmentsNonEmpty>, data: Uint8Array) => {
      if (!isConnected() || !fs) {
        return;
      }

      await fs.write(path.combine(DIR_PATH, filePath), data);
    },
    [isConnected, fs],
  );

  const parsePgnToFiles = useCallback(
    async (pgnData: Uint8Array) => {
      if (!isConnected() || !fs) {
        return;
      }

      setIsLoading(true);

      const decoder = new TextDecoder("utf-8");

      const pgns = parse(decoder.decode(pgnData));

      await Promise.all(
        pgns.map(async (pgn) => {
          const timeControl = pgn.headers?.at(9)?.value as string;
          const dirname =
            TimeControlMap[timeControl as TimeControls] ?? GameType.Other;

          const identifier = (pgn.headers?.at(2)?.value as string)
            .concat(pgn.headers?.at(10)?.value as string)
            .concat(pgn.headers?.at(4)?.value as string)
            .concat(pgn.headers?.at(5)?.value as string);

          const name = Buffer.from(
            await window.crypto.subtle.digest(
              "SHA-256",
              Buffer.from(identifier),
            ),
          ).toString("hex");
          const pgnStr = parsedPgnToString(pgn);

          await writeFile(path.file(dirname, name), Buffer.from(pgnStr));
        }),
      );

      await fs.publish();
      setIsLoading(false);

      await getFilesFromWnfs();
      addNotification({ msg: "Files uploaded successfully", type: "success" });
    },
    [isConnected, fs, writeFile, getFilesFromWnfs, addNotification],
  );

  const readFile = useCallback(
    async (filePath: FilePath<PartitionedNonEmpty<Partition>>) => {
      if (!isConnected() || !fs) {
        throw new Error("Disconnected");
        // return;
      }

      const data = await fs.read(filePath);

      return data;
    },
    [isConnected, fs],
  );

  const value: GalleryProviderContext = useMemo(
    () => ({
      publicFiles: files,
      loading: isLoading,
      writeFile,
      parsePgnToFiles,
      readFile,
    }),
    [files, isLoading, writeFile, parsePgnToFiles, readFile],
  );

  useEffect(() => {
    getFilesFromWnfs();
  }, [getFilesFromWnfs]);

  return (
    <GalleryContext.Provider value={value}>{children}</GalleryContext.Provider>
  );
};
