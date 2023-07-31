import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSession } from "../OddSessionProvider";
import { GalleryContext, GalleryProviderContext, PgnFile } from "./context";
import { path } from "@oddjs/odd";
import type { PublicFile } from "@oddjs/odd/fs/v1/PublicFile";
import { isFile } from "@oddjs/odd/fs/types/check";
import { useNotifications } from "../NotificationProvider";

interface FileLink {
  size: number;
}

const DIR_PATH = path.directory("public", "pgns");

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

    const links = await fs.ls(DIR_PATH);

    const files = (
      await Promise.all(
        Object.entries(links).map(async ([name]) => {
          const file = await fs.get(path.combine(DIR_PATH, path.file(name)));

          if (!isFile(file)) return null;

          const cid = (file as PublicFile).cid?.toString();
          const ctime = (file as PublicFile).header.metadata.unixMeta.ctime;

          return {
            cid: cid as string,
            ctime,
            name,
            private: false,
            size: (links[name] as FileLink).size,
          };
        }),
      )
    ).filter((obj) => !!obj);

    // @ts-ignore
    files.sort((a, b) => b.ctime - a.ctime);

    setFiles(files as PgnFile[]);
    setIsLoading(false);
  }, [isConnected, fs]);

  const writeFile = useCallback(
    async (filename: string, data: Uint8Array) => {
      if (!isConnected() || !fs) {
        return;
      }

      await fs.write(path.combine(DIR_PATH, path.file(filename)), data);
      await fs.publish();

      await getFilesFromWnfs();

      addNotification({ msg: "File uploaded successfully", type: "success" });
    },
    [isConnected, fs, getFilesFromWnfs],
  );

  const readFile = useCallback(
    async (filename: string) => {
      if (!isConnected() || !fs) {
        throw new Error("Disconnected");
        // return;
      }

      const data = await fs.read(path.combine(DIR_PATH, path.file(filename)));

      return data;
    },
    [isConnected, fs],
  );

  const value: GalleryProviderContext = useMemo(
    () => ({
      publicFiles: files,
      loading: isLoading,
      writeFile,
      readFile,
    }),
    [files, isLoading, writeFile, readFile],
  );

  useEffect(() => {
    getFilesFromWnfs();
  }, [getFilesFromWnfs]);

  return (
    <GalleryContext.Provider value={value}>{children}</GalleryContext.Provider>
  );
};
