"use client";

import { useChat } from "ai/react";
import { FunctionCallHandler, nanoid } from "ai";
import { useCallback, useEffect, useState } from "react";
import { Player, useChessboard } from "../../providers/ChessboardProvider";
import { SkillLevel, useStockfish } from "../../providers/StockfishProvider";
import { Button } from "../display/Button";
import { ScreenSize, useSidebar } from "../../providers/SidebarProvider";

const BOT = "bot";
const ENGINE = "engine";

export default function Chat() {
  const {
    game,
    orientation,
    turn,
    makeMove,
    reset,
    playContinuation,
    swapOrientation,
  } = useChessboard();
  const { initEngine, isInit, setEngineSkillLvl, restartEngine, startSearch } =
    useStockfish();
  const { screenSize } = useSidebar();

  const [engineOn, setEngineOn] = useState(false);
  const [botSearchFinished, setBotSearchFinished] = useState(false);
  const [botMove, setBotMove] = useState<string | null>(null);

  const setOpenningPositions = useCallback(
    (moves: string[], newOrientation: Player) => {
      if (orientation !== newOrientation) {
        swapOrientation();
      }

      console.log(moves);
      const continuation = moves.flatMap((move) => {
        const entry = move.split(".").at(-1) as string;
        return entry.split(" ").filter((m) => m);
      });
      console.log(continuation);
      playContinuation(continuation, true);
    },
    [orientation, playContinuation, swapOrientation],
  );

  const functionCallHandler: FunctionCallHandler = useCallback(
    async (_chatMessages, functionCall) => {
      console.log(functionCall);

      switch (functionCall.name) {
        case "setOpenningPosition": {
          const args = JSON.parse(functionCall.arguments);
          setOpenningPositions(args["moves"], args["orientation"]);

          // const functionResponse = {
          //   messages: [
          //     ...chatMessages,
          //     {
          //       id: nanoid(),
          //       name: "setOpenningPositions",
          //       role: "function" as const,
          //       content: "Sure. Should i turn on the engine?",
          //     },
          //   ],
          // };
          // return functionResponse;
          break;
        }
        case "resetGame": {
          reset();
          setBotSearchFinished(false);
          setEngineOn(false);
          break;
        }
        case "startEngine": {
          const args = JSON.parse(functionCall.arguments);
          const skillLvl: SkillLevel = args["difficultyLevel"];

          if (!isInit(BOT)) {
            initEngine({
              engineName: BOT,
              skillLvl,
              numPVs: 1,
              moveTime: 1000,
            });
          } else {
            setEngineSkillLvl(BOT, skillLvl);
            restartEngine(BOT);
          }

          setEngineOn(true);
          break;
        }
        case "stopEngine": {
          setBotSearchFinished(false);
          setEngineOn(false);
          break;
        }
      }
    },
    [
      initEngine,
      isInit,
      reset,
      restartEngine,
      setOpenningPositions,
      setEngineSkillLvl,
    ],
  );

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/gpt/openings",
    body: {
      moves: game.history(),
    },
    experimental_onFunctionCall: functionCallHandler,
  });

  useEffect(() => {
    if (engineOn && turn !== orientation && !botSearchFinished) {
      startSearch(BOT);
    } else if (turn === orientation) {
      setBotSearchFinished(false);
    }
  }, [engineOn, turn, orientation, botSearchFinished, startSearch]);

  useEffect(() => {
    makeMove(botMove ?? "");
    setBotMove(null);
  }, [botMove, makeMove]);

  useEffect(() => {
    const moveHandler = (event: Event) => {
      const { engineName, move } = (event as CustomEvent).detail;
      if (engineName === BOT) {
        setBotMove(move);
        setBotSearchFinished(true);
      }
    };

    window.addEventListener("newBestMove", moveHandler);

    return () => {
      window.removeEventListener("newBestMove", moveHandler);
    };
  }, []);

  return (
    <div className={`flex flex-col sm:mt-0 sm:justify-center items-center`}>
      <div className={`bg-gray-100 p-6 sm:p-8 lg:p-12 rounded-3xl`}>
        <div className="overflow-y-auto mb-4 scroll-smooth h-64 lg:h-96 w-72 sm:w-96">
          <div className="h-full">
            {messages
              .filter((m) => m.content)
              .map((m, index) => (
                <div key={index} className={`text-sm sm:text-base`}>
                  <span className="font-bold">
                    {m.role === "user" ? "User: " : "Chesski: "}
                  </span>
                  {m.content}
                </div>
              ))}
          </div>
        </div>

        <form
          className="flex flex-row space-x-3 w-72 sm:w-96"
          onSubmit={handleSubmit}
        >
          <input
            className="border grow text-sm sm:text-base"
            placeholder="Enter Message"
            value={input}
            onChange={handleInputChange}
          />
          <Button type="submit" className="text-sm sm:text-base">
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
