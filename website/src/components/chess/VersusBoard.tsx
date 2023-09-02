import { useCallback, useEffect, useMemo, useState } from "react";
import { Chessboard } from "react-chessboard";
import { Player, useChessboard } from "../../providers/ChessboardProvider";
import { useNotifications } from "../../providers/NotificationProvider";
import {
  GameStatus,
  PV,
  SkillLevel,
  useStockfish,
} from "../../providers/StockfishProvider/context";
import { Button } from "../display/Button";
import { DarkSquares } from "../../utils/types";
import { Square } from "react-chessboard/dist/chessboard/types";
import { Move } from "chess.js";
import { FlipBoardIcon } from "../icons/FlibBoardIcon";
import { UndoArrowIcon } from "../icons/UndoArrowIcon";
import { ResetIcon } from "../icons/ResetIcon";
import { Hint1Icon } from "../icons/Hint1Icon";
import { Hint2Icon } from "../icons/Hint2Icon";
import { ExportIcon } from "../icons/ExportIcon";
import { Tooltip } from "../display/Tooltip";
import { StatusIcon } from "../icons/StatusIcon";

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
    onDropVersus,
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

  const [botSearchFinished, setBotSearchFinished] = useState(false);
  const [engineSearchFinished, setEngineSearchFinished] = useState(false);

  const [skillLvl, setSkillLvl] = useState<SkillLevel>(SkillLevel.Intermediate);
  const [continuation, setContinuation] = useState("");
  const [boardSize, setBoardSize] = useState(512);

  const [botMove, setBotMove] = useState<string | null>(null);
  const [suggestedMoves, setSuggestedMoves] = useState<PV[] | null>(null);
  const [hintLvl, setHintLvl] = useState(0);
  const [highlightedSqrs, setHighlightedSqrs] = useState<string[]>([]);
  const [highlightedMoves, setHighlightedMoves] = useState<Move[]>([]);
  const [arrows, setArrows] = useState<Square[][]>([]);

  const clearCache = useCallback(() => {
    setBotSearchFinished(false);
    setEngineSearchFinished(false);
    setHighlightedSqrs([]);
    setHintLvl(0);
    setArrows([]);
    setSuggestedMoves(null);
    setHighlightedMoves([]);
  }, []);

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
    setBoardSize(window.innerWidth > 600 ? 512 : 368);

    const resizeHandler = () => {
      setBoardSize(window.innerWidth > 600 ? 512 : 368);
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
        setHighlightedSqrs((sqrs) => {
          const fromSqrs = sqrPairs.map((pair) => {
            return pair[0];
          });
          return [...sqrs, ...fromSqrs];
        });
        break;
      }
      case 2: {
        setHighlightedSqrs([]);
        setArrows((arrs) => {
          return [...arrs, ...sqrPairs];
        });
        break;
      }
      default: {
        if (hintLvl > 2) {
          setHighlightedSqrs([]);
          console.log(sqrPairs);
          setArrows((arrs) => {
            return [...arrs, ...sqrPairs];
          });
        }
      }
    }
  }, [hintLvl, getMoveSuggestions, suggestedMoves]);

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
    <div className="flex flex-col items-center h-full">
      <div className="flex flex-col mb-12 space-y-4 w-full">
        <div className="flex flex-row space-x-2">
          <label htmlFor="lvlSelect" className="font-bold ">
            Chesski skill level:{" "}
          </label>
          <select
            id="lvlSlelect"
            className="w-32 rounded-md"
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
        <Chessboard
          position={game.fen()}
          onPieceDrop={(src, tgt) => {
            const res = onDropVersus(src, tgt);
            if (res) {
              clearCache();
            }

            return res;
          }}
          onSquareClick={(sqr) => {
            if (highlightedMoves.length > 0) {
              if (makeMove({ from: highlightedMoves[0].from, to: sqr })) {
                clearCache();
                return;
              }
            }

            setHighlightedMoves(game.moves({ square: sqr, verbose: true }));
            setHighlightedSqrs([]);
          }}
          onSquareRightClick={(sqr) => {
            setHighlightedSqrs((sqrs) => {
              return [...sqrs, sqr];
            });
          }}
          customSquareStyles={(() => {
            const sqrStyles: { [key: string]: {} } = {};
            highlightedSqrs.forEach((sqr) => {
              sqrStyles[sqr] = {
                background: DarkSquares.includes(sqr) ? "#F48367" : "#F7A28D",
              };
            });
            highlightedMoves.forEach((sqr) => {
              sqrStyles[sqr.from] = {
                ...sqrStyles[sqr.from],
                background: "#E6FF99",
              };
              sqrStyles[sqr.to] = {
                ...sqrStyles[sqr.to],
                background:
                  "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 10%)",
              };
            });
            return sqrStyles;
          })()}
          customArrows={arrows}
          boardOrientation={orientation}
          boardWidth={boardSize}
        />
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
              <FlipBoardIcon />
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
              <UndoArrowIcon />
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
              <ResetIcon />
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
              <StatusIcon />
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
              {hintLvl < 1 ? <Hint1Icon /> : <Hint2Icon />}
            </Button>
          </Tooltip>
        </div>
        {/* <Tooltip content={"Export Game"}>
        <Button onClick={() => {}}><ExportIcon /></Button>
      </Tooltip> */}
      </div>
    </div>
  );
};
