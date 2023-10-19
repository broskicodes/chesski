"use client";

import { useGpt } from "../../providers/GptProvider";
import { Chat } from "./Chat";
import { use, useCallback, useEffect, useState } from "react";
import { Player, useChessboard } from "../../providers/ChessboardProvider";

interface Props {
  pgn: string;
  // orientation: Player;
}

export const ReviewChat = ({ pgn }: Props) => {
  const { setBody } = useGpt();
  const { game, orientation } = useChessboard();

  useEffect(() => {
    setBody({
      fullPgn: pgn,
      orientation,
      boardPos: game.fen(),
    });
  }, [pgn, orientation, game, setBody]);

  return <Chat></Chat>;
};
