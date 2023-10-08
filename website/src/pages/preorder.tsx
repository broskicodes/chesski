import "dotenv/config";

import type { GetServerSidePropsContext, NextPage } from "next";
import { Page } from "../components/display/Page";
import { PreorderRenderer } from "../components/renderers/PreorderRenderer";

interface Props {
  stripeApiKey: string
}

export async function getServerSideProps(_context: GetServerSidePropsContext) {

  return {
    props: { stripeApiKey: process.env.STRIPE_API_KEY }
  };
}

const Home = ({ stripeApiKey }: Props) => {
  return (
    <Page>
      <PreorderRenderer stripeApiKey={stripeApiKey} />
    </Page>
  );
};

export default Home;
