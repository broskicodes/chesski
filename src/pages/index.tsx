import type { NextPage } from "next";
import { IndexRenderer } from "../components/renderers/IndexRenderer";
import { Page } from "../components/Page";

const Home: NextPage = () => {
  return (
    <Page>
      <IndexRenderer />
    </Page>
  );
};

export default Home;
