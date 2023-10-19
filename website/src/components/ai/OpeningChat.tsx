"use client";

import { ChatAction, ActionType } from "./ChatAction";
import { useGpt } from "../../providers/GptProvider";
import { Chat } from "./Chat";

export const OpeningChat = () => {
  const { messages } = useGpt();

  return (
    <div>
      <Chat>
        {!(messages.length > 0) && (
          <ChatAction type={ActionType.Default} defaultDisplay={true} />
        )}
        <div>
          <ChatAction type={ActionType.ChooseOpening} defaultDisplay={false} />
          <ChatAction type={ActionType.ChooseOption} defaultDisplay={false} />
        </div>
      </Chat>
    </div>
  );
};
