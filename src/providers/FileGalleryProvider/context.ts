import { createContext, useContext } from "react";

export interface PgnFile {
  cid: string;
  ctime: number;
  name: string;
  size: number;
  private: boolean;
}

export interface GalleryProviderContext {
  publicFiles: PgnFile[];
  loading: boolean;
  writeFile: (filename: string, data: Uint8Array) => Promise<void>;
  readFile: (filename: string) => Promise<Uint8Array>;
}

export const GalleryContext = createContext<GalleryProviderContext>({
  publicFiles: [],
  loading: true,
  writeFile: (_filename, _data) => {
    throw new Error("GalleryProvider not initialized");
  },
  readFile: (_filename) => {
    throw new Error("GalleryProvider not initialized");
  },
});

export const useGallery = () => useContext(GalleryContext);
