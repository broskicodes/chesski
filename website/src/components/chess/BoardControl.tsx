import { Button } from "../display/Button";
import { Tooltip } from "../display/Tooltip";
import { FlipBoardIcon } from "../icons/FlibBoardIcon";
import { UndoArrowIcon } from "../icons/UndoArrowIcon";
import { ResetIcon } from "../icons/ResetIcon";
import { useChessboard } from "../../providers/ChessboardProvider";
import { PropsWithChildren, useEffect, useState } from "react";
import { ScreenSize, useSidebar } from "../../providers/SidebarProvider";

interface Props extends PropsWithChildren {
  clearCache: () => void;
  // iconSize: number
}

export const BoardControl = ({ clearCache, children }: Props) => {
  const { screenSize } = useSidebar();
  const { undo, swapOrientation, reset } = useChessboard();

  const [iconSize, setIconSize] = useState(1.3);

  useEffect(() => {
    setIconSize(screenSize === ScreenSize.Mobile ? 1 : 1.3);
  }, [screenSize]);

  return (
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
              // restartEngine(ENGINE);
              reset();
              clearCache();
            }}
          >
            <ResetIcon height={iconSize} />
          </Button>
        </Tooltip>
      </div>
      <div className="flex flex-row space-x-3">{children}</div>
    </div>
  );
};
