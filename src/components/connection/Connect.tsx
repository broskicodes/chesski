import { useState } from "react";
import { useSession } from "../../providers/OddSessionProvider";
import { ConnectButton } from "./ConnectButton";

export const Connect = () => {
  const { isConnected, username } = useSession();
  const [userInput, setUserInput] = useState("");

  return (
    <div>
      {isConnected() ? (
        <p>Connected to user: {username}</p>
      ) : (
        <div className="flex flex-col space-y-4">
          <span>
            <label htmlFor="username">Username: </label>
            <input
              id="username"
              type="text"
              value={userInput}
              onChange={({ target }) => {
                setUserInput(target.value);
              }}
            />
          </span>
          <ConnectButton username={userInput} />
        </div>
      )}
    </div>
  );
};
