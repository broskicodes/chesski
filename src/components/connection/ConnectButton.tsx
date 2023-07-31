import { useSession } from "../../providers/OddSessionProvider";
import { Button } from "../Button";

interface ConnectButtonProps {
  username: string;
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
