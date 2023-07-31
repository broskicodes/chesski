import { Move } from "chess.js";
import { ParsedPGN } from "pgn-parser";
import { useEffect, useState } from "react";

interface MoveProps {
  transpositions: [ParsedPGN, number][];
  orientation: "white" | "black";
  setNewTempPos: (move: string | null) => void;
  makeMove: (
    move:
      | string
      | {
          from: string;
          to: string;
          promotion?: string | undefined;
        },
  ) => Move | null;
}

export const Moves = ({
  transpositions,
  orientation,
  setNewTempPos,
  makeMove,
}: MoveProps) => {
  const [nextMoves, setNextMoves] = useState<{
    [key: string]: [number, number];
  }>({});

  useEffect(() => {
    const moveCtr: { [key: string]: [number, number] } = {};
    transpositions.forEach((tpos) => {
      const [pgn, moveIdx] = tpos;
      const nextMove = pgn.moves[moveIdx + 1]?.move;

      if (!nextMove) {
        return;
      }

      const winNotation = orientation === "white" ? "1-0" : "0-1";
      const didWin = pgn.result === winNotation;

      if (Object.keys(moveCtr).includes(nextMove)) {
        moveCtr[nextMove][0] += 1;
        if (didWin) {
          moveCtr[nextMove][1] += 1;
        }
      } else {
        moveCtr[nextMove] = [1, didWin ? 1 : 0];
      }
    });

    setNextMoves(moveCtr);
  }, [transpositions, orientation]);

  return (
    <div className="grid grid-cols-4 justify-items-center gap-y-2 mt-6">
      {Object.keys(nextMoves).map((key) => (
        <button
          className="flex flex-col justify-start rounded-lg hover:bg-slate-300/50 py-1 px-2"
          key={key}
          onMouseEnter={() => {
            setNewTempPos(key);
          }}
          onMouseLeave={() => {
            setNewTempPos(null);
          }}
          onClick={() => {
            makeMove(key);
          }}
        >
          <p>
            {key}: {nextMoves[key][0]}
          </p>
          <p>
            Win rate:{" "}
            {Math.round((nextMoves[key][1] / nextMoves[key][0]) * 100)}%
          </p>
        </button>
      ))}
    </div>
  );
};
