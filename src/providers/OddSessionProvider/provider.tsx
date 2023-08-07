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

export const SessionProvider = ({ children }: PropsWithChildren) => {
  const { newAlert, addNotification } = useNotifications();
  const [program, setProgram] = useState<odd.Program | null>(null);
  const [session, setSession] = useState<odd.Session | null>(null);
  const [chessComUsername, setChessComUsername] = useState<string | null>(null);

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
      return;
    }

    if (!session) {
      console.error("Not connected");
      return;
    }

    if (
      await newAlert(
        "In disconnecting you will lose access to all of your data. Continue?",
      )
    ) {
      await session.destroy();
      setSession(null);
      setChessComUsername(null);
    }
  }, [program, session, newAlert]);

  const value: SessionProviderContext = useMemo(
    () => ({
      username: session?.username ?? null,
      chessComUsername,
      fs: session?.fs ?? null,
      isConnected,
      connect,
      disconnect,
    }),
    [session, chessComUsername, isConnected, connect, disconnect],
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
