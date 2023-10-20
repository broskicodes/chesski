import type { NextPage } from "next";
import { useRouter } from "next/router";
import { Page } from "../../components/display/Page";
import { GameReviewRenderer } from "../../components/renderers/GameReviewRenderer";

const AnaylisPage: NextPage = () => {
  const router = useRouter();
  const { gameId } = router.query;

  return (
    <div className={"container mx-auto h-screen"}>
      <Page>{gameId && <GameReviewRenderer gameId={gameId as string} />}</Page>
    </div>
  );
};

export default AnaylisPage;
