"use client";

import { useChat } from "ai/react";
import { FunctionCallHandler, nanoid } from "ai";
import { useCallback, useEffect, useState } from "react";
import { Player, useChessboard } from "../../providers/ChessboardProvider";
import { SkillLevel, useStockfish } from "../../providers/StockfishProvider";
import { Button } from "../display/Button";

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

  const [engineOn, setEngineOn] = useState(false);
  const [botSearchFinished, setBotSearchFinished] = useState(false);
  const [botMove, setBotMove] = useState<string | null>(null);

  const setOpenningPositions = useCallback(
    (moves: string[], newOrientation: Player) => {
      if (orientation !== newOrientation) {
        swapOrientation();
      }

      const continuation = moves.flatMap((move) => {
        const entry = move.split(".").at(-1) as string;
        return entry.split(" ").filter((m) => m);
      });
      console.log(continuation)
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
    api: "/api/gpt/opennings",
    body: {
      moves: game.history(),
    },
    // experimental_onFunctionCall: functionCallHandler,
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
    <div
      className={`flex flex-col h-full sm:mt-0 sm:justify-center items-center `}
    >
      <div className="bg-gray-100 p-12 rounded-3xl">
        <div
          className="overflow-y-auto w-96 mb-4 scroll-smooth"
          style={{ width: "30rem;", height: "24rem" }}
        >
          <div className="h-full">
            {messages
              .filter((m) => m.content)
              .map((m, index) => (
                <div key={index}>
                  <span className="font-bold">
                    {m.role === "user" ? "User: " : "Chesski: "}
                  </span>
                  {m.content}
                </div>
              ))}
          </div>
        </div>

        <form
          className="flex w-96 flex-row space-x-3"
          style={{ width: "30rem;" }}
          onSubmit={handleSubmit}
        >
          <input
            className="border grow"
            placeholder="Enter Message"
            value={input}
            onChange={handleInputChange}
          />
          <Button type="submit">Send</Button>
        </form>
      </div>
    </div>
  );
}
