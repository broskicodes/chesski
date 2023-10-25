import { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import { useChessboard } from "../../providers/ChessboardProvider";
import {
  ScreenSize,
  ScreenSizeBoardMap,
  useSidebar,
} from "../../providers/SidebarProvider";
import { DarkSquares } from "../../utils/types";

interface Props {
  clearCache: () => void;
}

export const Board = ({ clearCache }: Props) => {
  const [boardSize, setBoardSize] = useState(512);

  const { screenSize, screenWidth } = useSidebar();
  const {
    game,
    orientation,
    highlightedMoves,
    highlightedSquares,
    arrows,
    onDropVersus,
    makeMove,
    addArrows,
    addHighlightedSquares,
    resetHighlightedMoves,
  } = useChessboard();

  useEffect(() => {
    switch (screenSize) {
      case ScreenSize.Mobile: {
        setBoardSize(screenWidth - 36);
        break;
      }
      default:
        setBoardSize(ScreenSizeBoardMap[screenSize ?? ScreenSize.Mobile]);
    }
  }, [screenSize, screenWidth]);

  return (
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

        resetHighlightedMoves(game.moves({ square: sqr, verbose: true }));
        addHighlightedSquares([], true);
        addArrows([], true);
      }}
      onSquareRightClick={(sqr) => {
        addHighlightedSquares([sqr], false);
      }}
      customSquareStyles={(() => {
        const sqrStyles: { [key: string]: {} } = {};
        highlightedSquares.forEach((sqr) => {
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
              game.get(sqr.to) &&
              game.get(sqr.from).color !== game.get(sqr.to).color
                ? "radial-gradient(circle, rgba(0,0,0,.1) 75%, transparent 10%)"
                : "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 10%)",
          };
        });
        return sqrStyles;
      })()}
      customArrows={arrows}
      boardOrientation={orientation}
      boardWidth={boardSize}
    />
  );
};
