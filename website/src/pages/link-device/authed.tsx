import type { NextPage } from "next";
import { Page } from "../../components/display/Page";
import { AuthedDeviceRenderer } from "../../components/renderers/AuthedDeviceRenderer";

const BackupPage: NextPage = () => {
  return (
    <div className={"container mx-auto h-screen"}>
      <Page>
        <AuthedDeviceRenderer />
      </Page>
    </div>
  );
};

export default BackupPage;
