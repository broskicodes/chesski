import { useCallback, useEffect, useMemo, useState } from "react";
import { Chessboard } from "react-chessboard";
import { useChessboard } from "../../providers/ChessboardProvider";
import { useNotifications } from "../../providers/NotificationProvider";
import { Button } from "../Button";

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
  const { addNotification } = useNotifications();
  const [stockfish, setStockfish] = useState<Worker | null>(null);
  const [stockfishReady, setStockfishReady] = useState(false);
  const [searching, setSearching] = useState(false);
  const [skillLvl, setSkillLvl] = useState(10);
  const [continuation, setContinuation] = useState("");
  const [size, setSize] = useState(350);

  const onMessage = useCallback(
    ({ data }: MessageEvent<string>) => {
      if (data === "readyok") {
        setStockfishReady(true);
      } else if (data.includes("bestmove")) {
        const move = data.split(" ")[1];
        makeMove(move);
        setSearching(false);
      }
    },
    [makeMove],
  );

  const startEngineSearch = useCallback(() => {
    if (!stockfish || !stockfishReady) {
      return;
    }

    setSearching(true);

    const moves = game.history().join(" ");

    stockfish.postMessage(
      `position fen ${game.fen()}${moves.length > 0 ? ` moves ${moves}` : ""}`,
    );
    stockfish.postMessage("go movetime 1000");
  }, [stockfish, game, stockfishReady]);

  const restartStockfish = useCallback(() => {
    if (!stockfish) {
      return;
    }

    stockfish.postMessage("uci");
    stockfish.postMessage(`setoption name Skill Level value ${skillLvl}`);
    stockfish.postMessage("ucinewgame");
    stockfish.postMessage("isready");
  }, [stockfish, skillLvl]);

  const addContinuation = useCallback(() => {
    if (!continuation) {
      addNotification({ msg: "Invalid continuation", type: "error" });
      return;
    }

    if (setPosition(continuation)) {
      setStockfishReady(false);
      addNotification({ msg: "Position updated", type: "success" });
      setContinuation("");
    } else {
      const moves = continuation.split(" ");

      if (playContinuation(moves)) {
        setStockfishReady(false);
        addNotification({ msg: "Position updated", type: "success" });
        setContinuation("");
      } else {
        addNotification({ msg: "Invalid continuation", type: "error" });
      }
    }
  }, [continuation, addNotification, setPosition, playContinuation]);

  const levels = useMemo(() => Array.from({ length: 21 }, (_, i) => i), []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setStockfish(new Worker("/nmrugg_stockfish_js/stockfish.js"));
    }
  }, []);

  useEffect(() => {
    if (!stockfishReady) restartStockfish();
  }, [restartStockfish, stockfishReady]);

  useEffect(() => {
    if (turn !== orientation && !searching) {
      startEngineSearch();
    }
  }, [turn, orientation, searching, startEngineSearch]);

  useEffect(() => {
    if (!stockfish) {
      return;
    }

    stockfish.onmessage = (event: MessageEvent<string>) => {
      onMessage(event);
    };
  }, [stockfish, onMessage]);

  useEffect(() => {
    console.log("k")
    window.addEventListener('resize', () => {     setSize(window.innerWidth > 600 ? 512 : 350); });

    // Clean up the listener when the component unmounts
    return () => {
      window.removeEventListener('resize', () => {     setSize(window.innerWidth > 600 ? 512 : 350); });
    };
  }, [window])

  // console.log(window.innerWidth);

  return (
    <div className="flex flex-col items-center justify-center h-full 2xl:bg-green-400 xl:bg-orange-400 lg:bg-yellow-400 md:bg-red-400 sm:bg-blue-400">
      <div className="flex flex-col mb-12 space-y-4 w-full">
        <div className="flex flex-row space-x-2">
          <label htmlFor="lvlSelect" className="font-bold ">
            Chesski skill level:{" "}
          </label>
          <select
            id="lvlSlelect"
            className="w-16 rounded-md"
            value={skillLvl}
            onChange={({ target }) => {
              setSkillLvl(Number(target.value));
              setStockfishReady(false);
              addNotification({
                msg: `Chesski level changed to ${target.value}`,
                type: "success",
              });
            }}
          >
            {levels.map((i) => (
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
        onPieceDrop={onDropVersus}
        boardOrientation={orientation}
        boardWidth={size}
      />
      </div>
      <div className="flex flex-row w-full space-x-4 mt-6">
        <Button className="grow" onClick={swapOrientation}>
          Flip Board
        </Button>
        <Button className="grow" onClick={undo}>
          Undo
        </Button>
        <Button
          className="grow"
          onClick={() => {
            setStockfishReady(false);
            reset();
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  );
};
