import type { NextPage } from "next";
import { AnalysisRenderer } from "../components/renderers/AnalysisRenderer";
import { NotificationProvider } from "../providers/NotificationProvider";
import { SessionProvider } from "../providers/OddSessionProvider";

const Home: NextPage = () => {
  return (
    <div className={"container mx-auto h-screen"}>
      <NotificationProvider>
        <SessionProvider>
          <AnalysisRenderer />
        </SessionProvider>
      </NotificationProvider>
    </div>
  );
};

export default Home;
