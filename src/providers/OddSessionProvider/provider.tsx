import * as odd from "@oddjs/odd";
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNotifications } from "../NotificationProvider";
import { SesionContext, SessionProviderContext } from "./context";
import { path } from "@oddjs/odd";
import { useRouter } from "next/router";

export const SessionProvider = ({ children }: PropsWithChildren) => {
  const { newAlert, addNotification } = useNotifications();
  const [program, setProgram] = useState<odd.Program | null>(null);
  const [session, setSession] = useState<odd.Session | null>(null);
  const [chessComUsername, setChessComUsername] = useState<string | null>(null);
  const router = useRouter();

  const isConnected = useCallback(() => {
    return !!session;
  }, [session]);

  const connect = useCallback(
    async (username: string, pgnName: string) => {
      if (!program) {
        console.error("No program");
        return false;
      }

      if (session) {
        console.error("Already connected");
        return false;
      }

      const valid = await program.auth.isUsernameValid(username);
      const available = await program.auth.isUsernameAvailable(username);

      if (valid && available) {
        const { success } = await program.auth.register({ username });

        if (success) {
          const session = await program.auth.session();
          setSession(session);
          setChessComUsername(pgnName);

          await session?.fs?.write(
            path.file("public", "pgnname"),
            Buffer.from(pgnName),
          );
          await session?.fs?.publish();

          return true;
        }
      } else {
        addNotification({ type: "error", msg: "Username unavailable" });
      }

      return false;
    },
    [program, session, addNotification],
  );

  const disconnect = useCallback(async () => {
    if (!program) {
      addNotification({ type: "error", msg: "No user connected" });
      throw new Error("No user connected");
    }

    if (!session) {
      addNotification({ type: "error", msg: "No user connected" });
      throw new Error("No user connected");
    }

    if (
      await newAlert(
        "In proceeding you will lose access to all of your stored data on this device. Please ensure you have a backup before continuing.",
        "confirm",
      )
    ) {
      await session.destroy();
      setSession(null);
      setChessComUsername(null);
    }
  }, [program, session, addNotification, newAlert]);

  const getAccountProducer = useCallback(async () => {
    if (!program) {
      throw new Error("Server error. Program not initialized properly");
    }

    if (!session) {
      throw new Error("No user connected");
    }

    return await program.auth.accountProducer(session.username);
  }, [program, session]);

  const getAccountConsumer = useCallback(
    async (username: string) => {
      if (!program) {
        throw new Error("Server error. Program not initialized properly");
      }

      if (session) {
        throw new Error("A user is already connected");
      }

      const consumer = await program.auth.accountConsumer(username);

      consumer.on("link", async ({ approved, username }) => {
        if (approved) {
          setSession(await program.auth.session());
          router.push(`/?authed=${username}`, "/");
        } else {
          addNotification({
            msg: "Link was refused by authenticated device ",
            type: "warning",
          });
        }
      });

      return consumer;
    },
    [program, session, addNotification, router],
  );

  const value: SessionProviderContext = useMemo(
    () => ({
      username: session?.username ?? null,
      chessComUsername,
      fs: session?.fs ?? null,
      isConnected,
      connect,
      disconnect,
      getAccountProducer,
      getAccountConsumer,
    }),
    [
      session,
      chessComUsername,
      isConnected,
      connect,
      disconnect,
      getAccountProducer,
      getAccountConsumer,
    ],
  );

  useEffect(() => {
    odd
      .program({ namespace: "chesski" })
      .then((prog) => {
        setProgram(prog);
      })
      .catch((err) => {
        switch (err) {
          case odd.ProgramError.InsecureContext:
            // The ODD SDK requires HTTPS
            console.error(err);
            break;
          case odd.ProgramError.UnsupportedBrowser:
            console.error(err);
            break;
        }
      });
  }, []);

  useEffect(() => {
    if (program && program.session) {
      setSession(program.session);

      program.session.fs?.read(path.file("public", "pgnname")).then((data) => {
        const decoder = new TextDecoder("utf-8");
        setChessComUsername(decoder.decode(data));
      });
    }
  }, [program]);

  return (
    <SesionContext.Provider value={value}>{children}</SesionContext.Provider>
  );
};
