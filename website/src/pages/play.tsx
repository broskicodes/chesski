import type { NextPage } from "next";
import { Page } from "../components/display/Page";
import { PlayRenderer } from "../components/renderers/PlayRenderer";

const Home: NextPage = () => {
  return (
    <Page>
      <PlayRenderer />
    </Page>
  );
};

export default Home;
