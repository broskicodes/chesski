import Link from "next/link";
import { ScreenSize, useSidebar } from "../../providers/SidebarProvider";
import { CoffeeIcon } from "../icons/CoffeeIcon";

export const BuyMeACoffee = () => {
  const { screenSize } = useSidebar();

  return (
    <div className="absolute bottom-6 right-6 z-40 lg:bottom-10 lg:right-10">
      <Link href="https://www.buymeacoffee.com/broskii" target="_blank">
        <div className="rounded-full border p-4 shadow-md hover:bg-gray-100">
          <CoffeeIcon height={screenSize === ScreenSize.Mobile ? 2 : 2.5} />
        </div>
      </Link>
    </div>
  );
};
