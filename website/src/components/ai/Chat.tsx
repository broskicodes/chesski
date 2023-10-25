"use client";

import { Button } from "../display/Button";
import { ChatAction, ActionType } from "./ChatAction";
import { useGpt } from "../../providers/GptProvider";
import { PropsWithChildren, useEffect, useMemo } from "react";
import { SizedDiv } from "../display/SizedDiv";
import { ScreenSize, useSidebar } from "../../providers/SidebarProvider";

export const Chat = ({ children }: PropsWithChildren) => {
  const { messages, input, submit, updateInput } = useGpt();
  const { screenSize, screenWidth } = useSidebar();

  const width = useMemo(() => {
    switch (screenSize) {
      case ScreenSize.Mobile:
        return screenWidth - 48;
      case ScreenSize.Tablet:
        return 48;
      case ScreenSize.Desktop:
        return 64;
    }
  }, [screenSize, screenWidth]);

  return (
    <div className={`flex flex-col sm:mt-0 sm:justify-center items-center`}>
      <SizedDiv
        width={width}
        px={screenSize === ScreenSize.Mobile}
        className={`bg-gray-100 p-6 sm:p-8 lg:p-12 rounded-3xl`}
      >
        <div className="overflow-y-auto mb-4 scroll-smooth h-64 ">
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
            {children}
          </div>
        </div>
        <div>
          <form className="flex flex-row space-x-3" onSubmit={submit}>
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
      </SizedDiv>
    </div>
  );
};
