import type { NextPage } from "next";
import { App } from "../components/App";
import { NotificationProvider } from "../providers/NotificationProvider";
import { SessionProvider } from "../providers/OddSessionProvider";

const Home: NextPage = () => {
  return (
    <div className={"container mx-auto h-screen"}>
      <NotificationProvider>
        <SessionProvider>
          <App />
        </SessionProvider>
      </NotificationProvider>
    </div>
  );
};

export default Home;
