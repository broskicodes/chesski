import "dotenv/config";

import type { GetServerSidePropsContext, NextPage } from "next";
import { Page } from "../../components/display/Page";
import { CheckoutRenderer } from "../../components/renderers/CheckoutRenderer";

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
      <CheckoutRenderer stripeApiKey={stripeApiKey} />
    </Page>
  );
};

export default Home;
