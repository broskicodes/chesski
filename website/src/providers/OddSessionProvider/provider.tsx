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
import { useRouter } from "next/navigation";

export const SessionProvider = ({ children }: PropsWithChildren) => {
  const { newAlert, addNotification } = useNotifications();
  const [program, setProgram] = useState<odd.Program | null>(null);
  const [session, setSession] = useState<odd.Session | null>(null);
  const [loading, setLoading] = useState(false);
  // const [chessComUsername, setChessComUsername] = useState<string | null>(null);
  const router = useRouter();

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

      setLoading(true);

      const valid = await program.auth.isUsernameValid(username);
      const available = await program.auth.isUsernameAvailable(username);

      if (valid && available) {
        const { success } = await program.auth.register({ username });

        if (success) {
          const session = await program.auth.session();
          setSession(session);
          await newAlert(
            "Chesski uses a keypair securely stored in ur browser to control access to ur account. No password needed :)",
            "default",
            "Wait... No password?",
          );

          if (
            await newAlert(
              "Linking a device allows you to access your account on multiple devices. It's also the best way to backup your account. Link now?",
              "confirm",
              "Link a device!",
            )
          ) {
            setLoading(false);
            router.push("/link-device/authed");
          }
          // setChessComUsername(pgnName);

          // await session?.fs?.write(
          //   path.file("public", "pgnname"),
          //   Buffer.from(pgnName),
          // );
          // await session?.fs?.publish();

          setLoading(false);
          return true;
        }
      } else {
        addNotification({ type: "error", msg: "Username unavailable" });
      }

      setLoading(false);
      return false;
    },
    [program, session, router, addNotification, newAlert],
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
        "If you proceed, this device will lose access to your account and all its data. Please ensure you have linked at least one device before continuing.",
        "confirm",
        "Leaving already?",
      )
    ) {
      await session.destroy();
      setSession(null);
      // setChessComUsername(null);
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
          router.push(`/?authed=${username}`);
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
      // chessComUsername,
      fs: session?.fs ?? null,
      loading,
      isConnected,
      connect,
      disconnect,
      getAccountProducer,
      getAccountConsumer,
    }),
    [
      session,
      // chessComUsername,
      loading,
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

      // program.session.fs?.read(path.file("public", "pgnname")).then((data) => {
      //   const decoder = new TextDecoder("utf-8");
      //   setChessComUsername(decoder.decode(data));
      // });
    }
  }, [program]);

  return (
    <SesionContext.Provider value={value}>{children}</SesionContext.Provider>
  );
};
