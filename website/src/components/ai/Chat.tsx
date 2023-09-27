"use client";

import { Button } from "../display/Button";
import { ChatAction, ActionType } from "./ChatAction";
import { useGpt } from "../../providers/GptProvider";

export default function Chat() {
  const { messages, input, submit, updateInput } = useGpt();

  return (
    <div className={`flex flex-col sm:mt-0 sm:justify-center items-center`}>
      <div className={`bg-gray-100 p-6 sm:p-8 lg:p-12 rounded-3xl`}>
        <div className="overflow-y-auto mb-4 scroll-smooth h-64 lg:h-96 w-72 sm:w-96">
          <div className="h-full">
            {messages.length > 0 &&
              messages
                .filter((m) => !m.function_call)
                .map((m, index) => {
                  return m.role === "function" ? (
                    // @ts-ignore
                    <ChatAction key={index} msg={m} />
                  ) : (
                    <div key={index} className={`text-sm sm:text-base`}>
                      <span className="font-bold">
                        {m.role === "user" ? "User: " : "Chesski: "}
                      </span>
                      {m.content}
                    </div>
                  );
                })}
            {!(messages.length > 0) && (
              <ChatAction type={ActionType.Default} defaultDisplay={true} />
            )}
            <div>
              <ChatAction
                type={ActionType.ChooseOpening}
                defaultDisplay={false}
              />
              <ChatAction
                type={ActionType.ChooseOption}
                defaultDisplay={false}
              />
            </div>
          </div>
        </div>

        <form
          className="flex flex-row space-x-3 w-72 sm:w-96"
          onSubmit={submit}
        >
          <input
            className="border grow text-sm sm:text-base"
            placeholder="Enter Message"
            value={input}
            onChange={updateInput}
          />
          <Button type="submit" className="text-sm sm:text-base">
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
