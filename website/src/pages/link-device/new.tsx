import type { NextPage } from "next";
import { Page } from "../../components/Page";
import { NewDeviceRenderer } from "../../components/renderers/NewDeviceRenderer";

const BackupPage: NextPage = () => {
  return (
    <div className={"container mx-auto h-screen"}>
      <Page>
        <NewDeviceRenderer />
      </Page>
    </div>
  );
};

export default BackupPage;
