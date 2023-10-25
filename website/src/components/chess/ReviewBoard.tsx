import { Chess } from "chess.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Player, useChessboard } from "../../providers/ChessboardProvider";
import { BoardControl } from "./BoardControl";
import { Board } from "./Board";
import { MoveList } from "./MoveList";

interface Props {
  pgn: string;
  // orientation: Player;
}

export const ReviewBoard = ({ pgn }: Props) => {
  const {
    undo,
    game,
    makeMove,
    setPosition,
    resetHighlightedMoves,
    addArrows,
    addHighlightedSquares,
  } = useChessboard();

  // const { isLoading } = usePgns();
  const clearCache = useCallback(() => {
    addHighlightedSquares([], true);
    addArrows([], true);
    resetHighlightedMoves([]);
  }, [resetHighlightedMoves, addArrows, addHighlightedSquares]);

  const pgnGame = useMemo(() => {
    const chess = new Chess();
    chess.loadPgn(pgn);

    // console.log(chess.history())
    return chess;
  }, [pgn]);

  const nextMove = useCallback(() => {
    const nextMoveIdx = pgnGame
      .history({ verbose: true })
      .findIndex((m) => m.before === game.fen());
    const move = pgnGame.history().at(nextMoveIdx);

    return !!makeMove(move as string);
  }, [pgnGame, game, makeMove]);

  const undoMove = useCallback(() => {
    const lastMoveIdx = pgnGame
      .history({ verbose: true })
      .findIndex((m) => m.after === game.fen());

    if (lastMoveIdx < 0) {
      return false;
    }

    const fen = pgnGame.history({ verbose: true }).at(lastMoveIdx)?.before;

    return !!setPosition(fen as string);
  }, [pgnGame, game, setPosition]);

  useEffect(() => {
    const keyboardHandler = (event: Event) => {
      if (
        (event as KeyboardEvent).key === "ArrowLeft" &&
        (undo() || undoMove())
      ) {
        clearCache();
      } else if ((event as KeyboardEvent).key === "ArrowRight" && nextMove()) {
        clearCache();
      }
    };
    window.addEventListener("keydown", keyboardHandler);

    return () => {
      window.removeEventListener("keydown", keyboardHandler);
    };
  }, [undo, undoMove, nextMove, clearCache]);

  return (
    <div className="flex flex-col justify-center w-max h-full sm:mt-0 sm:justify-center items-center">
      {/* <div>{isLoading ? <h2>Loading</h2> : null}</div> */}
      <div className="flex flex-col space-y-6 items-center sm:flex-row sm:space-x-8 sm:space-y-0 lg:space-x-16">
        <div>
          <Board clearCache={clearCache} />
          {/* <BoardControl clearCache={clearCache} /> */}
        </div>
        <MoveList
          moves={pgnGame.history({ verbose: true }).map((m) => ({
            san: m.san,
            fen: m.after,
          }))}
        />
      </div>
    </div>
  );
};
