import Chat from "../ai/Chat";
import { ChessboardProvider } from "../../providers/ChessboardProvider";
import { GalleryProvider } from "../../providers/FileGalleryProvider";
import { useSession } from "../../providers/OddSessionProvider";
import { PgnProvider } from "../../providers/PgnProvider";
import { StockfishProvider } from "../../providers/StockfishProvider";
import { OpenningsBoard } from "../chess/OpenningsBoard";
import { LandingPage } from "../display/LandingPage";
import { useSidebar } from "../../providers/SidebarProvider";

export const OpenningsRenderer = () => {
  const { isConnected } = useSession();
  const { expanded } = useSidebar();

  return (
    <div className="flex flex-col h-screen">
      {isConnected() ? (
        <>
          <GalleryProvider>
            <PgnProvider>
              <ChessboardProvider>
                <StockfishProvider>
                  <div
                    className={`h-full ${expanded ? "md:ml-72" : "md:ml-20"}`}
                  >
                    <div className="flex flex-col pt-12 lg:pt-0 lg:flex-row h-full w-full space-y-6 lg:space-y-0 lg:space-x-20 justify-center items-center">
                      <OpenningsBoard />
                      <Chat />
                    </div>
                  </div>
                </StockfishProvider>
              </ChessboardProvider>
            </PgnProvider>
          </GalleryProvider>
        </>
      ) : (
        <div
          className={`flex flex-col h-full mt-8 sm:mt-0 sm:justify-center ${
            expanded ? "md:ml-72" : "md:ml-20"
          } items-center`}
        >
          <LandingPage header="Strengthen your repetoir" subText="Practice in any openning position, study specific lines and learn key insigths with the help of Chesski" link="/opennings" />
        </div>
      )}
    </div>
  );
};
