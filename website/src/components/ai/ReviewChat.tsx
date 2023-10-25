"use client";

import { Message, nanoid } from "ai";
import { useGpt } from "../../providers/GptProvider";
import { Chat } from "./Chat";
import { use, useCallback, useEffect, useState } from "react";
import { Player, useChessboard } from "../../providers/ChessboardProvider";
import { ActionType, ChatAction } from "./ChatAction";
import { Suggestions } from "./Suggestions";

interface Props {
  pgn: string;
  // orientation: Player;
}

export const ReviewChat = ({ pgn }: Props) => {
  const { setBody, getInitialSuggestions } = useGpt();
  const { game, orientation } = useChessboard();
  const [isInit, setIsInit] = useState(false);

  useEffect(() => {
    setBody({
      fullPgn: pgn,
      orientation,
      boardPos: game.fen(),
    });
  }, [pgn, orientation, game, setBody]);

  useEffect(() => {
    if (!isInit) {
      setIsInit(true);
      getInitialSuggestions();
    }
  }, [isInit, getInitialSuggestions]);

  return (
    <Chat>
      {/* <ChatAction type={ActionType.ReviewOptions} defaultDisplay={true} /> */}
      <Suggestions />
    </Chat>
  );
};
