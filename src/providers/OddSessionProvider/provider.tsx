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

export const SessionProvider = ({ children }: PropsWithChildren) => {
  const { newAlert } = useNotifications();
  const [program, setProgram] = useState<odd.Program | null>(null);
  const [session, setSession] = useState<odd.Session | null>(null);

  const isConnected = useCallback(() => {
    return !!session;
  }, [session]);

  const connect = useCallback(
    async (username: string) => {
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

      console.log(valid, available);
      if (valid && available) {
        const { success } = await program.auth.register({ username });

        if (success) {
          setSession(await program.auth.session());

          return true;
        }
      }

      return false;
    },
    [program, session],
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
    }
  }, [program, session, newAlert]);

  const value: SessionProviderContext = useMemo(
    () => ({
      username: session?.username ?? null,
      fs: session?.fs ?? null,
      isConnected,
      connect,
      disconnect,
    }),
    [session, isConnected, connect, disconnect],
  );

  useEffect(() => {
    odd
      .program({ namespace: "broski-chess" })
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
    }
  }, [program]);

  return (
    <SesionContext.Provider value={value}>{children}</SesionContext.Provider>
  );
};
