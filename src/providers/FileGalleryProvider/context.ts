import { createContext, useContext } from "react";
import type { FilePath, SegmentsNonEmpty, PartitionedNonEmpty, Partition } from "@oddjs/odd/path/index"

export enum GameType {
  Bullet = "bullet",
  Blitz = "blitz",
  Rapid = "rapid",
  // Daily = "daily",
  Other = "other",
}

export type TimeControls =
  | "60"
  | "60+1"
  | "20+1"
  | "30"
  | "120+1"
  | "180"
  | "180+2"
  | "300"
  | "300+2"
  | "300+5"
  | "600"
  | "600+5"
  | "900+10"
  | "1200"
  | "1800"
  | "3600";

export const TimeControlMap = {
  ["60"]: GameType.Bullet,
  ["60+1"]: GameType.Bullet,
  ["20+1"]: GameType.Bullet,
  ["30"]: GameType.Bullet,
  ["120+1"]: GameType.Bullet,
  ["180"]: GameType.Blitz,
  ["180+2"]: GameType.Blitz,
  ["300"]: GameType.Blitz,
  ["300+2"]: GameType.Blitz,
  ["300+5"]: GameType.Blitz,
  ["600"]: GameType.Rapid,
  ["600+5"]: GameType.Rapid,
  ["900+10"]: GameType.Rapid,
  ["1200"]: GameType.Rapid,
  ["1800"]: GameType.Rapid,
  ["3600"]: GameType.Rapid,
};

export interface PgnFile {
  cid: string;
  ctime: number;
  path: FilePath<PartitionedNonEmpty<Partition>>;
  size: number;
  private: boolean;
}

export interface GalleryProviderContext {
  publicFiles: PgnFile[];
  loading: boolean;
  writeFile: (filePath: FilePath<SegmentsNonEmpty>, data: Uint8Array) => Promise<void>;
  parsePgnToFiles: (pgnData: Uint8Array) => Promise<void>;
  readFile: (filePath: FilePath<PartitionedNonEmpty<Partition>>) => Promise<Uint8Array>;
}

export const GalleryContext = createContext<GalleryProviderContext>({
  publicFiles: [],
  loading: true,
  writeFile: (_filePath, _data) => {
    throw new Error("GalleryProvider not initialized");
  },
  parsePgnToFiles: (_pgnData) => {
    throw new Error("GalleryProvider not initialized");
  },
  readFile: (_filepath) => {
    throw new Error("GalleryProvider not initialized");
  },
});

export const useGallery = () => useContext(GalleryContext);
