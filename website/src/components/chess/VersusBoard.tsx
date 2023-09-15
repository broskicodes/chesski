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
import { FlipBoardIcon } from "../icons/FlibBoardIcon";
import { UndoArrowIcon } from "../icons/UndoArrowIcon";
import { ResetIcon } from "../icons/ResetIcon";
import { Hint1Icon } from "../icons/Hint1Icon";
import { Hint2Icon } from "../icons/Hint2Icon";
import { Tooltip } from "../display/Tooltip";
import { StatusIcon } from "../icons/StatusIcon";
import { useSidebar } from "../../providers/SidebarProvider";
import { CustomBoard } from "./CustomBoard";

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
    swapOrientation,
    reset,
    addArrows,
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
  const { expanded } = useSidebar();

  const [botSearchFinished, setBotSearchFinished] = useState(false);
  const [engineSearchFinished, setEngineSearchFinished] = useState(false);

  const [skillLvl, setSkillLvl] = useState<SkillLevel>(SkillLevel.Intermediate);
  const [continuation, setContinuation] = useState("");
  const [boardSize, setBoardSize] = useState(512);
  const [iconSize, setIconSize] = useState(1.3);

  const [botMove, setBotMove] = useState<string | null>(null);
  const [suggestedMoves, setSuggestedMoves] = useState<PV[] | null>(null);
  const [hintLvl, setHintLvl] = useState(0);

  const clearCache = useCallback(() => {
    setBotSearchFinished(false);
    setEngineSearchFinished(false);
    addHighlightedSquares([], true);
    setHintLvl(0);
    addArrows([], true);
    setSuggestedMoves(null);
    resetHighlightedMoves([]);
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
    setBoardSize(
      window.innerWidth >= 640 && window.innerHeight >= 640 ? 512 : 368,
    );
    setIconSize(
      window.innerWidth >= 640 && window.innerHeight >= 640 ? 1.3 : 1,
    );

    const resizeHandler = () => {
      setBoardSize(
        window.innerWidth >= 640 && window.innerHeight >= 640 ? 512 : 368,
      );
      setIconSize(
        window.innerWidth >= 640 && window.innerHeight >= 640 ? 1.3 : 1,
      );
    };

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

    window.addEventListener("resize", resizeHandler);
    window.addEventListener("newBestMove", moveHandler);
    window.addEventListener("maxDepthReached", depthHandler);

    return () => {
      window.removeEventListener("resize", resizeHandler);
      window.removeEventListener("newBestMove", moveHandler);
      window.removeEventListener("maxDepthReached", depthHandler);
    };
  }, []);

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
        addHighlightedSquares(fromSqrs, false);
        break;
      }
      case 2: {
        addHighlightedSquares([], true);
        addArrows(sqrPairs, false);
        break;
      }
      default: {
        if (hintLvl > 2) {
          addHighlightedSquares([], true);
          addArrows(sqrPairs, false);
        }
      }
    }
  }, [
    hintLvl,
    getMoveSuggestions,
    suggestedMoves,
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
      className={`flex flex-col h-full mt-8 sm:mt-0 sm:justify-center ${
        expanded ? "md:ml-72" : "md:ml-20"
      } items-center`}
    >
      <div className="w-fit">
        <div className="flex flex-col mb-12 space-y-4 w-full">
          <div className="flex flex-row space-x-2">
            <label htmlFor="lvlSelect" className="font-bold ">
              Chesski skill level:{" "}
            </label>
            <select
              id="lvlSlelect"
              className="w-40 rounded-md"
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
          <div className="flex flex-col space-y-2 items-center w-full">
            <div className="space-x-2 flex flex-col md:flex-row w-full">
              <p className="font-bold">Set position/continuation: </p>
              <input
                type={"text"}
                className="grow"
                value={continuation}
                placeholder="Enter fen or list of moves"
                onChange={({ target }) => {
                  setContinuation(target.value);
                }}
              />
            </div>
            <button
              className="font-bold bg-slate-300 w-24 py-1 rounded-md hover:bg-slate-300/75"
              onClick={addContinuation}
            >
              Update
            </button>
          </div>
        </div>
        <div>
          <CustomBoard clearCache={clearCache} boardSize={boardSize} />
        </div>
        <div className="flex flex-row w-full mt-4 justify-between">
          <div className="flex flex-row space-x-3">
            <Tooltip content={"Flip Board"}>
              <Button
                className="grow"
                onClick={() => {
                  swapOrientation();
                  clearCache();
                }}
              >
                <FlipBoardIcon height={iconSize} />
              </Button>
            </Tooltip>
            <Tooltip content={"Undo Move"}>
              <Button
                className="grow"
                onClick={() => {
                  const res = undo();
                  if (res) {
                    clearCache();
                  }

                  return res;
                }}
              >
                <UndoArrowIcon height={iconSize} />
              </Button>
            </Tooltip>
            <Tooltip content={"Reset Game"}>
              <Button
                className="grow"
                onClick={() => {
                  restartEngine(BOT);
                  restartEngine(ENGINE);
                  reset();
                  clearCache();
                }}
              >
                <ResetIcon height={iconSize} />
              </Button>
            </Tooltip>
          </div>
          <div className="flex flex-row space-x-3">
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
          </div>
        </div>
      </div>
    </div>
  );
};
