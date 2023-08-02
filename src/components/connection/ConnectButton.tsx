import { useSession } from "../../providers/OddSessionProvider";
import { Button } from "../Button";

interface ConnectButtonProps {
  username: string;
  pgnName: string;
}

export const ConnectButton = ({ username, pgnName }: ConnectButtonProps) => {
  const { connect } = useSession();

  return (
    <Button
      onClick={async () => {
        await connect(username, pgnName);
      }}
    >
      Connect
    </Button>
  );
};
