import { useSession } from "../../providers/OddSessionProvider";
import { Button } from "../display/Button";

interface ConnectButtonProps {
  username: string;
  // pgnName: string;
}

export const ConnectButton = ({ username }: ConnectButtonProps) => {
  const { connect } = useSession();

  return (
    <Button
      onClick={async () => {
        await connect(username);
      }}
    >
      Connect
    </Button>
  );
};
