import type { NextPage } from "next";
import { Page } from "../components/Page";
import { AnalysisRenderer } from "../components/renderers/AnalysisRenderer";

const AnaylisPage: NextPage = () => {
  return (
    <div className={"container mx-auto h-screen"}>
      <Page>
        <AnalysisRenderer />
      </Page>
    </div>
  );
};

export default AnaylisPage;
