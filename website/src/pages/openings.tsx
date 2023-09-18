import type { NextPage } from "next";
import { Page } from "../components/display/Page";
import { OpeningsRenderer } from "../components/renderers/OpeningsRenderer";

// export const runtime = "experimental-edge";

const Home: NextPage = () => {
  return (
    <Page>
      <OpeningsRenderer />
    </Page>
  );
};

export default Home;
