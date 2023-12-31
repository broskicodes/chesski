import type {
  AccountLinkingConsumer,
  AccountLinkingProducer,
  FileSystem,
} from "@oddjs/odd";
import { createContext, useContext } from "react";

export interface SessionProviderContext {
  username: string | null;
  // chessComUsername: string | null;
  fs: FileSystem | null;
  loading: boolean;
  isConnected: () => boolean;
  connect: (username: string) => Promise<boolean>;
  disconnect: () => void;
  getAccountProducer: () => Promise<AccountLinkingProducer>;
  getAccountConsumer: (username: string) => Promise<AccountLinkingConsumer>;
}

export const SesionContext = createContext<SessionProviderContext>({
  username: null,
  // chessComUsername: null,
  fs: null,
  loading: false,
  isConnected: () => {
    throw new Error("SessionProvider not initialized");
  },
  connect: (_username: string) => {
    throw new Error("SessionProvider not initialized");
  },
  disconnect: () => {
    throw new Error("SessionProvider not initialized");
  },
  getAccountProducer: () => {
    throw new Error("SessionProvider not initialized");
  },
  getAccountConsumer: (_username) => {
    throw new Error("SessionProvider not initialized");
  },
});

export const useSession = () => useContext(SesionContext);
