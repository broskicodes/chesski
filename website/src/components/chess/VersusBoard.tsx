import { useCallback, useEffect, useState } from "react";
import { Player, useChessboard } from "../../providers/ChessboardProvider";
import { useNotifications } from "../../providers/NotificationProvider";
import {
  GameStatus,
  PV,
  SkillLevel,
  useStockfish,
} from "../../providers/StockfishProvider/context";
import { Button } from "../display/Button";
import { Square } from "react-chessboard/dist/chessboard/types";
import {
  ScreenSize,
  ScreenSizeBoardMap,
  useSidebar,
} from "../../providers/SidebarProvider";
import { Board } from "./Board";
import { BoardControl } from "./BoardControl";
import { Tooltip } from "../display/Tooltip";
import { Hint1Icon } from "../icons/Hint1Icon";
import { Hint2Icon } from "../icons/Hint2Icon";
import { StatusIcon } from "../icons/StatusIcon";
import { deepEquals } from "../../utils/helpers";

const BOT = "bot";
const ENGINE = "engine";

export const VersusBoard = () => {
  const {
    game,
    turn,
    makeMove,
    playContinuation,
    setPosition,
    undo,
    arrows,
    addArrows,
    highlightedSquares,
    addHighlightedSquares,
    resetHighlightedMoves,
    orientation,
  } = useChessboard();
  const { addNotification, newAlert } = useNotifications();
  const {
    initEngine,
    isInit,
    startSearch,
    stopSearch,
    setEngineSkillLvl,
    restartEngine,
    getGameStatus,
    getMoveSuggestions,
  } = useStockfish();
  const { expanded, screenSize } = useSidebar();

  const [botSearchFinished, setBotSearchFinished] = useState(false);
  const [engineSearchFinished, setEngineSearchFinished] = useState(false);

  const [skillLvl, setSkillLvl] = useState<SkillLevel>(SkillLevel.Intermediate);
  const [continuation, setContinuation] = useState("");
  const [iconSize, setIconSize] = useState(1.3);

  const [botMove, setBotMove] = useState<string | null>(null);
  const [suggestedMoves, setSuggestedMoves] = useState<PV[] | null>(null);
  const [hintLvl, setHintLvl] = useState(0);

  const clearCache = useCallback(() => {
    setBotSearchFinished(false);
    setEngineSearchFinished(false);
    addHighlightedSquares([], true);
    addArrows([], true);
    setSuggestedMoves(null);
    resetHighlightedMoves([]);
    setHintLvl(0);
  }, [resetHighlightedMoves, addArrows, addHighlightedSquares]);

  const addContinuation = useCallback(() => {
    if (!continuation) {
      addNotification({ msg: "Invalid continuation", type: "error" });
      return;
    }

    if (setPosition(continuation)) {
      stopSearch(ENGINE);
      restartEngine(BOT);
      restartEngine(ENGINE);
      addNotification({ msg: "Position updated", type: "success" });
      setContinuation("");
      clearCache();
    } else {
      const moves = continuation.split(" ");

      if (playContinuation(moves)) {
        stopSearch(ENGINE);
        restartEngine(BOT);
        restartEngine(ENGINE);
        addNotification({ msg: "Position updated", type: "success" });
        setContinuation("");
        clearCache();
      } else {
        addNotification({ msg: "Invalid continuation", type: "error" });
      }
    }
  }, [
    continuation,
    addNotification,
    setPosition,
    playContinuation,
    restartEngine,
    stopSearch,
    clearCache,
  ]);

  useEffect(() => {
    if (!isInit(BOT)) {
      initEngine({
        engineName: BOT,
        skillLvl,
        numPVs: 1,
        moveTime: 1000,
      });
    }

    if (!isInit(ENGINE)) {
      initEngine({
        engineName: ENGINE,
        skillLvl: SkillLevel.Master,
        numPVs: 3,
      });
    }
  }, [initEngine, isInit, skillLvl]);

  useEffect(() => {
    if (turn !== orientation && !botSearchFinished) {
      startSearch(BOT);
    }
  }, [turn, orientation, startSearch, botSearchFinished]);

  useEffect(() => {
    if (turn === orientation && !engineSearchFinished) {
      startSearch(ENGINE);
    }
  }, [turn, orientation, startSearch, engineSearchFinished]);

  useEffect(() => {
    const moveHandler = (event: Event) => {
      const { engineName, move } = (event as CustomEvent).detail;
      if (engineName === BOT) {
        setBotMove(move);
        setBotSearchFinished(true);
      } else if (engineName === ENGINE) {
        setEngineSearchFinished(true);
      }
    };

    const depthHandler = (event: Event) => {
      const { engineName, pv } = (event as CustomEvent).detail;

      if (engineName === ENGINE) {
        setSuggestedMoves((pvs) => {
          return pvs
            ? [...pvs, pv].sort(
                (var1: PV, var2: PV) => -1 * (var1.eval - var2.eval),
              )
            : [pv];
        });
      }
    };

    window.addEventListener("newBestMove", moveHandler);
    window.addEventListener("maxDepthReached", depthHandler);

    return () => {
      window.removeEventListener("newBestMove", moveHandler);
      window.removeEventListener("maxDepthReached", depthHandler);
    };
  }, []);

  useEffect(() => {
    setIconSize(screenSize === ScreenSize.Mobile ? 1 : 1.3);
  }, [screenSize]);

  useEffect(() => {
    const keyboardHandler = (event: Event) => {
      if ((event as KeyboardEvent).key === "ArrowLeft" && undo()) {
        clearCache();
      }
    };
    window.addEventListener("keydown", keyboardHandler);

    return () => {
      window.removeEventListener("keydown", keyboardHandler);
    };
  }, [undo, clearCache]);

  useEffect(() => {
    makeMove(botMove ?? "");
    setBotMove(null);
  }, [botMove, makeMove]);

  useEffect(() => {
    let pvs;
    if (!suggestedMoves) {
      try {
        pvs = getMoveSuggestions(ENGINE);
      } catch {
        return;
      }
    }

    const pvMap = (pv: PV) => {
      const move = pv.variation[0];
      return [move.slice(0, 2), move.slice(2, 4)] as Square[];
    };

    const sqrPairs: Square[][] =
      suggestedMoves?.map(pvMap) ?? (pvs?.map(pvMap) as Square[][]);

    switch (hintLvl) {
      case 1: {
        const fromSqrs = sqrPairs.map((pair) => {
          return pair[0];
        });

        if (!deepEquals(highlightedSquares, fromSqrs)) {
          addHighlightedSquares(fromSqrs, true);
        }
        break;
      }
      case 2: {
        // addHighlightedSquares([], true);
        if (!deepEquals(sqrPairs, arrows)) {
          addArrows(sqrPairs, true);
        }
        break;
      }
      default: {
        if (hintLvl > 2) {
          // addHighlightedSquares([], true);
          if (!deepEquals(sqrPairs, arrows)) {
            addArrows(sqrPairs, true);
          }
        }
      }
    }
  }, [
    hintLvl,
    suggestedMoves,
    highlightedSquares,
    arrows,
    getMoveSuggestions,
    addHighlightedSquares,
    addArrows,
  ]);

  useEffect(() => {
    if (game.isGameOver()) {
      if (game.isCheckmate()) {
        newAlert(
          `${
            turn === Player.White ? Player.Black : Player.White
          } wins by checkmate.`,
          "default",
          "Game Over",
        );
      } else {
        let reason: string;
        if (game.isThreefoldRepetition()) {
          reason = "repetion";
        } else if (game.isStalemate()) {
          reason = "stalemate";
        } else if (game.isInsufficientMaterial()) {
          reason = "insufficient material";
        } else {
          reason = "50 move rule";
        }

        newAlert(`Draw by ${reason}`, "default", "Game Over");
      }
    }
  }, [game, turn, newAlert]);

  return (
    <div
      className={`flex flex-col h-full mt-14 sm:mt-0 sm:justify-center ${
        expanded ? "md:ml-72" : "md:ml-20"
      } items-center`}
    >
      <div className="w-fit flex flex-col">
        <div className="flex flex-col mb-12 space-y-4 w-full">
          <div className="flex flex-row space-x-2">
            <label htmlFor="lvlSelect" className="font-bold ">
              Chesski skill level:{" "}
            </label>
            <select
              id="lvlSlelect"
              className="w-40 rounded-md text-sm"
              value={skillLvl}
              onChange={({ target }) => {
                if (setEngineSkillLvl(BOT, target.value as SkillLevel)) {
                  setSkillLvl(target.value as SkillLevel);
                  addNotification({
                    msg: `Chesski level changed to ${target.value}`,
                    type: "success",
                  });
                }
              }}
            >
              {Object.values(SkillLevel).map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
          <form
            className="flex flex-col space-y-2 items-center w-full"
            onSubmit={(e) => {
              e.preventDefault();
              addContinuation();
            }}
          >
            <div className="space-x-2 flex flex-col md:flex-row w-full">
              <label className="font-bold">Set position/continuation: </label>
              <input
                type={"text"}
                className="grow border rounded-sm text-xs lg:text-base"
                value={continuation}
                placeholder="Enter fen or list of moves"
                onChange={({ target }) => {
                  setContinuation(target.value);
                }}
              />
            </div>
            <button
              type="submit"
              className="font-bold bg-slate-300 w-24 py-1 rounded-md hover:bg-slate-300/75"
            >
              Update
            </button>
          </form>
        </div>
        <div className="mx-auto">
          <Board clearCache={clearCache} />
        </div>
        <BoardControl clearCache={clearCache}>
          <Tooltip content={"Status"}>
            <Button
              className="grow"
              onClick={() => {
                try {
                  const [player, status] = getGameStatus(ENGINE);
                  addNotification({
                    msg: `${
                      status === GameStatus.Equal ? "" : `${player} `
                    }${status}`,
                  });
                } catch (err) {
                  addNotification({
                    type: "error",
                    msg: (err as Error).message,
                  });
                }
              }}
            >
              <StatusIcon height={iconSize} />
            </Button>
          </Tooltip>
          <Tooltip content={`Hint ${hintLvl < 1 ? 1 : 2}`}>
            <Button
              className="grow"
              onClick={() => {
                try {
                  setHintLvl(hintLvl + 1);
                  console.log("hey");
                  addHighlightedSquares([], true);
                } catch (err) {
                  addNotification({
                    type: "error",
                    msg: (err as Error).message,
                  });
                }
              }}
            >
              {hintLvl < 1 ? (
                <Hint1Icon height={iconSize} />
              ) : (
                <Hint2Icon height={iconSize} />
              )}
            </Button>
          </Tooltip>
        </BoardControl>
      </div>
    </div>
  );
};
