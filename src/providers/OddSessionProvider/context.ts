import type { FileSystem } from "@oddjs/odd";
import { createContext, useContext } from "react";

export interface SessionProviderContext {
  username: string | null;
  fs: FileSystem | null;
  isConnected: () => boolean;
  connect: (username: string) => Promise<boolean>;
  disconnect: () => void;
}

export const SesionContext = createContext<SessionProviderContext>({
  username: null,
  fs: null,
  isConnected: () => {
    throw new Error("SessionProvider not initialized");
  },
  connect: (_username: string) => {
    throw new Error("SessionProvider not initialized");
  },
  disconnect: () => {
    throw new Error("SessionProvider not initialized");
  },
});

export const useSession = () => useContext(SesionContext);
