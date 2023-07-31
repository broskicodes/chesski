import { useSession } from "../../providers/OddSessionProvider";
import { Button } from "../Button";

export const DisconnectButton = () => {
  const { disconnect, isConnected } = useSession();

  return (
    <div>
      {isConnected() ? <Button onClick={disconnect}>Disconnect</Button> : null}
    </div>
  );
};
