import { useCallback, useEffect, useState } from "react";
import { useChessboard } from "../../providers/ChessboardProvider";
import { ScreenSize, ScreenSizeBoardMap, useSidebar } from "../../providers/SidebarProvider";
import { CustomBoard } from "./CustomBoard";

export const OpeningsBoard = () => {
  const { addArrows, addHighlightedSquares, resetHighlightedMoves } =
    useChessboard();
  const { screenSize } = useSidebar();
  const [boardSize, setBoardSize] = useState(512);

  const clearCache = useCallback(() => {
    addHighlightedSquares([], true);
    addArrows([], true);
    resetHighlightedMoves([]);
  }, [resetHighlightedMoves, addArrows, addHighlightedSquares]);

  useEffect(() => {
    setBoardSize(ScreenSizeBoardMap[screenSize ?? ScreenSize.Mobile]);
  }, [screenSize]);

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
