import { Message, nanoid } from "ai";
import { useChat } from "ai/react";
import { ChatCompletionMessage } from "openai/resources/chat";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useGpt } from "../../providers/GptProvider";
import { useStockfish } from "../../providers/StockfishProvider";
import { Action } from "../display/Action";

export enum ActionType {
  Default,
  ChooseOpening,
  ChooseOption,
}

interface Props {
  type: ActionType;
  defaultDisplay: boolean;
}

const openings = [
  "Scotch",
  "Sicilian",
  "Grunfeld",
  "Queen's Gambit",
  "King's Gambit",
  "Ruy Lopez",
];

enum Options {
  Engine = "Engine Analysis",
  Position = "Positional Ideas",
  BestMoves = "Best Moves",
}

export const ChatAction = ({ type, defaultDisplay }: Props) => {
  const { messages, engineOn, updateMessages, appendMessages } = useGpt();
  const [dynamicDisplay, setDynamicDisplay] = useState(false);

  const OptionsMap: { [key in Options]: string } = useMemo(
    () => ({
      "Engine Analysis": `Turn ${engineOn ? "off" : "on"} the engine`,
      "Positional Ideas": "What are the main ideas in the position?",
      "Best Moves": "What are 3 good moves in the position and why?",
    }),
    [engineOn],
  );

  const renderAction = useCallback(() => {
    switch (type) {
      case ActionType.Default: {
        return (
          <div>
            <Action
              onClick={() => {
                updateMessages(
                  [
                    {
                      id: nanoid(),
                      role: "assistant",
                      content: "Which opening would you like to study?",
                    },
                  ],
                  true,
                );
              }}
            >
              Choose an Opening
            </Action>
          </div>
        );
      }
      case ActionType.ChooseOpening: {
        return (
          <div className="flex space-x-2">
            {openings.map((name) => (
              <Action
                key={name}
                onClick={() => {
                  appendMessages([
                    { id: nanoid(), role: "user", content: name.toLowerCase() },
                    {
                      id: nanoid(),
                      role: "assistant",
                      content: "Ok, setting board state.",
                    },
                  ]);
                  setDynamicDisplay(false);
                }}
              >
                {name}
              </Action>
            ))}
          </div>
        );
      }
      case ActionType.ChooseOption: {
        return (
          <div className="flex space-x-2">
            {Object.values(Options).map((option) => (
              <Action
                key={option}
                onClick={() => {
                  appendMessages([
                    { id: nanoid(), role: "user", content: OptionsMap[option] },
                  ]);
                  setDynamicDisplay(false);
                }}
              >
                {option}
              </Action>
            ))}
          </div>
        );
      }
    }
  }, [type, updateMessages, appendMessages, OptionsMap]);

  useEffect(() => {
    switch (type) {
      case ActionType.ChooseOpening: {
        if (
          messages.at(-1)?.content === "Which opening would you like to study?"
        ) {
          setDynamicDisplay(true);
        }
        break;
      }
      case ActionType.ChooseOption: {
        const msgs = messages.filter((m) => !m.function_call);
        if (
          msgs.at(-1)?.content === "Ok, setting board state." ||
          msgs.at(-1)?.content === `Turn ${engineOn ? "on" : "off"} the engine`
        ) {
          setDynamicDisplay(true);
          updateMessages([
            {
              id: nanoid(),
              role: "assistant",
              content: "What do you wanna know?",
            },
          ]);
        }
        break;
      }
    }
  }, [messages, type, updateMessages, engineOn]);

  return (
    <div
      className={`flex flex-row flex-nowrap justify-end text-xs ${
        defaultDisplay || dynamicDisplay ? "" : "hidden"
      }`}
    >
      <div className="overflow-x-auto pt-2 pb-1 pl-1 pr-1 custom-scrollbar ">
        {renderAction()}
      </div>
    </div>
  );
};
