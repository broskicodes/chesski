import type { NextPage } from "next";
import { IndexRenderer } from "../components/renderers/IndexRenderer";
import { Page } from "../components/display/Page";
import { PlayRenderer } from "../components/renderers/PlayRenderer";

const Home: NextPage = () => {
  return (
    <Page>
      {/* <IndexRenderer /> */}
      <PlayRenderer />
    </Page>
  );
};

export default Home;
