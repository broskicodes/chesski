import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import Link from "next/link";
import { useMemo } from "react";
import { useSession } from "../../providers/OddSessionProvider";
import { useSidebar } from "../../providers/SidebarProvider";
import { CheckoutForm } from "../stripe/CheckoutForm";

interface Props {
  stripeApiKey: string;
}

export const CheckoutRenderer = ({ stripeApiKey }: Props) => {
  const { isConnected } = useSession();
  const { expanded, screenSize } = useSidebar();

  const stripe = useMemo(async () => loadStripe(stripeApiKey), [stripeApiKey]);
  const options: StripeElementsOptions = useMemo(
    () => ({
      mode: "payment",
      amount: 500,
      currency: "usd",
      // appearance: {/*...*/},
    }),
    [],
  );

  return (
    <div className="flex flex-col h-screen">
      {isConnected() ? (
        <div
          className={`flex flex-col items-center h-full justify-center space-y-16 ${
            expanded ? "md:ml-72" : "md:ml-20"
          }`}
        >
          <Elements stripe={stripe} options={options}>
            <CheckoutForm />
          </Elements>
        </div>
      ) : (
        <div>
          {"You seem lost, "}
          <Link href={"/"}>head back Home?</Link>
        </div>
      )}
    </div>
  );
};
