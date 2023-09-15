import { useCallback, useState } from "react";
import { useChessboard } from "../../providers/ChessboardProvider";
import { useSidebar } from "../../providers/SidebarProvider";
import { CustomBoard } from "./CustomBoard";

export const OpenningsBoard = () => {
  const { addArrows, addHighlightedSquares, resetHighlightedMoves } =
    useChessboard();
  const [boardSize, setBoardSize] = useState(512);

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
        <CustomBoard boardSize={boardSize} clearCache={clearCache} />
      </div>
    </div>
  );
};
