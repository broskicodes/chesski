import type { NextPage } from "next";
import { ReviewListRenderer } from "../../components/renderers/ReviewListRenderer";
import { Page } from "../../components/display/Page";

const Home: NextPage = () => {
  return (
    <Page>
      <ReviewListRenderer />
    </Page>
  );
};

export default Home;
