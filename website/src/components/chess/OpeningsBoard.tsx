import { useCallback } from "react";
import { useChessboard } from "../../providers/ChessboardProvider";
import { Board } from "./Board";

export const OpeningsBoard = () => {
  const { addArrows, addHighlightedSquares, resetHighlightedMoves } =
    useChessboard();

  const clearCache = useCallback(() => {
    addHighlightedSquares([], true);
    addArrows([], true);
    resetHighlightedMoves([]);
  }, [resetHighlightedMoves, addArrows, addHighlightedSquares]);

  return (
    <div
      className={`flex flex-col h-full sm:mt-0 sm:justify-center items-center`}
    >
      <div className="flex justify-center items-center">
        <Board clearCache={clearCache} />
      </div>
    </div>
  );
};
