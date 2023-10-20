import { ReactNode, useCallback } from "react";
import { useChessboard } from "../../providers/ChessboardProvider";
import { ScreenSize, useSidebar } from "../../providers/SidebarProvider";
import { SizedDiv } from "../display/SizedDiv";

interface Props {
  className?: string;
  moves: { san: string; fen: string }[];
}

export const MoveList = ({ moves, className }: Props) => {
  const { game, setPosition } = useChessboard();
  const { screenSize, screenWidth } = useSidebar();

  const renderList = useCallback(() => {
    const rows: ReactNode[] = [];
    for (let i = 0; i < moves.length / 2; i++) {
      rows.push(
        <tr key={i}>
          <th className="bg-slate-200 w-12">{i + 1}.</th>
          {moves.slice(2 * i, 2 * i + 2).map((m) => (
            <td
              key={m.fen}
              className={`${
                m.fen === game.fen() ? "bg-red-200" : "bg-slate-100"
              } w-[128px] sm:w-24 pl-2 cursor-pointer hover:bg-red-300`}
              onClick={() => {
                setPosition(m.fen);
              }}
            >
              {m.san}
            </td>
          ))}
        </tr>,
      );
    }

    return (
      <table className={""}>
        <tbody>{rows}</tbody>
      </table>
    );
  }, [moves, game, setPosition]);

  return (
    <SizedDiv
      className={`flex overflow-y-auto ${className}`}
      height={screenSize === ScreenSize.Mobile ? 12 : 29}
    >
      {renderList()}
    </SizedDiv>
  );
};
