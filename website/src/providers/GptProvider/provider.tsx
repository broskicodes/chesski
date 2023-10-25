import { FunctionCallHandler, Message, nanoid } from "ai";
import { useChat } from "ai/react";
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Player, useChessboard } from "../ChessboardProvider";
import { SkillLevel, useStockfish } from "../StockfishProvider";
import { GptContext, GptProviderContext, Suggestion } from "./context";

const BOT = "bot";
// const ENGINE = "engine";

interface Props extends PropsWithChildren {
  apiEndpoint: string;
}

export const GptProvider = ({ children, apiEndpoint }: Props) => {
  const {
    turn,
    game,
    orientation,
    makeMove,
    swapOrientation,
    playContinuation,
    reset,
  } = useChessboard();
  const { startSearch, setEngineSkillLvl, restartEngine, initEngine, isInit } =
    useStockfish();

  const [botMove, setBotMove] = useState<string | null>(null);
  const [engineOn, setEngineOn] = useState(false);
  const [botSearchFinished, setBotSearchFinished] = useState(false);
  const [bodyAttrs, setBodyAttr] = useState<{ [key: string]: any }>({});
  const [suggestions, setSugguestions] = useState<Suggestion[]>([]);

  const setOpenningPositions = useCallback(
    (moves: string[], newOrientation: Player) => {
      if (orientation !== newOrientation) {
        swapOrientation();
      }

      // console.log(moves);
      const continuation = moves.flatMap((move) => {
        const entry = move.split(".").at(-1) as string;
        return entry.split(" ").filter((m) => m);
      });
      console.log(continuation);
      playContinuation(continuation, true);
    },
    [orientation, playContinuation, swapOrientation],
  );

  const gpt3FunctionCallHandler: FunctionCallHandler = useCallback(
    async (_msgs, functionCall) => {
      const args = JSON.parse(functionCall.arguments);

      switch (functionCall.name) {
        case "updateBoardPos": {
          console.log(args);
          break;
        }
        case "generateUserSuggestions": {
          console.log(args);
          setSugguestions(args["suggestions"]);

          break;
        }
      }
    },
    [],
  );

  const gpt3 = useChat({
    api: "/api/gpt/review/functions",
    body: {
      ...bodyAttrs,
    },
    experimental_onFunctionCall: gpt3FunctionCallHandler,
  });

  const gpt4FunctionCallHandler: FunctionCallHandler = useCallback(
    async (_chatMessages, functionCall) => {
      // console.log(functionCall);

      switch (functionCall.name) {
        case "setOpenningPosition": {
          const args = JSON.parse(functionCall.arguments);
          setOpenningPositions(args["moves"], args["orientation"]);

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

  const {
    messages,
    input,
    isLoading,
    append,
    handleInputChange,
    handleSubmit,
    setMessages,
    setInput,
  } = useChat({
    api: apiEndpoint,
    body: {
      ...bodyAttrs,
    },
    onResponse: (_res) => {
      setSugguestions([]);
    },
    onFinish: (msg) => {
      // console.log(messages, input);
      gpt3.setMessages([
        ...messages,
        { id: nanoid(), role: "user", content: input },
      ]);
      gpt3.append(msg);
    },
    experimental_onFunctionCall: gpt4FunctionCallHandler,
  });

  const updateMessages = useCallback(
    (msgs: Message[], reset: boolean = false) => {
      reset ? setMessages(msgs) : setMessages([...messages, ...msgs]);
    },
    [messages, setMessages],
  );

  const appendMessages = useCallback(
    (msgs: Message[]) => {
      if (messages.length < 0) {
        return;
      }

      updateMessages(msgs.slice(0, -1));
      append(msgs.at(-1) as Message);
    },
    [append, updateMessages, messages],
  );

  const setBody = useCallback((body: { [key: string]: any }) => {
    setBodyAttr(body);
  }, []);

  const getInitialSuggestions = useCallback(() => {
    if (messages.length > 0) return;

    // console.log("suh");

    const msg: Message = {
      id: nanoid(),
      role: "assistant",
      content: "What would you like to know about the game?",
    };

    updateMessages([msg]);

    gpt3.append(msg);
  }, [gpt3, messages, updateMessages]);

  const value: GptProviderContext = useMemo(
    () => ({
      input,
      messages,
      isLoading,
      engineOn,
      suggestions,
      setInput,
      updateMessages,
      appendMessages,
      submit: handleSubmit,
      updateInput: handleInputChange,
      setBody,
      getInitialSuggestions,
    }),
    [
      input,
      messages,
      isLoading,
      engineOn,
      suggestions,
      setInput,
      handleSubmit,
      handleInputChange,
      updateMessages,
      appendMessages,
      setBody,
      getInitialSuggestions,
    ],
  );

  useEffect(() => {
    makeMove(botMove ?? "");
    setBotMove(null);
  }, [botMove, makeMove]);

  useEffect(() => {
    if (engineOn && turn !== orientation && !botSearchFinished) {
      startSearch(BOT);
    } else if (turn === orientation) {
      setBotSearchFinished(false);
    }
  }, [engineOn, turn, orientation, botSearchFinished, startSearch]);

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

  return <GptContext.Provider value={value}>{children}</GptContext.Provider>;
};
