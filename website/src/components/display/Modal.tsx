import { PropsWithChildren, useState } from "react";
import { useSession } from "../../providers/OddSessionProvider";
import { Button } from "../display/Button";

interface ModalProps extends PropsWithChildren {
  title: string;
}

export const Modal = ({ title, children }: ModalProps) => {
  return (
    <div className="flex flex-col justify-center items-center h-full fixed z-50 inset-0">
      <div
        className={`bg-white h-64 w-96 rounded-2xl flex flex-col justify-center items-center relative`}
      >
        <div className="w-full text-center absolute top-2">
          <p className="text-2xl font-bold">{title}</p>
          <hr />
        </div>
        <div
          className={`px-4 flex flex-col items-center justify-center space-y-4 w-full`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

interface CMProps {
  handleSuccess: () => void;
}

export const ConnectModal = ({ handleSuccess }: CMProps) => {
  const { connect, loading } = useSession();
  const [username, setUsername] = useState("");

  return (
    <Modal title="Create Account">
      <label>
        Username:
        <input
          className="border"
          value={username}
          onChange={({ target }) => {
            setUsername(target.value);
          }}
        />
      </label>
      <div className="flex flex-row w-full justify-around">
        <Button
          disabled={loading}
          onClick={async () => {
            await connect(username);
            handleSuccess();
          }}
        >
          Confirm
        </Button>
        <Button disabled={loading} onClick={handleSuccess}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
};
