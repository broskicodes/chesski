import {
  EngineArgs,
  GameStatus,
  PV,
  SkillLevel,
  SkillMap,
  Stockfish,
  StockfishContext,
  StockfishProviderContext,
} from "./context";
import { PropsWithChildren, useCallback, useMemo, useState } from "react";
import { Player, useChessboard } from "../ChessboardProvider";
import { Move } from "chess.js";

const MAX_DEPTH = 12;

export const StockfishProvider = ({ children }: PropsWithChildren) => {
  const { game, turn } = useChessboard();
  const [engines, setEngines] = useState<{ [key: string]: Stockfish }>({});

  const getOnMessage = useCallback(
    (engineName: string) => {
      return ({ data }: MessageEvent<string>) => {
        // console.log(data);
        const engine = engines[engineName];

        if (!engine || !data) {
          return;
        }

        const tempEngines = engines;

        if (data === "readyok") {
          tempEngines[engineName] = {
            ...engine,
            isReady: true,
          };

          setEngines({ ...tempEngines });
        } else if (data.includes("bestmove")) {
          const move = data.split(" ")[1];

          tempEngines[engineName] = {
            ...engine,
            bestMove: move,
            isSearching: engine.moveTime ? false : engine.isSearching,
          };

          const event = new CustomEvent("newBestMove", {
            detail: {
              move,
              engineName: engineName,
            },
          });

          window.dispatchEvent(event);
          setEngines({ ...tempEngines });
        } else if (data.includes("multipv")) {
          const sections = data.split("pv ");
          const num = Number(sections[1].at(0));
          const evalualtion = Number(sections[1].split(" ").at(3));
          const isMate = sections[1].split(" ").at(2) === "mate";
          const variation = sections[2].split(" ");

          let gameStatus: GameStatus;

          if (isMate) {
            gameStatus = GameStatus.Mate;
          } else {
            if (Math.abs(evalualtion) > 300) {
              gameStatus = GameStatus.Winning;
            } else if (Math.abs(evalualtion) > 100) {
              gameStatus = GameStatus.Better;
            } else {
              gameStatus = GameStatus.Equal;
            }
          }

          const opponent = turn === Player.White ? Player.Black : Player.White;

          const pv: PV = {
            eval: evalualtion,
            isMate,
            variation,
            gameStatus,
            advantage: evalualtion > 0 ? turn : opponent,
          };

          const tempPVs = tempEngines[engineName].pvs ?? {};
          tempPVs[num] = pv;

          const depth = Number(data.split(" ")[2]);

          tempEngines[engineName] = {
            ...engine,
            pvs: { ...tempPVs },
            isSearching:
              !engine.moveTime && depth === MAX_DEPTH && num === engine.numPVs
                ? false
                : engine.isSearching,
          };

          if (depth === MAX_DEPTH) {
            const event = new CustomEvent("maxDepthReached", {
              detail: {
                depth,
                pv: pv,
                engineName: engineName,
              },
            });

            window.dispatchEvent(event);
          }

          setEngines({ ...tempEngines });
        }
      };
    },
    [engines, turn],
  );

  const isInit = useCallback(
    (engineName: string) => {
      return Object.keys(engines).includes(engineName);
    },
    [engines],
  );

  const restartEngine = useCallback(
    (engineName: string) => {
      const engine = engines[engineName];

      if (!engine) {
        return false;
      }

      const tempEngines = engines;
      tempEngines[engineName] = {
        ...engine,
        isSearching: false,
        bestMove: null,
        pvs: null,
      };

      setEngines({ ...tempEngines });

      engine.worker.onmessage = (event: MessageEvent<string>) => {
        const onMessage = getOnMessage(engine.name);
        onMessage(event);
      };

      engine.worker.postMessage(`setoption name Skill Level value ${20}`);
      engine.worker.postMessage(
        `setoption name MultiPV value ${engine.numPVs}`,
      );
      engine.worker.postMessage(
        `setoption name UCI_LimitStrength value ${true}`,
      );
      engine.worker.postMessage(
        `setoption name UCI_ELO value ${SkillMap[engine.skillLvl]}`,
      );
      engine.worker.postMessage("ucinewgame");
      engine.worker.postMessage("isready");

      return true;
    },
    [engines, getOnMessage],
  );

  const initEngine = useCallback(
    ({ engineName, skillLvl, numPVs, moveTime }: EngineArgs) => {
      try {
        if (typeof window === "undefined") {
          return false;
        }

        const worker = new Worker("/nmrugg_stockfish_js/stockfish.js");

        worker.onmessage = (event: MessageEvent<string>) => {
          const onMessage = getOnMessage(engine.name);
          onMessage(event);
        };

        const engine: Stockfish = {
          name: engineName,
          worker,
          isReady: false,
          isSearching: false,
          skillLvl,
          numPVs,
          moveTime,
          bestMove: null,
          pvs: null,
        };

        const tempEngines = engines;
        tempEngines[engineName] = engine;

        setEngines({ ...tempEngines });

        engine.worker.postMessage("uci");
        return restartEngine(engineName);
      } catch (e) {
        console.error(e);
        return false;
      }
    },
    [engines, getOnMessage, restartEngine],
  );

  const startSearch = useCallback(
    (engineName: string) => {
      const engine = engines[engineName];

      if (!engine || !engine.isReady || engine.isSearching) {
        return false;
      }

      const tempEngines = engines;
      tempEngines[engineName] = {
        ...engine,
        isSearching: true,
      };

      setEngines({ ...tempEngines });

      engine.worker.onmessage = (event: MessageEvent<string>) => {
        const onMessage = getOnMessage(engine.name);
        onMessage(event);
      };

      engine.worker.postMessage("stop");

      const moves = game.history().join(" ");

      engine.worker.postMessage(
        `position fen ${game.fen()}${
          moves.length > 0 ? ` moves ${moves}` : ""
        }`,
      );

      engine.worker.postMessage(
        `go ${
          engine.moveTime ? `movetime ${engine.moveTime}` : `depth ${MAX_DEPTH}`
        }`,
      );

      return true;
    },
    [engines, game, getOnMessage],
  );

  const stopSearch = useCallback(
    (engineName: string) => {
      const engine = engines[engineName];

      if (!engine) {
        return false;
      }

      engine.worker.onmessage = (event: MessageEvent<string>) => {
        const onMessage = getOnMessage(engine.name);
        onMessage(event);
      };

      engine.worker.postMessage("stop");

      return true;
    },
    [engines, getOnMessage],
  );

  const setEngineSkillLvl = useCallback(
    (engineName: string, skillLvl: SkillLevel) => {
      const engine = engines[engineName];

      if (!engine) {
        return false;
      }

      const tempEngines = engines;

      tempEngines[engineName] = {
        ...engine,
        skillLvl,
      };

      setEngines({ ...tempEngines });

      return restartEngine(engineName);
    },
    [engines, restartEngine],
  );

  const evaluateGame = useCallback(async (engineName: string, moves: Move[]) => {
    const engine = engines[engineName];

    if (!engine) {
      return [];
    }
    // const worker = new Worker("/nmrugg_stockfish_js/stockfish.js");
    // worker.postMessage("uci");
    // worker.postMessage("ucinewgame");

    const evals: any[] = [];
let i = 1;
    for (const move of moves) {
      // Send the FEN to the worker and wait for the evaluation
      const evaluation = await new Promise<number>((resolve) => {

          // console.log(move.after)
          engine.worker.postMessage(`position fen ${move.after}`);
          engine.worker.postMessage("eval");

          // resolve(0)
          engine.worker.onmessage = (e) => {
              if (e.data.startsWith('Final evaluation')) {
                  console.log(i++, parseFloat(e.data.split(/\s+/).at(2)));
                  resolve(parseFloat(e.data.split(/\s+/).at(2)));
              }
          };
      });

      // console.log("hey")

      evals.push(evaluation);
      // break;
  }

  return evals;

  }, [])

  const getGameStatus = useCallback(
    (engineName: string): [Player, GameStatus] => {
      const engine = engines[engineName];

      if (!engine || !engine.pvs) {
        throw new Error("Engine not ready");
      }

      return [engine.pvs[1].advantage, engine.pvs[1].gameStatus];
    },
    [engines],
  );

  const getMoveSuggestions = useCallback(
    (engineName: string): PV[] => {
      const engine = engines[engineName];

      if (!engine || !engine.pvs) {
        throw new Error("Engine not ready");
      }

      return Object.values(engine.pvs);
    },
    [engines],
  );

  const value: StockfishProviderContext = useMemo(
    () => ({
      initEngine,
      isInit,
      startSearch,
      stopSearch,
      restartEngine,
      setEngineSkillLvl,
      evaluateGame,
      getGameStatus,
      getMoveSuggestions,
    }),
    [
      initEngine,
      isInit,
      startSearch,
      stopSearch,
      restartEngine,
      setEngineSkillLvl,
      evaluateGame,
      getGameStatus,
      getMoveSuggestions,
    ],
  );

  return (
    <StockfishContext.Provider value={value}>
      {children}
    </StockfishContext.Provider>
  );
};
