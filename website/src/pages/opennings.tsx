import type { NextPage } from "next";
import { Page } from "../components/display/Page";
import { OpenningsRenderer } from "../components/renderers/OpenningsRenderer";

export const runtime = "experimental-edge";

const Home: NextPage = () => {
  return (
    <Page>
      <OpenningsRenderer />
    </Page>
  );
};

export default Home;
