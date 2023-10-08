import { useSession } from "../../providers/OddSessionProvider";
import { ScreenSize, useSidebar } from "../../providers/SidebarProvider";
import { LandingPage } from "../display/LandingPage";

interface Props {
  stripeApiKey: string
}

export const PreorderRenderer = ({ stripeApiKey }: Props) => {
  const { isConnected, username } = useSession();
  const { expanded, screenSize } = useSidebar();

  return (
    <div className="flex flex-col h-screen">
      {isConnected() ? (
        <div className={`flex flex-col items-center h-full justify-center space-y-16 ${
          expanded ? "md:ml-72" : "md:ml-20"
        }`}>
          <div className="flex flex-col items-center space-y-6 w-96 sm:w-max">
            <h1 className="text-3xl font-semibold text-center">Become an Early Supporter</h1>
            <p className="text-center w-" style={{ width: `${screenSize === ScreenSize.Mobile ? "20rem" : "30rem"}` }}>
              {"Chesski is still in active development. Your early support and gernerosity will be rewarded with free access to the full version on release :)"}
            </p>
          </div>
          <div>
          { /* @ts-ignore */ }
          <stripe-buy-button
            buy-button-id="buy_btn_1NymqIDog9Q5CRysfXu3lLaf"
            publishable-key={stripeApiKey}
            client-reference-id={username}
          >
          { /* @ts-ignore */ }
          </stripe-buy-button>
          </div>
        </div>
      ) : (
        <div className="flex items-center h-screen justify-center">
          <LandingPage
            header="Become an Early Supporter"
            subText="Chesski is still far from perfect. We are actively researching and developing new features. Your contribution will help sustain us so we can keep grinding :)"
            link="/preorder"
          />
        </div>
      )}
    </div>
  );
};
